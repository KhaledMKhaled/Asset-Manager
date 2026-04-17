import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Bot, ArrowLeftRight, Clock, Star, Shield, Zap } from "lucide-react";

const coverageData = [
  { day: "Mon", aiHandled: 12, humanHandled: 35, handoffs: 4 },
  { day: "Tue", aiHandled: 18, humanHandled: 42, handoffs: 6 },
  { day: "Wed", aiHandled: 15, humanHandled: 38, handoffs: 5 },
  { day: "Thu", aiHandled: 22, humanHandled: 30, handoffs: 7 },
  { day: "Fri", aiHandled: 8, humanHandled: 25, handoffs: 3 },
];

const qualityTrend = [
  { week: "W1", rating: 3.8 },
  { week: "W2", rating: 4.0 },
  { week: "W3", rating: 4.2 },
  { week: "W4", rating: 4.1 },
  { week: "W5", rating: 4.4 },
];

const flowPerformance = [
  { flow: "Welcome Bot", sessions: 45, qualified: 28, handoffs: 12, avgMsgs: 3.2, rating: 4.1 },
  { flow: "After-Hours", sessions: 30, qualified: 15, handoffs: 18, avgMsgs: 4.5, rating: 3.8 },
  { flow: "No-Response Follow-Up", sessions: 22, qualified: 8, handoffs: 5, avgMsgs: 2.1, rating: 4.3 },
  { flow: "Demo Reminder", sessions: 15, qualified: 12, handoffs: 2, avgMsgs: 1.8, rating: 4.6 },
  { flow: "Payment Reminder", sessions: 8, qualified: 5, handoffs: 3, avgMsgs: 2.5, rating: 4.0 },
];

export default function AiContinuityDashboardPage() {
  const metrics = [
    { label: "AI-Handled", value: "75", icon: Bot, color: "text-purple-400" },
    { label: "Coverage Rate", value: "68%", icon: Shield, color: "text-cyan-400" },
    { label: "Handoff Rate", value: "32%", icon: ArrowLeftRight, color: "text-yellow-400" },
    { label: "SLA Saved", value: "23", icon: Clock, color: "text-green-400" },
    { label: "Agent Rating", value: "4.2/5", icon: Star, color: "text-yellow-400" },
    { label: "AI→Qualified", value: "42%", icon: Zap, color: "text-blue-400" },
  ];

  return (
    <AppShell title="AI Continuity Dashboard">
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
            <CardHeader className="pb-2"><CardTitle className="text-sm">AI vs Human Coverage</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={coverageData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  <Bar dataKey="aiHandled" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="AI Handled" />
                  <Bar dataKey="humanHandled" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Human Handled" />
                  <Bar dataKey="handoffs" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Handoffs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Agent Quality Rating Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={qualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[3, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bot Flow Performance */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Bot Flow Performance</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left pb-2 font-medium">Flow</th>
                  <th className="text-center pb-2 font-medium">Sessions</th>
                  <th className="text-center pb-2 font-medium">Qualified</th>
                  <th className="text-center pb-2 font-medium">Handoffs</th>
                  <th className="text-center pb-2 font-medium">Avg Msgs</th>
                  <th className="text-center pb-2 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {flowPerformance.map((f) => (
                  <tr key={f.flow} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{f.flow}</td>
                    <td className="py-2 text-center text-muted-foreground">{f.sessions}</td>
                    <td className="py-2 text-center text-green-400">{f.qualified}</td>
                    <td className="py-2 text-center text-yellow-400">{f.handoffs}</td>
                    <td className="py-2 text-center text-muted-foreground">{f.avgMsgs}</td>
                    <td className="py-2 text-center text-yellow-400">{f.rating}/5</td>
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
