"use client";

import { getGetPipelineBoardQueryKey, useGetPipelineBoard } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";

export default function PipelinePage() {
  const { data } = useGetPipelineBoard(undefined, {
    query: { queryKey: getGetPipelineBoardQueryKey() },
  });

  return (
    <AppShell description="Scope 5 pipeline and opportunity management with a board view of current deal stages." title="Pipeline">
      <SectionCard description="The default pipeline from settings is rendered here with stage values and opportunity counts." title={data?.pipelineName ?? "Pipeline board"}>
        <div className="grid gap-4 xl:grid-cols-4">
          {data?.stages?.map((stage) => (
            <div key={stage.stageId} className="rounded-[1.5rem] bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{stage.stageName}</p>
                <span className="text-sm text-muted">{stage.count}</span>
              </div>
              <p className="mt-2 text-sm text-muted">Total value</p>
              <p className="text-2xl font-semibold">SAR {Number(stage.totalValue ?? 0).toLocaleString()}</p>
              <div className="mt-4 space-y-2">
                {stage.opportunities?.slice(0, 4).map((opportunity) => (
                  <div key={opportunity.id} className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-sm">
                    <p className="font-medium">{opportunity.opportunityName ?? opportunity.id}</p>
                    <p className="text-xs text-muted">{opportunity.status}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
