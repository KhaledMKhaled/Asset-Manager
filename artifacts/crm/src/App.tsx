import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import LeadsPage from "@/pages/leads/index";
import LeadDetailPage from "@/pages/leads/detail";
import NewLeadPage from "@/pages/leads/new";
import ContactsPage from "@/pages/contacts";
import CompaniesPage from "@/pages/companies";
import OpportunitiesPage from "@/pages/opportunities";
import PipelinePage from "@/pages/pipeline";
import TasksPage from "@/pages/tasks";
import InboxPage from "@/pages/inbox/index";
import ConversationPage from "@/pages/inbox/conversation";
import CampaignsPage from "@/pages/campaigns";
import WorkflowsPage from "@/pages/workflows";
import SettingsPage from "@/pages/settings/index";
import UsersSettingsPage from "@/pages/settings/users";
import KpisSettingsPage from "@/pages/settings/kpis";
import FunnelSettingsPage from "@/pages/settings/funnel";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/leads/new" component={NewLeadPage} />
      <Route path="/leads/:id" component={LeadDetailPage} />
      <Route path="/leads" component={LeadsPage} />
      <Route path="/contacts" component={ContactsPage} />
      <Route path="/companies" component={CompaniesPage} />
      <Route path="/opportunities" component={OpportunitiesPage} />
      <Route path="/pipeline" component={PipelinePage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/inbox/:id" component={ConversationPage} />
      <Route path="/inbox" component={InboxPage} />
      <Route path="/campaigns" component={CampaignsPage} />
      <Route path="/workflows" component={WorkflowsPage} />
      <Route path="/settings/users" component={UsersSettingsPage} />
      <Route path="/settings/kpis" component={KpisSettingsPage} />
      <Route path="/settings/funnel" component={FunnelSettingsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/">
        {() => <Redirect to="/dashboard" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
