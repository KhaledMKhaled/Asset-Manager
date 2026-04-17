"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getListTasksQueryKey, useCompleteTask, useListTasks } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { StatusBadge } from "@/components/crm/badges";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { data } = useListTasks(undefined, {
    query: { queryKey: getListTasksQueryKey() },
  });
  const completeTask = useCompleteTask();

  async function handleComplete(id: string) {
    await completeTask.mutateAsync({
      id,
      data: { result: "completed", completionNotes: "Completed from the task center." },
    });
    await queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
  }

  return (
    <AppShell description="Scope 8 task center with overdue tracking and direct completion actions." title="Tasks">
      <SectionCard description="Operational tasks created manually or by automation workflows." title="Task center">
        <div className="space-y-3">
          {data?.map((task) => (
            <div key={task.id} className="flex flex-col gap-3 rounded-[1.5rem] bg-white/70 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{task.title}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <StatusBadge value={task.status} />
                  <StatusBadge value={task.priority} />
                  <StatusBadge value={task.taskType} />
                </div>
                <p className="mt-2 text-sm text-muted">
                  Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}
                </p>
              </div>
              <Button disabled={task.status === "completed"} onClick={() => handleComplete(task.id)} size="sm">
                Mark complete
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
