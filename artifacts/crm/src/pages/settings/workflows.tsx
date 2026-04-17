import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, GitBranch, Plus, Play, Pause, Copy, Zap } from "lucide-react";
import { Link } from "wouter";

const mockWorkflows = [
  { id: "1", name: "New Lead Processing", appliesTo: "lead", trigger: "lead.created", rulesCount: 5, isActive: true, isDefault: true, type: "automation" },
  { id: "2", name: "MQL Auto-Assignment", appliesTo: "lead", trigger: "lead.stage_changed", rulesCount: 3, isActive: true, isDefault: false, type: "assignment" },
  { id: "3", name: "Demo Follow-Up", appliesTo: "opportunity", trigger: "activity.demo_completed", rulesCount: 4, isActive: true, isDefault: false, type: "follow_up" },
  { id: "4", name: "SLA Breach Escalation", appliesTo: "lead", trigger: "sla.breached", rulesCount: 2, isActive: true, isDefault: false, type: "escalation" },
  { id: "5", name: "Welcome Message Flow", appliesTo: "lead", trigger: "conversation.created", rulesCount: 3, isActive: false, isDefault: false, type: "messaging" },
];

export default function WorkflowsSettingsPage() {
  return (
    <AppShell title="Workflow Configuration">
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-workflow-setting">
            <Plus className="h-3.5 w-3.5" /> New Workflow
          </Button>
        </div>

        <div className="space-y-3">
          {mockWorkflows.map((w) => (
            <Card key={w.id} data-testid={`card-workflow-setting-${w.id}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      w.isActive ? "bg-green-500/10" : "bg-muted"
                    }`}>
                      <Zap className={`h-4 w-4 ${w.isActive ? "text-green-400" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                        {w.isDefault && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium shrink-0">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Applies to: {w.appliesTo} · Trigger: {w.trigger} · {w.rulesCount} rules
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Clone">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Test">
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 ${w.isActive ? "text-green-400" : "text-muted-foreground"}`}
                      title={w.isActive ? "Disable" : "Enable"}>
                      {w.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
