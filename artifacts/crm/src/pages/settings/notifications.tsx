import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Bell, Plus } from "lucide-react";
import { Link } from "wouter";

const eventTypes = [
  { event: "New lead assigned", recipients: "Assigned agent", enabled: true },
  { event: "Task created", recipients: "Task owner", enabled: true },
  { event: "Task becoming due", recipients: "Task owner (configurable before)", enabled: true },
  { event: "Task overdue", recipients: "Task owner + manager", enabled: true },
  { event: "SLA breach", recipients: "Manager", enabled: true },
  { event: "Stage changed", recipients: "Owner + manager", enabled: true },
  { event: "High-priority lead", recipients: "Assigned agent", enabled: true },
  { event: "Payment received", recipients: "Sales + management", enabled: false },
  { event: "Activation completed", recipients: "Onboarding + management", enabled: false },
  { event: "AI flagged high-risk", recipients: "Assigned agent + manager", enabled: true },
  { event: "Workflow failure", recipients: "Admin", enabled: true },
];

const reminderTypes = [
  { type: "Immediate", behavior: "Fires right away", icon: "⚡" },
  { type: "Scheduled", behavior: "Fires at specific time", icon: "⏰" },
  { type: "Repeated", behavior: "Fires every X minutes until acknowledged", icon: "🔄" },
  { type: "Escalation", behavior: "If not acknowledged, escalate to manager", icon: "⬆️" },
];

export default function NotificationsSettingsPage() {
  return (
    <AppShell title="Notifications & Reminders">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
        </div>

        {/* Notification Events */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Notification Events</h3>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="space-y-2">
                {eventTypes.map((e) => (
                  <div key={e.event} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{e.event}</p>
                      <p className="text-[10px] text-muted-foreground">{e.recipients}</p>
                    </div>
                    <div className={`w-8 h-4 rounded-full flex items-center cursor-pointer transition-colors ${
                      e.enabled ? "bg-primary justify-end" : "bg-muted justify-start"
                    }`}>
                      <div className="w-3 h-3 rounded-full bg-white mx-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reminder Types */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Reminder Types</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reminderTypes.map((r) => (
              <Card key={r.type}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{r.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.behavior}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
