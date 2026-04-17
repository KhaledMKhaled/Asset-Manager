import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Users, Target, TrendingUp, Zap, ArrowRight } from "lucide-react";

const funnelData = [
  { stage: "Leads", count: 1200, rate: "100%" },
  { stage: "MQL", count: 480, rate: "40%" },
  { stage: "SQL", count: 192, rate: "16%" },
  { stage: "Demo", count: 96, rate: "8%" },
  { stage: "Signup", count: 58, rate: "4.8%" },
  { stage: "Activated", count: 35, rate: "2.9%" },
  { stage: "Paid", count: 22, rate: "1.8%" },
];

const costProgression = [
  { metric: "CPL", value: 52 },
  { metric: "Cost/MQL", value: 130 },
  { metric: "Cost/SQL", value: 325 },
  { metric: "Cost/Signup", value: 680 },
  { metric: "CAC", value: 2840 },
];

const monthlyTrend = [
  { month: "Jan", leads: 180, mql: 72, sql: 29, paid: 5 },
  { month: "Feb", leads: 220, mql: 88, sql: 35, paid: 7 },
  { month: "Mar", leads: 280, mql: 112, sql: 45, paid: 9 },
  { month: "Apr", leads: 320, mql: 128, sql: 51, paid: 11 },
];

export default function SmarketingDashboardPage() {
  const kpis = [
    { label: "Lead→MQL", value: "40%", icon: Target, color: "text-blue-400" },
    { label: "MQL→SQL", value: "40%", icon: Zap, color: "text-purple-400" },
    { label: "SQL→Signup", value: "30%", icon: TrendingUp, color: "text-green-400" },
    { label: "Signup→Paid", value: "38%", icon: DollarSign, color: "text-yellow-400" },
    { label: "Total CPL", value: "EGP 52", icon: DollarSign, color: "text-cyan-400" },
    { label: "CAC", value: "EGP 2,840", icon: Users, color: "text-red-400" },
  ];

  return (
    <AppShell title="Smarketing Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.label} className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-xl font-bold mt-0.5 text-foreground">{k.value}</p>
                  </div>
                  <Icon className={`h-4 w-4 ${k.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Full Funnel Visualization */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Full Funnel: Ads → Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {funnelData.map((s, i) => (
                <div key={s.stage} className="flex items-center gap-1 shrink-0">
                  <div className="text-center px-4 py-3 rounded-lg bg-muted/30 border border-border/50 min-w-[100px]">
                    <p className="text-lg font-bold text-foreground">{s.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{s.stage}</p>
                    <p className="text-[10px] text-primary mt-0.5">{s.rate}</p>
                  </div>
                  {i < funnelData.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Progression */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Cost Progression</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={costProgression}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Funnel Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="mql" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="sql" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="paid" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
