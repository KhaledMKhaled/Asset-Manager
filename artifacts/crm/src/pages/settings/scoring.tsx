import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { Link } from "wouter";

const mockModels = [
  { id: "1", name: "Default Lead Scoring", entityType: "lead", isActive: true, isDefault: true, rulesCount: 15, totalWeight: 100 },
  { id: "2", name: "Enterprise Pipeline", entityType: "opportunity", isActive: true, isDefault: false, rulesCount: 8, totalWeight: 100 },
  { id: "3", name: "High-Intent Leads", entityType: "lead", isActive: false, isDefault: false, rulesCount: 12, totalWeight: 100 },
];

const defaultRules = [
  { category: "Company Fit", rules: [
    { name: "Business type match", points: "+10", weight: "25%" },
    { name: "Branch count > 3", points: "+20", weight: "25%" },
    { name: "Decision maker confirmed", points: "+15", weight: "25%" },
  ]},
  { category: "Engagement", rules: [
    { name: "Responded to first contact", points: "+8", weight: "25%" },
    { name: "≥ 3 interactions", points: "+7", weight: "25%" },
    { name: "No response after 3 attempts", points: "-10", weight: "25%", negative: true },
  ]},
  { category: "Source Quality", rules: [
    { name: "Source = Meta high-intent form", points: "+10", weight: "20%" },
    { name: "Budget mismatch", points: "-15", weight: "20%", negative: true },
  ]},
  { category: "AI Analysis", rules: [
    { name: "Positive sentiment", points: "+5", weight: "15%" },
    { name: "High purchase intent", points: "+5", weight: "15%" },
    { name: "Drop-off risk detected", points: "-10", weight: "15%", negative: true },
  ]},
];

export default function ScoringSettingsPage() {
  return (
    <AppShell title="Scoring Configuration">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-scoring-model">
            <Plus className="h-3.5 w-3.5" /> New Model
          </Button>
        </div>

        {/* Scoring Models */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Scoring Models</h3>
          <div className="space-y-3">
            {mockModels.map((m) => (
              <Card key={m.id} data-testid={`card-scoring-model-${m.id}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                        <Star className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{m.name}</p>
                          {m.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">DEFAULT</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Entity: {m.entityType} · Rules: {m.rulesCount} · Weight: {m.totalWeight}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-400" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      )}
                      <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs">Preview</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Default Scoring Rules Preview */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Default Rules Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {defaultRules.map((cat) => (
              <Card key={cat.category}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-semibold text-foreground mb-2">{cat.category}</p>
                  <div className="space-y-1.5">
                    {cat.rules.map((r) => (
                      <div key={r.name} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{r.name}</span>
                        <span className={r.negative ? "text-red-400 font-medium" : "text-green-400 font-medium"}>
                          {r.points}
                        </span>
                      </div>
                    ))}
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
