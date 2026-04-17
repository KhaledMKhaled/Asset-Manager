"use client";

import { use } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetLeadQueryKey, getGetLeadTimelineQueryKey, useGetLead, useGetLeadTimeline, useScoreLeadAi } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { ScoreBadge, StatusBadge } from "@/components/crm/badges";
import { Button } from "@/components/ui/button";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const scoreLead = useScoreLeadAi();
  const { data: lead } = useGetLead(id, {
    query: { queryKey: getGetLeadQueryKey(id) },
  });
  const { data: timeline } = useGetLeadTimeline(id, {
    query: { queryKey: getGetLeadTimelineQueryKey(id) },
  });

  async function handleScore() {
    await scoreLead.mutateAsync({ id });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(id) }),
      queryClient.invalidateQueries({ queryKey: getGetLeadTimelineQueryKey(id) }),
    ]);
  }

  return (
    <AppShell
      description="Timeline-first customer profile with AI score, company context, activity, and opportunity attachments."
      title={lead?.company?.companyName ?? lead?.leadCode ?? "Lead detail"}
    >
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard description="Core qualification and ownership details." title="Profile">
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted">Primary contact</p>
              <p className="font-medium">{lead?.primaryContact?.fullName ?? "-"}</p>
            </div>
            <div className="flex gap-3">
              <StatusBadge value={lead?.leadStatus} />
              <ScoreBadge grade={lead?.scoreGrade} score={lead?.aiLeadScore} />
            </div>
            <div>
              <p className="text-muted">Assigned to</p>
              <p className="font-medium">{lead?.assignedUser?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted">AI summary</p>
              <p>{lead?.aiSummary ?? "No AI summary is available yet."}</p>
            </div>
            <Button onClick={handleScore} size="sm">
              Rescore lead
            </Button>
          </div>
        </SectionCard>

        <SectionCard description="Recent timeline events and related records." title="Timeline and attachments">
          <div className="space-y-3">
            {timeline?.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white/70 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{item.renderedTitle ?? item.eventType}</p>
                  <span className="text-xs text-muted">
                    {new Date(item.eventTimestamp).toLocaleString()}
                  </span>
                </div>
                {item.renderedDescription ? (
                  <p className="mt-1 text-sm text-muted">{item.renderedDescription}</p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/70 px-4 py-4">
              <p className="text-sm font-semibold">Activities</p>
              <p className="mt-2 text-2xl font-semibold">{lead?.activities?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white/70 px-4 py-4">
              <p className="text-sm font-semibold">Notes</p>
              <p className="mt-2 text-2xl font-semibold">{lead?.notes?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white/70 px-4 py-4">
              <p className="text-sm font-semibold">Opportunities</p>
              <p className="mt-2 text-2xl font-semibold">{lead?.opportunities?.length ?? 0}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
