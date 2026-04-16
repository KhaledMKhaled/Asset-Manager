import { AppShell } from "@/components/layout/AppShell";
import { useListWorkflows, getListWorkflowsQueryKey } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, GitBranch, Zap } from "lucide-react";

export default function WorkflowsPage() {
  const { data, isLoading } = useListWorkflows({
    query: { queryKey: getListWorkflowsQueryKey() },
  });

  const rules = data ?? [];

  return (
    <AppShell title="Workflow Automation">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Automate actions based on triggers and conditions
          </p>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-workflow">
            <Plus className="h-3.5 w-3.5" /> New Workflow
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : rules.length === 0 ? (
          <div className="py-20 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No workflows created yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Create automation rules to save your team's time
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((r) => (
              <Card key={r.id} data-testid={`card-workflow-${r.id}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{(r as any).name}</p>
                        {(r as any).description && (
                          <p className="text-xs text-muted-foreground mt-1">{(r as any).description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={(r as any).isActive ? "active" : "cancelled"} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
