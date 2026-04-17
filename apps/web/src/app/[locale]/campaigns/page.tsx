"use client";

import { getListCampaignsQueryKey, useListCampaigns } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { StatusBadge } from "@/components/crm/badges";

export default function CampaignsPage() {
  const { data } = useListCampaigns(undefined, {
    query: { queryKey: getListCampaignsQueryKey() },
  });

  return (
    <AppShell description="Scope 6 campaign and acquisition visibility from Meta and owned channels." title="Campaigns">
      <SectionCard description="Campaign inventory with delivery and performance metadata." title="Campaign list">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.map((campaign) => (
            <div key={campaign.id} className="rounded-[1.5rem] bg-white/70 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{campaign.campaignName}</p>
                <StatusBadge value={campaign.status} />
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted">
                <p>Platform: {campaign.platform ?? "-"}</p>
                <p>Objective: {campaign.campaignObjective ?? "-"}</p>
                <p>Window: {campaign.startDate ?? "-"} to {campaign.endDate ?? "-"}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
