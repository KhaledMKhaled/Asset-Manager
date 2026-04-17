"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getListWorkflowsQueryKey, useListWorkflows, useToggleWorkflow } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/crm/badges";

export default function WorkflowsPage() {
  const queryClient = useQueryClient();
  const { data } = useListWorkflows({
    query: { queryKey: getListWorkflowsQueryKey() },
  });
  const toggleWorkflow = useToggleWorkflow();

  async function handleToggle(id: string) {
    await toggleWorkflow.mutateAsync({ id });
    await queryClient.invalidateQueries({ queryKey: getListWorkflowsQueryKey() });
  }

  return (
    <AppShell description="Scope 8 workflow automation with activations, branching rules, and operational toggles." title="Workflows">
      <SectionCard description="Activate or pause workflow automations defined in the builder." title="Workflow builder surface">
        <div className="space-y-3">
          {data?.map((workflow) => (
            <div key={workflow.id} className="flex flex-col gap-3 rounded-[1.5rem] bg-white/70 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{workflow.name}</p>
                <p className="mt-1 text-sm text-muted">{workflow.description ?? "No description provided."}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={workflow.isActive ? "active" : "paused"} />
                <Button onClick={() => handleToggle(workflow.id)} size="sm" variant="outline">
                  Toggle
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
