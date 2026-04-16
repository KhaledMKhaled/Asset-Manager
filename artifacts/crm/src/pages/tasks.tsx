import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useListTasks, useUpdateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, CheckSquare, Calendar, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("open");
  const { toast } = useToast();

  const params = {
    ...(search ? { search } : {}),
    ...(priority && priority !== "all" ? { priority } : {}),
    ...(status && status !== "all" ? { status } : {}),
  };

  const { data: tasks, isLoading } = useListTasks(params, {
    query: { queryKey: getListTasksQueryKey(params) },
  });

  const updateTask = useUpdateTask();

  async function handleComplete(id: string) {
    try {
      await updateTask.mutateAsync({ id, data: { status: "completed" } });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({}) });
      toast({ title: "Task completed" });
    } catch {
      toast({ title: "Failed to update task", variant: "destructive" });
    }
  }

  const priorityColors: Record<string, string> = {
    urgent: "border-l-red-500",
    high: "border-l-orange-500",
    medium: "border-l-yellow-500",
    low: "border-l-gray-500",
  };

  return (
    <AppShell title="Tasks">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                data-testid="input-search"
                placeholder="Search tasks..."
                className="pl-8 h-8 w-48 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger data-testid="select-priority" className="h-8 w-32 text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["urgent", "high", "medium", "low"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {["all", "open", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full border capitalize transition-colors",
                  status === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-task">
            <Plus className="h-3.5 w-3.5" /> New Task
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (tasks?.length ?? 0) === 0 ? (
          <div className="py-16 text-center">
            <CheckSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(tasks as any[] ?? []).map((t: any) => {
              const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed";
              return (
                <div
                  key={t.id}
                  data-testid={`row-task-${t.id}`}
                  className={cn(
                    "rounded-lg border bg-card p-3 flex items-center gap-4 border-l-4",
                    priorityColors[t.priority] ?? "border-l-border",
                    t.status === "completed" && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => t.status !== "completed" && handleComplete(t.id)}
                    className={cn(
                      "h-5 w-5 rounded border-2 shrink-0 transition-colors",
                      t.status === "completed"
                        ? "bg-green-500 border-green-500"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {t.status === "completed" && (
                      <svg className="h-3 w-3 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium text-foreground", t.status === "completed" && "line-through")}>
                      {t.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      <StatusBadge status={t.priority} />
                      {t.assignedUser && (
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{t.assignedUser.name}</span>
                      )}
                      {t.dueDate && (
                        <span className={cn("flex items-center gap-1", isOverdue && "text-red-400")}>
                          {isOverdue && <AlertCircle className="h-3 w-3" />}
                          <Calendar className="h-3 w-3" />
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={t.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
