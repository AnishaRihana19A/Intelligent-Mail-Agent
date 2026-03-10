import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plug, CheckCircle2, XCircle, AlertTriangle, Table2, HardDrive, Mail, Users2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SheetsImportDialog } from "@/components/sheets-import-dialog";

interface GoogleStatus {
  configured: boolean;
  connected: boolean;
  drive: boolean;
  sheets: boolean;
}

type ConnectorId = "gmail" | "sheets" | "drive" | "hubspot";

const CONNECTORS: {
  id: ConnectorId;
  name: string;
  description: string;
  icon: React.ElementType;
  google?: boolean;
}[] = [
    {
      id: "gmail",
      name: "Google Mail",
      description: "Send emails directly from your Gmail account.",
      icon: Mail,
      google: false,
    },
    {
      id: "sheets",
      name: "Google Sheets",
      description: "Import campaign targets from a spreadsheet and export results.",
      icon: Table2,
      google: true,
    },
    {
      id: "drive",
      name: "Google Drive",
      description: "Access brand assets, export generated emails to Drive.",
      icon: HardDrive,
      google: true,
    },
    {
      id: "hubspot",
      name: "HubSpot CRM",
      description: "Sync contacts and log communication history.",
      icon: Users2,
      google: false,
    },
  ];

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [sheetsDialogOpen, setSheetsDialogOpen] = useState(false);

  // Notify the user if they just returned from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "connected") {
      toast({ title: "Google connected!", description: "Drive and Sheets are now linked." });
      window.history.replaceState({}, "", "/integrations");
    } else if (params.get("google") === "error") {
      toast({ title: "Google connection failed", description: "Please try again.", variant: "destructive" });
      window.history.replaceState({}, "", "/integrations");
    }
  }, []);

  // Fetch real Google connection status
  const { data: googleStatus, isLoading: loadingStatus, refetch } = useQuery<GoogleStatus>({
    queryKey: ["/api/google/status"],
    queryFn: async () => {
      const res = await fetch("/api/google/status", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch status");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5s to detect OAuth callback
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/google/disconnect", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Disconnected", description: "Google account disconnected." });
    },
  });

  const handleConnect = (id: ConnectorId) => {
    if (id === "drive" || id === "sheets") {
      if (!googleStatus?.configured) {
        toast({
          title: "Not configured",
          description: "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file first.",
          variant: "destructive",
        });
        return;
      }
      window.location.href = "/api/google/auth";
    } else {
      toast({
        title: "Coming soon",
        description: `${id === "gmail" ? "Gmail" : "HubSpot"} integration is not yet available.`,
      });
    }
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const isConnected = (id: ConnectorId): boolean => {
    if (id === "drive") return googleStatus?.drive ?? false;
    if (id === "sheets") return googleStatus?.sheets ?? false;
    return false;
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Integrations</h1>
        <p className="text-muted-foreground">Connect external services to power up your agent.</p>
      </div>

      {/* Google status banner */}
      {googleStatus && !googleStatus.configured && (
        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">Google credentials not set.</span>{" "}
            Add <code className="bg-amber-500/10 px-1 rounded">GOOGLE_CLIENT_ID</code> and{" "}
            <code className="bg-amber-500/10 px-1 rounded">GOOGLE_CLIENT_SECRET</code> to your{" "}
            <code className="bg-amber-500/10 px-1 rounded">.env</code> file to enable Drive &amp; Sheets.
          </div>
        </div>
      )}

      {loadingStatus ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONNECTORS.map((connector) => {
            const connected = isConnected(connector.id);
            const Icon = connector.icon;

            return (
              <Card
                key={connector.id}
                className="bg-card border-white/5 shadow-xl shadow-black/10 flex flex-col hover:border-white/10 transition-all"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center border
                        ${connected
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : "bg-secondary border-border text-muted-foreground"
                        }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-display text-white">
                        {connector.name}
                      </CardTitle>
                      <div className="flex items-center mt-1">
                        {connected ? (
                          <span className="flex items-center text-xs font-medium text-green-400">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            Not connected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-2 flex-1 flex flex-col justify-between gap-3">
                  <p className="text-sm text-zinc-400 line-clamp-2">{connector.description}</p>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
                    {!connected ? (
                      <Button
                        className="w-full bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg shadow-white/5"
                        onClick={() => handleConnect(connector.id)}
                        disabled={connector.google && !googleStatus?.configured}
                      >
                        <Plug className="h-4 w-4 mr-2" /> Connect Account
                      </Button>
                    ) : (
                      <>
                        {/* Extra actions when connected */}
                        {connector.id === "sheets" && (
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => setSheetsDialogOpen(true)}
                          >
                            <Table2 className="h-4 w-4 mr-2" /> Import from Sheets
                          </Button>
                        )}
                        {connector.id === "drive" && (
                          <Button
                            variant="outline"
                            className="w-full border-white/10 text-zinc-300 hover:bg-zinc-800"
                            onClick={() => toast({ title: "Drive", description: "Drive file browser coming soon." })}
                          >
                            <HardDrive className="h-4 w-4 mr-2" /> Browse Drive Files
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={handleDisconnect}
                          disabled={disconnectMutation.isPending}
                        >
                          {disconnectMutation.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Disconnect Google
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SheetsImportDialog open={sheetsDialogOpen} onOpenChange={setSheetsDialogOpen} />
    </AppLayout>
  );
}
