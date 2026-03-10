import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CampaignsPage from "@/pages/campaigns";
import CampaignDetailPage from "@/pages/campaign-detail";
import TemplatesPage from "@/pages/templates";
import IntegrationsPage from "@/pages/integrations";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/campaigns" component={CampaignsPage} />
      <Route path="/campaigns/:id" component={CampaignDetailPage} />
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/integrations" component={IntegrationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
