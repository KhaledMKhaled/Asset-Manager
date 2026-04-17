"use client";

import {
  getGetDashboardSummaryQueryKey,
  getGetFunnelOverviewQueryKey,
  getGetInboxSummaryQueryKey,
  getGetKpiValuesQueryKey,
  getGetLeadSourceBreakdownQueryKey,
  getGetRecentActivityQueryKey,
  getGetScoreDistributionQueryKey,
  getGetTeamPerformanceQueryKey,
  useGetDashboardSummary,
  useGetFunnelOverview,
  useGetInboxSummary,
  useGetKpiValues,
  useGetLeadSourceBreakdown,
  useGetRecentActivity,
  useGetScoreDistribution,
  useGetTeamPerformance,
} from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard, StatCard } from "@/components/crm/blocks";
import { ScoreBadge, StatusBadge } from "@/components/crm/badges";

export default function DashboardPage() {
  const { data: summary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });
  const { data: funnel } = useGetFunnelOverview({
    query: { queryKey: getGetFunnelOverviewQueryKey() },
  });
  const { data: inbox } = useGetInboxSummary({
    query: { queryKey: getGetInboxSummaryQueryKey() },
  });
  const { data: kpis } = useGetKpiValues({
    query: { queryKey: getGetKpiValuesQueryKey() },
  });
  const { data: sources } = useGetLeadSourceBreakdown({
    query: { queryKey: getGetLeadSourceBreakdownQueryKey() },
  });
  const { data: activity } = useGetRecentActivity(
    { limit: 6 },
    { query: { queryKey: getGetRecentActivityQueryKey({ limit: 6 }) } },
  );
  const { data: scores } = useGetScoreDistribution({
    query: { queryKey: getGetScoreDistributionQueryKey() },
  });
  const { data: team } = useGetTeamPerformance({
    query: { queryKey: getGetTeamPerformanceQueryKey() },
  });

  return (
    <AppShell
      description="Scope 1 through scope 11 are surfaced here as an executive control layer with funnel, team, inbox, scoring, and KPI visibility."
      title="Executive dashboard"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard helper="All captured prospects" label="Total leads" value={summary?.totalLeads ?? 0} />
        <StatCard helper="Marketing qualified" label="MQL" value={summary?.totalMql ?? 0} />
        <StatCard helper="Open active conversations" label="Open inbox" value={summary?.openConversations ?? 0} />
        <StatCard helper="Paid opportunities" label="Revenue" value={`SAR ${(summary?.totalRevenue ?? 0).toLocaleString()}`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard description="Live distribution across the configured funnel." title="Funnel overview">
          <div className="space-y-3">
            {funnel?.length ? funnel.map((stage) => (
              <div key={stage.stageId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{stage.stageName}</span>
                  <span className="font-semibold">{stage.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: stage.color ?? "#06b6d4",
                      width: `${Math.max(stage.count * 8, 10)}%`,
                    }}
                  />
                </div>
              </div>
            )) : <p className="text-sm text-muted">No funnel stages are available yet.</p>}
          </div>
        </SectionCard>

        <SectionCard description="Cross-channel conversation load and SLA health." title="Inbox summary">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Open" value={inbox?.totalOpen ?? 0} />
            <StatCard label="Unread" value={inbox?.totalUnread ?? 0} />
            <StatCard label="SLA breached" value={inbox?.slaBreached ?? 0} />
          </div>
          <div className="mt-4 space-y-2">
            {inbox?.byChannel?.map((channel) => (
              <div key={channel.channel} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-sm">
                <span className="capitalize">{channel.channel}</span>
                <span className="text-muted">
                  {channel.count} open / {channel.unreadCount} unread
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard description="Pinned KPI definitions from the dynamic KPI builder." title="Pinned KPIs">
          <div className="space-y-3">
            {kpis?.filter((item) => item.isPinned).map((kpi) => (
              <div key={kpi.kpiId} className="rounded-2xl bg-white/70 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{kpi.name}</p>
                    <p className="text-xs text-muted">{kpi.kpiType.replaceAll("_", " ")}</p>
                  </div>
                  <StatusBadge value={kpi.status} />
                </div>
                <p className="mt-3 text-2xl font-semibold">{kpi.value ?? "-"}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard description="Lead source mix from acquisition through qualification." title="Lead sources">
          <div className="space-y-3">
            {sources?.map((source) => (
              <div key={source.source}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{source.source}</span>
                  <span className="font-semibold">{source.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-amber-400" style={{ width: `${source.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard description="AI scoring coverage across the current lead pool." title="Score distribution">
          <div className="space-y-3">
            {scores?.map((item) => (
              <div key={item.grade} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                <ScoreBadge grade={item.grade} />
                <span className="text-sm font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SectionCard description="Timeline-centric customer and system activity." title="Recent activity">
          <div className="space-y-3">
            {activity?.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white/70 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{item.title}</p>
                  <span className="text-xs text-muted">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                {item.description ? <p className="mt-1 text-sm text-muted">{item.description}</p> : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard description="Team performance against lead handling and closed revenue." title="Team performance">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Assigned leads</th>
                  <th className="pb-3">Tasks done</th>
                  <th className="pb-3">Deals won</th>
                </tr>
              </thead>
              <tbody>
                {team?.map((member) => (
                  <tr key={member.userId} className="border-t border-slate-200/70">
                    <td className="py-3 font-medium">{member.userName}</td>
                    <td className="py-3">{member.leadsAssigned}</td>
                    <td className="py-3">{member.tasksDone}</td>
                    <td className="py-3">{member.dealsWon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
