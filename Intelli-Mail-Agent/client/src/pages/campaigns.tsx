import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useCampaigns, useCreateCampaign } from "@/hooks/use-campaigns";
import { useTemplates } from "@/hooks/use-templates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: templates = [] } = useTemplates();
  const createCampaign = useCreateCampaign();
  
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [templateId, setTemplateId] = useState<string>("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetCompany || !companyDescription) return;
    
    createCampaign.mutate({ 
      name, 
      targetCompany, 
      companyDescription, 
      templateId: templateId ? parseInt(templateId) : null 
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setName("");
        setTargetCompany("");
        setCompanyDescription("");
        setTemplateId("");
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Campaigns</h1>
          <p className="text-muted-foreground">Target companies and generate personalized outreach.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border/50 shadow-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Create Campaign</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Campaign Name</label>
                  <Input 
                    placeholder="e.g., Q4 Enterprise Outreach" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Target Company</label>
                  <Input 
                    placeholder="e.g., Acme Corp" 
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Company Description / Context</label>
                  <Textarea 
                    placeholder="Briefly describe what they do and why we are reaching out..." 
                    className="min-h-[100px] resize-none bg-background/50 border-border"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Email Template (Optional)</label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger className="bg-background/50 border-border">
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (AI decides)</SelectItem>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createCampaign.isPending || !name || !targetCompany || !companyDescription}
                  className="w-full sm:w-auto"
                >
                  {createCampaign.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Campaign
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border/50 rounded-2xl bg-card/20">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-display font-medium text-white mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">Start a new campaign to generate personalized cold emails for your target accounts.</p>
          <Button variant="outline" onClick={() => setIsOpen(true)}>Create Campaign</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-card border-white/5 shadow-xl shadow-black/10 flex flex-col hover:border-white/10 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                    ${campaign.status === 'sent' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      campaign.status === 'generated' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}
                  >
                    {campaign.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {campaign.createdAt ? format(new Date(campaign.createdAt), "MMM d") : ''}
                  </span>
                </div>
                <CardTitle className="text-lg font-display truncate text-white group-hover:text-primary transition-colors">
                  {campaign.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1 text-sm text-zinc-300">
                  <Building2 className="h-3.5 w-3.5" /> {campaign.targetCompany}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {campaign.companyDescription}
                </p>
              </CardContent>
              <div className="p-4 border-t border-border/50 bg-background/30 mt-auto">
                <Link href={`/campaigns/${campaign.id}`}>
                  <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-white group/btn">
                    View Details
                    <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
