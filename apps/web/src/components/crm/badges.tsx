"use client";

export function StatusBadge({ value }: { value?: string | null }) {
  const text = value ?? "unknown";
  const tone = text.toLowerCase();
  const className =
    tone.includes("won") || tone.includes("paid") || tone.includes("resolved") || tone.includes("completed")
      ? "bg-emerald-100 text-emerald-700"
      : tone.includes("lost") || tone.includes("overdue") || tone.includes("breached")
        ? "bg-rose-100 text-rose-700"
        : tone.includes("pending") || tone.includes("warning") || tone.includes("new")
          ? "bg-amber-100 text-amber-700"
          : "bg-cyan-100 text-cyan-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${className}`}>
      {text.replaceAll("_", " ")}
    </span>
  );
}

export function ScoreBadge({
  grade,
  score,
}: {
  grade?: string | null;
  score?: string | number | null;
}) {
  const value = grade ?? "unscored";
  const className =
    value === "A"
      ? "bg-emerald-100 text-emerald-700"
      : value === "B"
        ? "bg-cyan-100 text-cyan-700"
        : value === "C"
          ? "bg-amber-100 text-amber-700"
          : "bg-rose-100 text-rose-700";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      <span>{value}</span>
      {score ? <span className="opacity-70">({score})</span> : null}
    </span>
  );
}
