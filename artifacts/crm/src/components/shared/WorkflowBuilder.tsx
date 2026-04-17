import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, GitBranch, Clock, MessageSquare, Brain, CheckSquare, AlertTriangle, ArrowUpRight, Tag, Zap } from "lucide-react";

const stepTypeConfig: Record<string, { label: string; icon: typeof ArrowRight; color: string }> = {
  send_template: { label: "Send Template", icon: MessageSquare, color: "text-blue-400 bg-blue-400/10" },
  ai_generate: { label: "AI Generate", icon: Brain, color: "text-purple-400 bg-purple-400/10" },
  wait: { label: "Wait / Delay", icon: Clock, color: "text-yellow-400 bg-yellow-400/10" },
  decision_branch: { label: "Decision Branch", icon: GitBranch, color: "text-cyan-400 bg-cyan-400/10" },
  collect_input: { label: "Collect Input", icon: Tag, color: "text-green-400 bg-green-400/10" },
  create_task: { label: "Create Task", icon: CheckSquare, color: "text-orange-400 bg-orange-400/10" },
  update_field: { label: "Update Field", icon: Tag, color: "text-teal-400 bg-teal-400/10" },
  move_stage: { label: "Move Stage", icon: ArrowUpRight, color: "text-indigo-400 bg-indigo-400/10" },
  escalate: { label: "Escalate", icon: AlertTriangle, color: "text-red-400 bg-red-400/10" },
  end: { label: "End Flow", icon: Zap, color: "text-gray-400 bg-gray-400/10" },
};

interface FlowStep {
  id: string;
  stepType: string;
  position: number;
  label?: string;
  waitMinutes?: number | null;
  templateName?: string | null;
  aiPromptTemplate?: string | null;
  branchTrueLabel?: string;
  branchFalseLabel?: string;
}

interface WorkflowBuilderProps {
  steps: FlowStep[];
  flowName?: string;
  className?: string;
}

export function WorkflowBuilder({ steps, flowName, className }: WorkflowBuilderProps) {
  const sortedSteps = [...steps].sort((a, b) => a.position - b.position);

  return (
    <Card className={cn("", className)} data-testid="panel-workflow-builder">
      <CardContent className="pt-4 pb-4 space-y-3">
        {flowName && <p className="text-sm font-semibold text-foreground">{flowName}</p>}

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-border" />

          <div className="space-y-2">
            {sortedSteps.map((step, i) => {
              const config = stepTypeConfig[step.stepType] ?? { label: step.stepType, icon: Zap, color: "text-foreground bg-muted" };
              const Icon = config.icon;
              const colorParts = config.color.split(" ");

              return (
                <div key={step.id} className="relative flex items-start gap-3 group" data-testid={`workflow-step-${step.id}`}>
                  {/* Step number indicator */}
                  <div className={cn("relative z-10 h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border border-border/50 transition-colors group-hover:border-primary/50", colorParts[1] ?? "bg-muted")}>
                    <Icon className={cn("h-4 w-4", colorParts[0] ?? "text-foreground")} />
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pt-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{config.label}</span>
                      <span className="text-[10px] text-muted-foreground">#{step.position + 1}</span>
                    </div>

                    {step.label && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{step.label}</p>
                    )}

                    {step.stepType === "wait" && step.waitMinutes && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">Wait {step.waitMinutes} min</p>
                    )}

                    {step.stepType === "send_template" && step.templateName && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">Template: {step.templateName}</p>
                    )}

                    {step.stepType === "ai_generate" && step.aiPromptTemplate && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 font-mono max-w-xs">{step.aiPromptTemplate}</p>
                    )}

                    {step.stepType === "decision_branch" && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
                          ✓ {step.branchTrueLabel ?? "Yes"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                          ✕ {step.branchFalseLabel ?? "No"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Connector arrow */}
                  {i < sortedSteps.length - 1 && (
                    <div className="absolute left-5 -bottom-1 z-10">
                      <ArrowRight className="h-3 w-3 text-muted-foreground/50 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
