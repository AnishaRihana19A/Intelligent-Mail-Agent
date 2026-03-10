import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useCampaign, useUpdateCampaign, useGenerateEmail, useSendEmail, useDeleteCampaign } from "@/hooks/use-campaigns";
import { useTemplates } from "@/hooks/use-templates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Sparkles, Send, Building2, FileText, CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function CampaignDetailPage() {
  const { id } = useParams();
  const campaignId = parseInt(id || "0");
  const [, setLocation] = useLocation();

  const { data: campaign, isLoading, isError } = useCampaign(campaignId);
  const { data: templates = [] } = useTemplates();

  const updateCampaign = useUpdateCampaign();
  const generateEmail = useGenerateEmail();
  const sendEmail = useSendEmail();
  const deleteCampaign = useDeleteCampaign();

  const [editedEmail, setEditedEmail] = useState("");

  // Sync state when campaign data loads or updates
  useEffect(() => {
    if (campaign?.generatedEmail) {
      setEditedEmail(campaign.generatedEmail);
    }
  }, [campaign?.generatedEmail]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !campaign) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl text-white mb-2">Campaign not found</h2>
          <Link href="/campaigns">
            <Button variant="ghost" className="text-primary">Return to Campaigns</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const template = campaign.templateId ? templates.find(t => t.id === campaign.templateId) : null;
  const isDirty = editedEmail !== (campaign.generatedEmail || "");

  const handleSave = () => {
    updateCampaign.mutate({ id: campaignId, data: { generatedEmail: editedEmail } });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      deleteCampaign.mutate(campaignId, {
        onSuccess: () => setLocation("/campaigns")
      });
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/campaigns">
          <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-white -ml-2 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold text-white">{campaign.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                  ${campaign.status === 'sent' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  campaign.status === 'generated' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}
              >
                {campaign.status}
              </span>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" /> {campaign.targetCompany}
              <span className="text-border mx-2">•</span>
              Created {campaign.createdAt ? format(new Date(campaign.createdAt), "MMM d, yyyy") : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent"
              onClick={handleDelete}
              disabled={deleteCampaign.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>

            {campaign.status !== 'sent' && (
              <Button
                onClick={() => sendEmail.mutate(campaignId)}
                disabled={!campaign.generatedEmail || sendEmail.isPending || isDirty}
                className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40"
              >
                {sendEmail.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Email
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="bg-card border-white/5 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-display">Target Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Company Description</label>
                <p className="text-sm text-zinc-300 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/50">
                  {campaign.companyDescription}
                </p>
              </div>

              {template && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Applied Template</label>
                  <div className="flex items-center gap-2 text-sm text-zinc-300 bg-purple-500/5 p-3 rounded-lg border border-purple-500/20">
                    <FileText className="h-4 w-4 text-purple-400" />
                    <span className="font-medium">{template.name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Email Editor */}
        <div className="lg:col-span-8">
          <Card className="bg-card border-white/5 shadow-xl h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-background/50 py-4">
              <div>
                <CardTitle className="text-lg font-display">Email Draft</CardTitle>
                <CardDescription>Review and edit the AI-generated content before sending</CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {isDirty && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSave}
                    disabled={updateCampaign.isPending}
                  >
                    {updateCampaign.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                )}

                {campaign.status !== 'sent' && (
                  <Button
                    variant={campaign.generatedEmail ? "outline" : "default"}
                    size="sm"
                    onClick={() => generateEmail.mutate(campaignId)}
                    disabled={generateEmail.isPending}
                    className={!campaign.generatedEmail ? "bg-primary text-primary-foreground" : "border-primary/50 text-primary hover:bg-primary/10"}
                  >
                    {generateEmail.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {campaign.generatedEmail ? "Regenerate" : "Generate with AI"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col relative min-h-[400px]">
              {campaign.status === 'sent' && (
                <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-card border border-green-500/30 p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-white mb-2">Email Sent</h3>
                    <p className="text-muted-foreground text-sm">This campaign is locked because the email has already been dispatched.</p>
                  </div>
                </div>
              )}

              <Textarea
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                placeholder="Click 'Generate with AI' to draft your email..."
                className="flex-1 w-full h-full min-h-[400px] border-0 focus-visible:ring-0 rounded-none bg-transparent p-6 font-mono text-sm leading-relaxed text-zinc-300 resize-none"
                readOnly={campaign.status === 'sent'}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
