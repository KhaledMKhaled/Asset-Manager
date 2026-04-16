import { cn } from "@/lib/utils";

const gradeColors: Record<string, string> = {
  A: "bg-green-500/20 text-green-400 border-green-500/30",
  B: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  C: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  D: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  F: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface ScoreBadgeProps {
  grade?: string | null;
  score?: string | number | null;
  className?: string;
}

export function ScoreBadge({ grade, score, className }: ScoreBadgeProps) {
  if (!grade && !score) return <span className="text-xs text-muted-foreground">-</span>;
  const g = grade ?? (Number(score) >= 90 ? "A" : Number(score) >= 75 ? "B" : Number(score) >= 60 ? "C" : Number(score) >= 40 ? "D" : "F");
  const colorClass = gradeColors[g] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
  return (
    <span
      data-testid={`badge-score-${g}`}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border",
        colorClass,
        className
      )}
    >
      <span>{g}</span>
      {score && <span className="font-normal opacity-70">{Math.round(Number(score))}</span>}
    </span>
  );
}
