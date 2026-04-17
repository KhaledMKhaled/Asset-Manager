import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const gradeColors: Record<string, string> = {
  A: "text-green-400",
  B: "text-blue-400",
  C: "text-yellow-400",
  D: "text-orange-400",
  F: "text-red-400",
};

const gradeBgColors: Record<string, string> = {
  A: "bg-green-500/10",
  B: "bg-blue-500/10",
  C: "bg-yellow-500/10",
  D: "bg-orange-500/10",
  F: "bg-red-500/10",
};

interface ScoreRule {
  category: string;
  ruleName: string;
  points: number;
  isNegative: boolean;
  weight?: number;
}

interface ScoreBreakdownPanelProps {
  score: number;
  grade: string;
  previousScore?: number | null;
  rules: ScoreRule[];
  modelName?: string;
  lastScoredAt?: string;
  className?: string;
}

export function ScoreBreakdownPanel({
  score,
  grade,
  previousScore,
  rules,
  modelName,
  lastScoredAt,
  className,
}: ScoreBreakdownPanelProps) {
  const categories = [...new Set(rules.map((r) => r.category))];
  const scoreDiff = previousScore != null ? score - previousScore : null;

  return (
    <Card className={cn("", className)} data-testid="panel-score-breakdown">
      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Lead Score</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn("text-3xl font-bold", gradeColors[grade] ?? "text-foreground")}>
                {Math.round(score)}
              </span>
              <span
                className={cn(
                  "text-lg font-bold px-2 py-0.5 rounded",
                  gradeBgColors[grade] ?? "bg-muted",
                  gradeColors[grade] ?? "text-foreground"
                )}
              >
                {grade}
              </span>
              {scoreDiff != null && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    scoreDiff > 0 ? "text-green-400" : scoreDiff < 0 ? "text-red-400" : "text-muted-foreground"
                  )}
                >
                  {scoreDiff > 0 ? <TrendingUp className="h-3 w-3" /> : scoreDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {scoreDiff > 0 ? "+" : ""}{scoreDiff.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          {modelName && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Model: {modelName}</p>
              {lastScoredAt && (
                <p className="text-[10px] text-muted-foreground">
                  Scored: {new Date(lastScoredAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Score bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
              grade === "A" ? "bg-green-500" :
              grade === "B" ? "bg-blue-500" :
              grade === "C" ? "bg-yellow-500" :
              grade === "D" ? "bg-orange-500" : "bg-red-500"
            )}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>

        {/* Rules by category */}
        <div className="space-y-3">
          {categories.map((cat) => {
            const catRules = rules.filter((r) => r.category === cat);
            const catTotal = catRules.reduce((sum, r) => sum + (r.isNegative ? -Math.abs(r.points) : r.points), 0);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-foreground">{cat}</p>
                  <span className={cn("text-xs font-bold", catTotal >= 0 ? "text-green-400" : "text-red-400")}>
                    {catTotal >= 0 ? "+" : ""}{catTotal}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {catRules.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5 px-2 rounded hover:bg-muted/30 transition-colors">
                      <span className="text-[11px] text-muted-foreground">{r.ruleName}</span>
                      <span className={cn("text-[11px] font-medium", r.isNegative ? "text-red-400" : "text-green-400")}>
                        {r.isNegative ? "-" : "+"}{Math.abs(r.points)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
