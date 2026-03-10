import { AppLayout } from "@/components/layout/app-layout";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useTemplates } from "@/hooks/use-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, FileText, Activity, Users, ArrowUpRight, Plug } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useCampaigns();
  const { data: templates = [], isLoading: isLoadingTemplates } = useTemplates();

  const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
  const draftCampaigns = campaigns.filter(c => c.status === 'draft').length;

  const stats = [
    {
      title: "Total Campaigns",
      value: campaigns.length,
      icon: Send,
      description: "Active and past campaigns",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Sent Emails",
      value: sentCampaigns,
      icon: Activity,
      description: "Successfully delivered",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Draft Campaigns",
      value: draftCampaigns,
      icon: Users,
      description: "Waiting to be generated",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Saved Templates",
      value: templates.length,
      icon: FileText,
      description: "Available email frameworks",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-10">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2">Overview</h1>
          <p className="text-muted-foreground">Monitor your AI cold calling agent's performance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="bg-card border-white/5 shadow-lg shadow-black/20 hover:border-white/10 transition-colors duration-300 overflow-hidden relative">
                {/* Subtle gradient background shine */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-20 ${stat.bg.replace('/10', '')}`} />

                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-display font-bold text-white">
                    {isLoadingCampaigns || isLoadingTemplates ? "-" : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <Card className="bg-card border-white/5 shadow-xl shadow-black/20 col-span-1">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-display">Recent Campaigns</CardTitle>
              <Link href="/campaigns" className="text-sm text-primary hover:text-primary/80 flex items-center transition-colors">
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingCampaigns ? (
                <div className="p-8 text-center text-muted-foreground">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No campaigns yet. <Link href="/campaigns" className="text-primary hover:underline">Create one</Link>.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="block hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between p-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-white">{campaign.name}</span>
                          <span className="text-sm text-muted-foreground">Target: {campaign.targetCompany}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                            ${campaign.status === 'sent' ? 'bg-green-500/10 text-green-400' :
                              campaign.status === 'generated' ? 'bg-blue-500/10 text-blue-400' :
                                'bg-zinc-500/10 text-zinc-400'}`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5 shadow-xl shadow-black/20 col-span-1">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/campaigns" className="group flex flex-col p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Send className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-white mb-1">New Campaign</h3>
                <p className="text-sm text-muted-foreground">Start reaching out to a new target.</p>
              </Link>
              <Link href="/templates" className="group flex flex-col p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-white mb-1">Create Template</h3>
                <p className="text-sm text-muted-foreground">Draft a new tone for emails.</p>
              </Link>
              <Link href="/integrations" className="group flex flex-col p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-300 sm:col-span-2">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plug className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-white mb-1">Connect Integrations</h3>
                <p className="text-sm text-muted-foreground">Link Google Sheets, Gmail, and CRM to automate workflows.</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
