import { AppShell } from "@/components/layout/AppShell";
import { useListFunnelStages, getListFunnelStagesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowLeft, GripVertical } from "lucide-react";
import { Link } from "wouter";

export default function FunnelSettingsPage() {
  const { data: stages, isLoading } = useListFunnelStages({
    query: { queryKey: getListFunnelStagesQueryKey() },
  });

  return (
    <AppShell title="Funnel Stages">
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-stage">
            <Plus className="h-3.5 w-3.5" /> New Stage
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Define your marketing funnel stages. Leads progress through these stages automatically or manually.
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : !stages?.length ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No funnel stages configured
          </div>
        ) : (
          <div className="space-y-2">
            {stages.map((s, idx) => (
              <Card key={s.id} data-testid={`card-stage-${s.id}`}>
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: s.color ?? "#3b82f6" }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Step {s.position}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
