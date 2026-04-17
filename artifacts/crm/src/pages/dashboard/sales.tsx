import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Target, CheckSquare, TrendingUp, AlertCircle, Phone } from "lucide-react";

const weeklyActivity = [
  { day: "Sun", calls: 12, demos: 3, tasks: 8 },
  { day: "Mon", calls: 18, demos: 5, tasks: 12 },
  { day: "Tue", calls: 22, demos: 4, tasks: 15 },
  { day: "Wed", calls: 15, demos: 6, tasks: 10 },
  { day: "Thu", calls: 20, demos: 4, tasks: 14 },
];

const repPerformance = [
  { name: "Ahmed Hassan", leads: 45, contacted: 38, demos: 12, won: 5, slaRate: 92 },
  { name: "Sarah Ali", leads: 38, contacted: 35, demos: 10, won: 4, slaRate: 96 },
  { name: "Mohammed K.", leads: 42, contacted: 30, demos: 8, won: 3, slaRate: 85 },
  { name: "Nour El-Din", leads: 35, contacted: 28, demos: 7, won: 2, slaRate: 88 },
];

const conversionTrend = [
  { week: "W1", rate: 22 },
  { week: "W2", rate: 25 },
  { week: "W3", rate: 28 },
  { week: "W4", rate: 24 },
  { week: "W5", rate: 30 },
];

export default function SalesDashboardPage() {
  const metrics = [
    { label: "Active Leads", value: "156", icon: Users, color: "text-blue-400" },
    { label: "Contacted Today", value: "28", icon: Phone, color: "text-green-400" },
    { label: "Demos This Week", value: "15", icon: Target, color: "text-purple-400" },
    { label: "Tasks Due Today", value: "12", icon: CheckSquare, color: "text-yellow-400" },
    { label: "Win Rate", value: "28%", icon: TrendingUp, color: "text-cyan-400" },
    { label: "Overdue Tasks", value: "4", icon: AlertCircle, color: "text-red-400" },
  ];

  return (
    <AppShell title="Sales Dashboard">
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Activity</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="demos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tasks" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Conversion Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={conversionTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Rep Performance Table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Rep Performance</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left pb-2 font-medium">Rep</th>
                  <th className="text-center pb-2 font-medium">Leads</th>
                  <th className="text-center pb-2 font-medium">Contacted</th>
                  <th className="text-center pb-2 font-medium">Demos</th>
                  <th className="text-center pb-2 font-medium">Won</th>
                  <th className="text-center pb-2 font-medium">SLA %</th>
                </tr>
              </thead>
              <tbody>
                {repPerformance.map((r) => (
                  <tr key={r.name} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{r.name}</td>
                    <td className="py-2 text-center text-muted-foreground">{r.leads}</td>
                    <td className="py-2 text-center text-foreground">{r.contacted}</td>
                    <td className="py-2 text-center text-purple-400">{r.demos}</td>
                    <td className="py-2 text-center text-green-400">{r.won}</td>
                    <td className={`py-2 text-center font-medium ${r.slaRate >= 90 ? "text-green-400" : r.slaRate >= 80 ? "text-yellow-400" : "text-red-400"}`}>
                      {r.slaRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
