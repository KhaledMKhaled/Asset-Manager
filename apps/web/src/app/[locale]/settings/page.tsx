"use client";

import {
  getListBotFlowsQueryKey,
  getListChannelAccountsQueryKey,
  getListCustomFieldsQueryKey,
  getListFunnelStagesQueryKey,
  getListIntegrationsQueryKey,
  getListKpiDefinitionsQueryKey,
  getListPipelinesQueryKey,
  getListScoringModelsQueryKey,
  getListSettingsQueryKey,
  getListUsersQueryKey,
  useListBotFlows,
  useListChannelAccounts,
  useListCustomFields,
  useListFunnelStages,
  useListIntegrations,
  useListKpiDefinitions,
  useListPipelines,
  useListScoringModels,
  useListSettings,
  useListUsers,
} from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard, StatCard } from "@/components/crm/blocks";

export default function SettingsPage() {
  const { data: users } = useListUsers(undefined, { query: { queryKey: getListUsersQueryKey() } });
  const { data: kpis } = useListKpiDefinitions({ query: { queryKey: getListKpiDefinitionsQueryKey() } });
  const { data: stages } = useListFunnelStages({ query: { queryKey: getListFunnelStagesQueryKey() } });
  const { data: pipelines } = useListPipelines({ query: { queryKey: getListPipelinesQueryKey() } });
  const { data: scoring } = useListScoringModels({ query: { queryKey: getListScoringModelsQueryKey() } });
  const { data: integrations } = useListIntegrations({ query: { queryKey: getListIntegrationsQueryKey() } });
  const { data: fields } = useListCustomFields(undefined, { query: { queryKey: getListCustomFieldsQueryKey() } });
  const { data: channels } = useListChannelAccounts({ query: { queryKey: getListChannelAccountsQueryKey() } });
  const { data: botFlows } = useListBotFlows({ query: { queryKey: getListBotFlowsQueryKey() } });
  const { data: settings } = useListSettings({ query: { queryKey: getListSettingsQueryKey() } });

  return (
    <AppShell description="Dynamic configuration center for users, KPI builder, funnels, scoring, integrations, channels, and AI continuity controls." title="Settings">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Users" value={users?.length ?? 0} />
        <StatCard label="KPIs" value={kpis?.length ?? 0} />
        <StatCard label="Funnel stages" value={stages?.length ?? 0} />
        <StatCard label="Integrations" value={integrations?.length ?? 0} />
        <StatCard label="Custom fields" value={fields?.length ?? 0} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SectionCard description="Zero-code admin surfaces called out directly in the implementation plan." title="Configuration modules">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Pipelines", pipelines?.length ?? 0],
              ["Scoring models", scoring?.length ?? 0],
              ["Channel accounts", channels?.length ?? 0],
              ["Bot flows", botFlows?.length ?? 0],
              ["System settings", settings?.length ?? 0],
              ["Pinned KPIs", kpis?.filter((item) => item.isPinned).length ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] bg-white/70 px-4 py-4">
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard description="Live system key-value settings pulled from the configuration store." title="Current settings">
          <div className="space-y-3">
            {settings?.map((item) => (
              <div key={item.key} className="rounded-[1.5rem] bg-white/70 px-4 py-4">
                <p className="font-semibold">{item.key}</p>
                <p className="mt-2 text-sm text-muted">{JSON.stringify(item.value)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
