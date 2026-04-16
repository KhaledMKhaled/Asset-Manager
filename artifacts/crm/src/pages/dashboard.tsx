import { AppShell } from "@/components/layout/AppShell";
import {
  useGetDashboardSummary,
  useGetFunnelOverview,
  useGetLeadSourceBreakdown,
  useGetRecentActivity,
  useGetKpiValues,
  useGetTeamPerformance,
  useGetInboxSummary,
  useGetScoreDistribution,
  getGetDashboardSummaryQueryKey,
  getGetFunnelOverviewQueryKey,
  getGetLeadSourceBreakdownQueryKey,
  getGetRecentActivityQueryKey,
  getGetKpiValuesQueryKey,
  getGetTeamPerformanceQueryKey,
  getGetInboxSummaryQueryKey,
  getGetScoreDistributionQueryKey,
} from "@workspace/api-client-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Users, TrendingUp, DollarSign, MessageSquare, Target, CheckSquare, AlertCircle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScoreBadge } from "@/components/shared/ScoreBadge";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function KpiCard({ name, value, displayType, status, targetValue }: any) {
  const statusColors: Record<string, string> = {
    normal: "border-l-green-500",
    warning: "border-l-yellow-500",
    danger: "border-l-red-500",
  };

  const displayValue =
    displayType === "currency" ? `SAR ${Number(value ?? 0).toLocaleString()}` :
    displayType === "percentage" ? `${(value ?? 0).toFixed(1)}%` :
    (value ?? 0).toLocaleString();

  return (
    <Card className={`border-l-4 ${statusColors[status] ?? "border-l-border"}`}>
      <CardContent className="pt-4 pb-4">
        <p className="text-xs text-muted-foreground mb-1">{name}</p>
        <p data-testid={`kpi-value-${name}`} className="text-2xl font-bold text-foreground">{displayValue}</p>
        {targetValue && (
          <p className="text-xs text-muted-foreground mt-1">
            Target: {displayType === "currency" ? `SAR ${Number(targetValue).toLocaleString()}` : targetValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });
  const { data: funnel } = useGetFunnelOverview({ query: { queryKey: getGetFunnelOverviewQueryKey() } });
  const { data: sources } = useGetLeadSourceBreakdown({ query: { queryKey: getGetLeadSourceBreakdownQueryKey() } });
  const { data: activity } = useGetRecentActivity({ limit: 10 }, { query: { queryKey: getGetRecentActivityQueryKey({ limit: 10 }) } });
  const { data: kpiValues } = useGetKpiValues({ query: { queryKey: getGetKpiValuesQueryKey() } });
  const { data: team } = useGetTeamPerformance({ query: { queryKey: getGetTeamPerformanceQueryKey() } });
  const { data: inbox } = useGetInboxSummary({ query: { queryKey: getGetInboxSummaryQueryKey() } });
  const { data: scoreDistrib } = useGetScoreDistribution({ query: { queryKey: getGetScoreDistributionQueryKey() } });

  const metricCards = summary ? [
    { label: "Total Leads", value: summary.totalLeads, icon: Users, color: "text-blue-400" },
    { label: "MQL", value: summary.totalMql, icon: Target, color: "text-purple-400" },
    { label: "SQL", value: summary.totalSql, icon: Zap, color: "text-yellow-400" },
    { label: "Signups", value: summary.totalSignups, icon: TrendingUp, color: "text-green-400" },
    { label: "Revenue (SAR)", value: `${summary.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
    { label: "Open Conversations", value: summary.openConversations, icon: MessageSquare, color: "text-cyan-400" },
    { label: "Open Tasks", value: summary.openTasks, icon: CheckSquare, color: "text-orange-400" },
    { label: "Overdue Tasks", value: summary.overdueTasks, icon: AlertCircle, color: "text-red-400" },
  ] : [];

  return (
    <AppShell title="Executive Dashboard">
      <div className="space-y-6">
        {/* Metric cards */}
        <div data-testid="section-metrics" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          {summaryLoading
            ? Array(8).fill(0).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))
            : metricCards.map((m) => {
                const Icon = m.icon;
                return (
                  <Card key={m.label} className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p data-testid={`metric-${m.label.toLowerCase().replace(/\s+/g, "-")}`} className="text-xl font-bold mt-0.5 text-foreground">
                          {m.value}
                        </p>
                      </div>
                      <Icon className={`h-4 w-4 ${m.color}`} />
                    </div>
                  </Card>
                );
              })}
        </div>

        {/* KPI values */}
        {kpiValues && kpiValues.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">KPIs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpiValues.filter((k) => k.isPinned).map((k) => (
                <KpiCard key={k.kpiId} {...k} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Funnel Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {funnel && funnel.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={funnel} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="stageName" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No funnel stages configured yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {scoreDistrib && scoreDistrib.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={scoreDistrib} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={70} label={({ grade }) => grade}>
                      {scoreDistrib.map((entry, index) => (
                        <Cell key={entry.grade} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No scored leads yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead sources */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {sources && sources.length > 0 ? (
                <div className="space-y-2">
                  {sources.slice(0, 6).map((s) => (
                    <div key={s.source} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20 truncate">{s.source}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${s.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-10 text-right">{s.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">No lead source data</div>
              )}
            </CardContent>
          </Card>

          {/* Inbox summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Inbox Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {inbox ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Open", value: inbox.totalOpen, color: "text-blue-400" },
                      { label: "Unread", value: inbox.totalUnread, color: "text-yellow-400" },
                      { label: "SLA Breached", value: inbox.slaBreached, color: "text-red-400" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-muted/30 p-2">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {inbox.byChannel?.map((ch) => (
                      <div key={ch.channel} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-foreground">{ch.channel}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">{ch.count} open</span>
                          {ch.unreadCount > 0 && (
                            <span className="text-xs font-medium text-yellow-400">{ch.unreadCount} unread</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">No inbox data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent activity + Team performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity && activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{ev.title}</p>
                        {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {new Date(ev.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">No activity yet</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {team && team.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left pb-2 font-medium">Agent</th>
                        <th className="text-center pb-2 font-medium">Leads</th>
                        <th className="text-center pb-2 font-medium">Tasks Done</th>
                        <th className="text-center pb-2 font-medium">Deals Won</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.slice(0, 5).map((u) => (
                        <tr key={u.userId} className="border-b border-border/50">
                          <td className="py-2 font-medium text-foreground">{u.userName}</td>
                          <td className="py-2 text-center text-muted-foreground">{u.leadsAssigned}</td>
                          <td className="py-2 text-center text-muted-foreground">{u.tasksDone}</td>
                          <td className="py-2 text-center text-green-400">{u.dealsWon}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">No team data yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
