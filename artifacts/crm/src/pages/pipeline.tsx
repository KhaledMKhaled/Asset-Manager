import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  useGetPipelineBoard, useUpdateOpportunity,
  getGetPipelineBoardQueryKey,
} from "@workspace/api-client-react";
import type { PipelineBoardStage } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DollarSign, Calendar, User } from "lucide-react";

export default function PipelinePage() {
  const { toast } = useToast();
  const [dragging, setDragging] = useState<{ oppId: string; fromStageId: string } | null>(null);

  const { data: board, isLoading } = useGetPipelineBoard(undefined, {
    query: { queryKey: getGetPipelineBoardQueryKey() },
  });

  const updateOpp = useUpdateOpportunity();

  async function handleDrop(stageId: string) {
    if (!dragging || dragging.fromStageId === stageId) return;
    try {
      await updateOpp.mutateAsync({ id: dragging.oppId, data: { currentStageId: stageId } });
      queryClient.invalidateQueries({ queryKey: getGetPipelineBoardQueryKey() });
    } catch {
      toast({ title: "Failed to move opportunity", variant: "destructive" });
    }
    setDragging(null);
  }

  const stages = (board as any)?.stages ?? [];

  return (
    <AppShell title="Pipeline (Kanban)">
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="shrink-0 w-64 rounded-lg bg-muted animate-pulse h-96" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {(stages as any[]).map((stage: any) => (
            <div
              key={stage.stageId}
              data-testid={`stage-column-${stage.stageId}`}
              className="shrink-0 w-64 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.stageId)}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: stage.color ?? "#3b82f6" }}
                  />
                  <span className="text-sm font-medium text-foreground">{stage.stageName}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stage.opportunities?.length ?? 0}
                </Badge>
              </div>

              <div className="flex-1 space-y-2 rounded-lg border border-border bg-muted/10 p-2 min-h-[200px]">
                {(stage.opportunities as any[] ?? []).map((opp: any) => (
                  <Card
                    key={opp.id}
                    data-testid={`opp-card-${opp.id}`}
                    draggable
                    onDragStart={() => setDragging({ oppId: opp.id, fromStageId: stage.stageId })}
                    onDragEnd={() => setDragging(null)}
                    className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="pt-3 pb-3 space-y-2">
                      <p className="text-xs font-medium text-foreground leading-tight">
                        {opp.opportunityName ?? "Unnamed Opportunity"}
                      </p>
                      <StatusBadge status={opp.status} />
                      {opp.amountExpected && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          {opp.currency ?? "SAR"} {Number(opp.amountExpected).toLocaleString()}
                        </div>
                      )}
                      {opp.expectedCloseDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(opp.expectedCloseDate).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-2 text-center text-xs text-muted-foreground">
                {stage.totalValue > 0 && (
                  <span>SAR {stage.totalValue.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
