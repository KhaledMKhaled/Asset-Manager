import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  qualified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  unqualified: "bg-red-500/20 text-red-400 border-red-500/30",
  converted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  lost: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  won: "bg-green-500/20 text-green-400 border-green-500/30",
  open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  resolved: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  contacted: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  not_contacted: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  nurturing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  urgent: "bg-red-600/20 text-red-300 border-red-600/30",
  normal: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ok: "bg-green-500/20 text-green-400 border-green-500/30",
  breached: "bg-red-500/20 text-red-400 border-red-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status.toLowerCase()] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
  return (
    <span
      data-testid={`badge-status-${status}`}
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        colorClass,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
