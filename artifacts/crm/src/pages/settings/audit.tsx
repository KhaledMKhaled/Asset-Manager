import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Search, Download } from "lucide-react";
import { Link } from "wouter";

const mockLogs = [
  { id: "1", user: "Ahmed Hassan", action: "updated", entityType: "lead", entityName: "L-2026-00458", timestamp: "2 min ago", changes: "Status: new → contacted" },
  { id: "2", user: "Sarah Ali", action: "created", entityType: "task", entityName: "Follow up call", timestamp: "15 min ago", changes: "Assigned to: Ahmed" },
  { id: "3", user: "System", action: "auto_scored", entityType: "lead", entityName: "L-2026-00459", timestamp: "30 min ago", changes: "Score: 45 → 72 (Grade: C → B)" },
  { id: "4", user: "Mohammed Khalil", action: "moved_stage", entityType: "opportunity", entityName: "Mofawtar Deal", timestamp: "1 hour ago", changes: "Stage: Demo → Proposal" },
  { id: "5", user: "AI Bot", action: "sent_message", entityType: "conversation", entityName: "Nour Trading", timestamp: "1 hour ago", changes: "Bot welcome message sent" },
  { id: "6", user: "Admin", action: "deleted", entityType: "user", entityName: "Inactive User", timestamp: "2 hours ago", changes: "User deactivated" },
  { id: "7", user: "Workflow", action: "triggered", entityType: "automation", entityName: "New Lead Processing", timestamp: "3 hours ago", changes: "Auto-assigned to Sales Team" },
  { id: "8", user: "Sarah Ali", action: "updated", entityType: "company", entityName: "TechCorp Egypt", timestamp: "4 hours ago", changes: "Branch count: 2 → 5" },
];

const actionColors: Record<string, string> = {
  created: "text-green-400",
  updated: "text-blue-400",
  deleted: "text-red-400",
  moved_stage: "text-purple-400",
  auto_scored: "text-yellow-400",
  sent_message: "text-cyan-400",
  triggered: "text-orange-400",
};

export default function AuditSettingsPage() {
  return (
    <AppShell title="Audit Log">
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
              <Search className="h-3.5 w-3.5" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="space-y-0">
              {mockLogs.map((log, i) => (
                <div key={log.id} className={`flex items-start gap-3 py-3 ${i < mockLogs.length - 1 ? "border-b border-border/30" : ""}`}>
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-foreground">{log.user}</span>
                      <span className={`text-xs font-medium ${actionColors[log.action] ?? "text-foreground"}`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">{log.entityType}:</span>
                      <span className="text-xs font-medium text-foreground">{log.entityName}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{log.changes}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
