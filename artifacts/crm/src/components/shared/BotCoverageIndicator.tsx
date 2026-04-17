import { cn } from "@/lib/utils";
import { Bot, User, Shield, AlertTriangle } from "lucide-react";

interface BotCoverageIndicatorProps {
  botActive: boolean;
  botPersonaName?: string | null;
  botFlowName?: string | null;
  botMessageCount?: number;
  coverageReason?: string | null;
  className?: string;
}

const reasonLabels: Record<string, string> = {
  agent_busy: "Agent Busy",
  agent_absent: "Agent Absent",
  agent_offline: "Agent Offline",
  after_hours: "After Hours",
  unassigned: "Unassigned",
  sla_breach: "SLA Breach",
  overloaded: "Overloaded",
  manual_activation: "Manual",
};

export function BotCoverageIndicator({
  botActive,
  botPersonaName,
  botFlowName,
  botMessageCount = 0,
  coverageReason,
  className,
}: BotCoverageIndicatorProps) {
  if (!botActive) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)} data-testid="indicator-bot-inactive">
        <User className="h-3 w-3" />
        <span>Human agent</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors",
        "bg-purple-500/5 border-purple-500/20",
        className
      )}
      data-testid="indicator-bot-active"
    >
      <div className="relative shrink-0">
        <Bot className="h-4 w-4 text-purple-400" />
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background animate-pulse" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-purple-400">Bot Active</span>
          {coverageReason && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
              {reasonLabels[coverageReason] ?? coverageReason}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
          {botPersonaName && <span>Persona: {botPersonaName}</span>}
          {botFlowName && <span>· Flow: {botFlowName}</span>}
          {botMessageCount > 0 && <span>· {botMessageCount} msgs</span>}
        </div>
      </div>
    </div>
  );
}
