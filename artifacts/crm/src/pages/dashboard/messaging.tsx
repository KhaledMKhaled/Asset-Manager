import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MessageSquare, Clock, Users, AlertTriangle, CheckCircle, Zap } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const channelVolume = [
  { channel: "WhatsApp", open: 45, resolved: 120, breached: 3 },
  { channel: "Messenger", open: 18, resolved: 65, breached: 1 },
  { channel: "Instagram", open: 8, resolved: 32, breached: 2 },
];

const statusBreakdown = [
  { name: "Open", value: 71 },
  { name: "Waiting", value: 25 },
  { name: "Bot Active", value: 15 },
  { name: "Resolved", value: 217 },
  { name: "Breached", value: 6 },
];

const agentMetrics = [
  { name: "Sarah Ali", open: 12, avgResponse: "2 min", resolved: 45, satisfaction: 4.8 },
  { name: "Ahmed Hassan", open: 8, avgResponse: "5 min", resolved: 38, satisfaction: 4.5 },
  { name: "Mohammed K.", open: 15, avgResponse: "8 min", resolved: 30, satisfaction: 4.2 },
  { name: "AI Bot", open: 15, avgResponse: "instant", resolved: 22, satisfaction: 3.9 },
];

export default function MessagingDashboardPage() {
  const metrics = [
    { label: "Open Conversations", value: "71", icon: MessageSquare, color: "text-blue-400" },
    { label: "Avg Response Time", value: "3.2 min", icon: Clock, color: "text-green-400" },
    { label: "Active Agents", value: "4", icon: Users, color: "text-purple-400" },
    { label: "SLA Compliance", value: "94%", icon: CheckCircle, color: "text-cyan-400" },
    { label: "SLA Breached", value: "6", icon: AlertTriangle, color: "text-red-400" },
    { label: "Bot Handling", value: "15", icon: Zap, color: "text-yellow-400" },
  ];

  return (
    <AppShell title="Messaging Dashboard">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Channel Volume</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={channelVolume}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="channel" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  <Bar dataKey="open" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Open" />
                  <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
                  <Bar dataKey="breached" fill="#ef4444" radius={[4, 4, 0, 0]} name="SLA Breached" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Status Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name }) => name}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Agent Metrics */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Agent Performance</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left pb-2 font-medium">Agent</th>
                  <th className="text-center pb-2 font-medium">Open</th>
                  <th className="text-center pb-2 font-medium">Avg Response</th>
                  <th className="text-center pb-2 font-medium">Resolved</th>
                  <th className="text-center pb-2 font-medium">CSAT</th>
                </tr>
              </thead>
              <tbody>
                {agentMetrics.map((a) => (
                  <tr key={a.name} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{a.name}</td>
                    <td className="py-2 text-center text-muted-foreground">{a.open}</td>
                    <td className="py-2 text-center text-foreground">{a.avgResponse}</td>
                    <td className="py-2 text-center text-green-400">{a.resolved}</td>
                    <td className="py-2 text-center text-yellow-400">{a.satisfaction}/5</td>
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
