import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, Target, HelpCircle, AlertTriangle, CheckCircle, MessageSquare } from "lucide-react";

interface HandoffSummaryProps {
  handoffSummary: string;
  customerIntent?: string | null;
  objections?: string[];
  pendingQuestions?: string[];
  promisedFollowup?: string | null;
  recommendedAction?: string | null;
  urgency?: string | null;
  botMessagesSent?: number;
  dataCollected?: Record<string, unknown> | null;
  className?: string;
}

const urgencyColors: Record<string, string> = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  low: "text-green-400 bg-green-500/10 border-green-500/20",
};

export function HandoffSummary({
  handoffSummary,
  customerIntent,
  objections = [],
  pendingQuestions = [],
  promisedFollowup,
  recommendedAction,
  urgency,
  botMessagesSent,
  dataCollected,
  className,
}: HandoffSummaryProps) {
  return (
    <Card className={cn("border-amber-500/20 bg-amber-500/5", className)} data-testid="panel-handoff-summary">
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">AI → Human Handoff</span>
          </div>
          <div className="flex items-center gap-2">
            {urgency && (
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", urgencyColors[urgency] ?? "text-foreground bg-muted border-border")}>
                {urgency.toUpperCase()} URGENCY
              </span>
            )}
            {botMessagesSent != null && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {botMessagesSent} bot msgs
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Summary</p>
          <p className="text-xs text-foreground">{handoffSummary}</p>
        </div>

        {/* Customer Intent */}
        {customerIntent && (
          <div className="flex items-start gap-2">
            <Target className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Customer Intent</p>
              <p className="text-xs text-foreground">{customerIntent}</p>
            </div>
          </div>
        )}

        {/* Objections */}
        {objections.length > 0 && (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Objections Raised</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {objections.map((o, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">{o}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pending Questions */}
        {pendingQuestions.length > 0 && (
          <div className="flex items-start gap-2">
            <HelpCircle className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Unanswered Questions</p>
              <ul className="mt-0.5 space-y-0.5">
                {pendingQuestions.map((q, i) => (
                  <li key={i} className="text-xs text-foreground">• {q}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recommended Action */}
        {recommendedAction && (
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Recommended Action</p>
              <p className="text-xs text-foreground font-medium">{recommendedAction}</p>
            </div>
          </div>
        )}

        {/* Promised Followup */}
        {promisedFollowup && (
          <div className="mt-1 p-2 rounded bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] text-amber-400 font-medium">⚠️ Bot Promised</p>
            <p className="text-xs text-foreground mt-0.5">{promisedFollowup}</p>
          </div>
        )}

        {/* Collected Data */}
        {dataCollected && Object.keys(dataCollected).length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Data Collected by Bot</p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(dataCollected).map(([key, val]) => (
                <div key={key} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50">
                  <span className="text-muted-foreground">{key}: </span>
                  <span className="text-foreground font-medium">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
