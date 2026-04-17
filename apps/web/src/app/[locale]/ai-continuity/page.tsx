"use client";

import {
  getListAgentAvailabilityQueryKey,
  getListBotFlowsQueryKey,
  getListBotPersonasQueryKey,
  useListAgentAvailability,
  useListBotFlows,
  useListBotPersonas,
} from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { StatusBadge } from "@/components/crm/badges";

export default function AiContinuityPage() {
  const { data: personas } = useListBotPersonas({
    query: { queryKey: getListBotPersonasQueryKey() },
  });
  const { data: flows } = useListBotFlows({
    query: { queryKey: getListBotFlowsQueryKey() },
  });
  const { data: availability } = useListAgentAvailability({
    query: { queryKey: getListAgentAvailabilityQueryKey() },
  });

  return (
    <AppShell description="Scope 11 AI continuity with persona governance, bot flows, and human coverage visibility." title="AI continuity">
      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard description="Bot personas controlling voice, boundaries, and conversation style." title="Bot personas">
          <div className="space-y-3">
            {personas?.map((persona) => (
              <div key={persona.id} className="rounded-[1.5rem] bg-white/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{persona.name}</p>
                  <StatusBadge value={persona.isActive ? "active" : "inactive"} />
                </div>
                <p className="mt-2 text-sm text-muted">{persona.description ?? "No persona description."}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard description="Available AI continuity flows for fallback, reactivation, and handoff." title="Bot flows">
          <div className="space-y-3">
            {flows?.map((flow) => (
              <div key={flow.id} className="rounded-[1.5rem] bg-white/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{flow.name}</p>
                  <StatusBadge value={flow.isActive ? "active" : "inactive"} />
                </div>
                <p className="mt-2 text-sm text-muted">{flow.flowType ?? "general"} flow</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard description="Human availability to support AI coverage and escalations." title="Agent availability">
          <div className="space-y-3">
            {availability?.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] bg-white/70 px-4 py-4">
                <p className="font-semibold">{item.userId}</p>
                <div className="mt-2 flex gap-2">
                  <StatusBadge value={item.status} />
                  <StatusBadge value={`${item.activeConversationCount}/${item.maxConcurrentConversations} load`} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
