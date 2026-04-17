"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/routing";
import { getListLeadsQueryKey, useDeleteLead, useListLeads } from "@workspace/api-client-react";
import { SectionCard } from "@/components/crm/blocks";
import { ScoreBadge, StatusBadge } from "@/components/crm/badges";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const params = search ? { search } : undefined;
  const { data } = useListLeads(params, {
    query: { queryKey: getListLeadsQueryKey(params) },
  });
  const removeLead = useDeleteLead();

  async function handleDelete(id: string) {
    await removeLead.mutateAsync({ id });
    await queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey(params) });
  }

  return (
    <AppShell
      description="Scope 2 and scope 3 coverage for lead management, profile entry points, ownership, AI score visibility, and timeline navigation."
      title="Leads"
    >
      <SectionCard description="Search, inspect, and act on leads flowing from the funnel into sales follow-up." title="Lead registry">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input className="max-w-sm rounded-full" onChange={(event) => setSearch(event.target.value)} placeholder="Search by company" value={search} />
          <p className="text-sm text-muted">{data?.total ?? 0} leads</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="pb-3">Lead</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Assigned</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.leads?.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-200/70">
                  <td className="py-3">
                    <div className="font-medium">{lead.leadCode}</div>
                    <div className="text-xs text-muted">{lead.leadSource ?? "manual"}</div>
                  </td>
                  <td className="py-3">{lead.company?.companyName ?? "-"}</td>
                  <td className="py-3"><StatusBadge value={lead.leadStatus} /></td>
                  <td className="py-3"><ScoreBadge grade={lead.scoreGrade} score={lead.aiLeadScore} /></td>
                  <td className="py-3">{lead.assignedUser?.name ?? "-"}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link href={`/leads/${lead.id}`}>
                        <Button size="sm" variant="outline">Open</Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(lead.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
