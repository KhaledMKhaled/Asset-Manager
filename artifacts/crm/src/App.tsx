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

// Dashboard variants
import MediaDashboardPage from "@/pages/dashboard/media";
import SalesDashboardPage from "@/pages/dashboard/sales";
import SmarketingDashboardPage from "@/pages/dashboard/smarketing";
import MessagingDashboardPage from "@/pages/dashboard/messaging";
import AiContinuityDashboardPage from "@/pages/dashboard/ai-continuity";

// Settings pages
import SettingsPage from "@/pages/settings/index";
import UsersSettingsPage from "@/pages/settings/users";
import KpisSettingsPage from "@/pages/settings/kpis";
import FunnelSettingsPage from "@/pages/settings/funnel";
import IntegrationsSettingsPage from "@/pages/settings/integrations";
import ScoringSettingsPage from "@/pages/settings/scoring";
import PipelinesSettingsPage from "@/pages/settings/pipelines";
import WorkflowsSettingsPage from "@/pages/settings/workflows";
import FieldsSettingsPage from "@/pages/settings/fields";
import ChannelsSettingsPage from "@/pages/settings/channels";
import TemplatesSettingsPage from "@/pages/settings/templates";
import RoutingSettingsPage from "@/pages/settings/routing";
import NotificationsSettingsPage from "@/pages/settings/notifications";
import AuditSettingsPage from "@/pages/settings/audit";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />

      {/* Dashboards */}
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/media" component={MediaDashboardPage} />
      <Route path="/dashboard/sales" component={SalesDashboardPage} />
      <Route path="/dashboard/smarketing" component={SmarketingDashboardPage} />
      <Route path="/dashboard/messaging" component={MessagingDashboardPage} />
      <Route path="/dashboard/ai-continuity" component={AiContinuityDashboardPage} />

      {/* Core CRM */}
      <Route path="/leads/new" component={NewLeadPage} />
      <Route path="/leads/:id" component={LeadDetailPage} />
      <Route path="/leads" component={LeadsPage} />
      <Route path="/contacts" component={ContactsPage} />
      <Route path="/companies" component={CompaniesPage} />
      <Route path="/opportunities" component={OpportunitiesPage} />
      <Route path="/pipeline" component={PipelinePage} />
      <Route path="/tasks" component={TasksPage} />

      {/* Inbox */}
      <Route path="/inbox/:id" component={ConversationPage} />
      <Route path="/inbox" component={InboxPage} />

      {/* Campaigns & Workflows */}
      <Route path="/campaigns" component={CampaignsPage} />
      <Route path="/workflows" component={WorkflowsPage} />

      {/* Settings */}
      <Route path="/settings/users" component={UsersSettingsPage} />
      <Route path="/settings/kpis" component={KpisSettingsPage} />
      <Route path="/settings/funnel" component={FunnelSettingsPage} />
      <Route path="/settings/integrations" component={IntegrationsSettingsPage} />
      <Route path="/settings/scoring" component={ScoringSettingsPage} />
      <Route path="/settings/pipelines" component={PipelinesSettingsPage} />
      <Route path="/settings/workflows" component={WorkflowsSettingsPage} />
      <Route path="/settings/fields" component={FieldsSettingsPage} />
      <Route path="/settings/channels" component={ChannelsSettingsPage} />
      <Route path="/settings/templates" component={TemplatesSettingsPage} />
      <Route path="/settings/routing" component={RoutingSettingsPage} />
      <Route path="/settings/notifications" component={NotificationsSettingsPage} />
      <Route path="/settings/audit" component={AuditSettingsPage} />
      <Route path="/settings" component={SettingsPage} />

      {/* Default & 404 */}
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
