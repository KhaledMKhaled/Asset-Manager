import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, GitBranch, Plus, GripVertical } from "lucide-react";
import { Link } from "wouter";

const mockPipelines = [
  {
    id: "1", name: "Sales Pipeline", nameAr: "خط المبيعات", type: "sales", isDefault: true, isActive: true,
    stages: [
      { name: "New Lead", color: "#3b82f6", position: 0, probability: 10, type: "standard" },
      { name: "Qualified", color: "#8b5cf6", position: 1, probability: 25, type: "standard" },
      { name: "Demo Scheduled", color: "#06b6d4", position: 2, probability: 50, type: "standard" },
      { name: "Proposal Sent", color: "#f59e0b", position: 3, probability: 70, type: "standard" },
      { name: "Negotiation", color: "#ef4444", position: 4, probability: 85, type: "standard" },
      { name: "Won", color: "#10b981", position: 5, probability: 100, type: "success" },
      { name: "Lost", color: "#6b7280", position: 6, probability: 0, type: "lost" },
    ],
  },
  {
    id: "2", name: "Onboarding Pipeline", nameAr: "خط التأهيل", type: "onboarding", isDefault: false, isActive: true,
    stages: [
      { name: "Signup", color: "#3b82f6", position: 0, probability: 20, type: "standard" },
      { name: "Setup", color: "#8b5cf6", position: 1, probability: 50, type: "standard" },
      { name: "Training", color: "#f59e0b", position: 2, probability: 75, type: "standard" },
      { name: "Activated", color: "#10b981", position: 3, probability: 100, type: "success" },
    ],
  },
];

export default function PipelinesSettingsPage() {
  return (
    <AppShell title="Pipeline Configuration">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-pipeline">
            <Plus className="h-3.5 w-3.5" /> New Pipeline
          </Button>
        </div>

        {mockPipelines.map((p) => (
          <Card key={p.id} data-testid={`card-pipeline-${p.id}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <GitBranch className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      {p.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">DEFAULT</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.nameAr} · Type: {p.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs">Edit Stages</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">Archive</Button>
                </div>
              </div>

              {/* Stages visual */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {p.stages.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 shrink-0">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 text-xs cursor-grab"
                      style={{ borderLeftColor: s.color, borderLeftWidth: "3px" }}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-foreground">{s.name}</span>
                      <span className="text-muted-foreground text-[10px]">{s.probability}%</span>
                    </div>
                    {i < p.stages.length - 1 && (
                      <span className="text-muted-foreground/30 text-xs">→</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
