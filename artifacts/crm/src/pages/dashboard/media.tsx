import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { DollarSign, Eye, MousePointer, Users, TrendingUp, Target } from "lucide-react";

const COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#3b82f6"];

const spendData = [
  { date: "Mon", spend: 2400, leads: 45, cpl: 53 },
  { date: "Tue", spend: 3100, leads: 62, cpl: 50 },
  { date: "Wed", spend: 2800, leads: 51, cpl: 55 },
  { date: "Thu", spend: 3500, leads: 70, cpl: 50 },
  { date: "Fri", spend: 2200, leads: 38, cpl: 58 },
  { date: "Sat", spend: 1500, leads: 28, cpl: 54 },
  { date: "Sun", spend: 800, leads: 15, cpl: 53 },
];

const campaignPerformance = [
  { name: "Ramadan Promo", spend: 15000, leads: 280, cpl: 54, signups: 42, cpa: 357 },
  { name: "E-Invoice Push", spend: 12000, leads: 220, cpl: 55, signups: 35, cpa: 343 },
  { name: "Multi-Branch", spend: 8000, leads: 160, cpl: 50, signups: 28, cpa: 286 },
  { name: "Retargeting", spend: 5000, leads: 110, cpl: 45, signups: 18, cpa: 278 },
];

const channelBreakdown = [
  { name: "Facebook", value: 45 },
  { name: "Instagram", value: 30 },
  { name: "Messenger", value: 15 },
  { name: "WhatsApp", value: 10 },
];

export default function MediaDashboardPage() {
  const metrics = [
    { label: "Total Spend", value: "EGP 16,300", icon: DollarSign, color: "text-red-400" },
    { label: "Impressions", value: "245K", icon: Eye, color: "text-blue-400" },
    { label: "Link Clicks", value: "3,840", icon: MousePointer, color: "text-cyan-400" },
    { label: "Leads Generated", value: "309", icon: Users, color: "text-green-400" },
    { label: "CPL", value: "EGP 52.75", icon: Target, color: "text-yellow-400" },
    { label: "ROAS", value: "3.2x", icon: TrendingUp, color: "text-purple-400" },
  ];

  return (
    <AppShell title="Media Buying Dashboard">
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label} className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-xl font-bold mt-0.5 text-foreground">{m.value}</p>
                  </div>
                  <Icon className={`h-4 w-4 ${m.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spend Trend */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Spend & Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={spendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="spend" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="leads" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Channel Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Channel Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={channelBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} ${value}%`}>
                    {channelBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Performance Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left pb-2 font-medium">Campaign</th>
                    <th className="text-right pb-2 font-medium">Spend</th>
                    <th className="text-right pb-2 font-medium">Leads</th>
                    <th className="text-right pb-2 font-medium">CPL</th>
                    <th className="text-right pb-2 font-medium">Signups</th>
                    <th className="text-right pb-2 font-medium">CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignPerformance.map((c) => (
                    <tr key={c.name} className="border-b border-border/50">
                      <td className="py-2 font-medium text-foreground">{c.name}</td>
                      <td className="py-2 text-right text-muted-foreground">EGP {c.spend.toLocaleString()}</td>
                      <td className="py-2 text-right text-foreground">{c.leads}</td>
                      <td className="py-2 text-right text-muted-foreground">EGP {c.cpl}</td>
                      <td className="py-2 text-right text-green-400">{c.signups}</td>
                      <td className="py-2 text-right text-muted-foreground">EGP {c.cpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
