import { AppShell } from "@/components/layout/AppShell";
import { useListKpiDefinitions, getListKpiDefinitionsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BarChart3, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function KpisSettingsPage() {
  const { data: kpis, isLoading } = useListKpiDefinitions({
    query: { queryKey: getListKpiDefinitionsQueryKey() },
  });

  return (
    <AppShell title="KPI Definitions">
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-kpi">
            <Plus className="h-3.5 w-3.5" /> New KPI
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : !kpis?.length ? (
          <div className="py-20 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No KPIs defined yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {kpis.map((k) => (
              <Card key={k.id} data-testid={`card-kpi-${k.id}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{k.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{k.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Type: <span className="text-foreground">{k.displayType}</span></span>
                        <span>·</span>
                        <span>Target: <span className="text-foreground">{k.targetValue}</span></span>
                        <span>·</span>
                        <span>Frequency: <span className="text-foreground">{k.timeAggregation}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {k.isPinned && <StatusBadge status="active" />}
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
