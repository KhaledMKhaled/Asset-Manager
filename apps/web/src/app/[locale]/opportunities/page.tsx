"use client";

import { getListOpportunitiesQueryKey, useListOpportunities } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { StatusBadge } from "@/components/crm/badges";

export default function OpportunitiesPage() {
  const { data } = useListOpportunities(undefined, {
    query: { queryKey: getListOpportunitiesQueryKey() },
  });

  return (
    <AppShell description="Opportunity tracking for demo, signup, activation, paid subscription, and revenue conversion." title="Opportunities">
      <SectionCard description="Revenue-bearing records linked to leads and the configured pipeline." title="Opportunity book">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="pb-3">Opportunity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Expected amount</th>
                <th className="pb-3">Signup</th>
                <th className="pb-3">Paid</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="py-3 font-medium">{item.opportunityName ?? item.id}</td>
                  <td className="py-3"><StatusBadge value={item.status} /></td>
                  <td className="py-3">{item.amountExpected ?? "-"}</td>
                  <td className="py-3"><StatusBadge value={item.signupStatus} /></td>
                  <td className="py-3"><StatusBadge value={item.paidStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
