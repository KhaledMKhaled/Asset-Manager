"use client";

import { use, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetLeadQueryKey,
  getGetLeadTimelineQueryKey,
  useGetLead,
  useGetLeadTimeline,
  useListCompanies,
  useListContacts,
  useListFunnelStages,
  useListUsers,
  useScoreLeadAi,
  useUpdateLead,
} from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { ScoreBadge, StatusBadge } from "@/components/crm/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const scoreLead = useScoreLeadAi();
  const updateLead = useUpdateLead();
  const { data: lead } = useGetLead(id, {
    query: { queryKey: getGetLeadQueryKey(id) },
  });
  const { data: timeline } = useGetLeadTimeline(id, {
    query: { queryKey: getGetLeadTimelineQueryKey(id) },
  });
  const { data: companies } = useListCompanies();
  const { data: contacts } = useListContacts();
  const { data: users } = useListUsers();
  const { data: stages } = useListFunnelStages();
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    setTagsInput(lead?.tags?.join(", ") ?? "");
  }, [lead?.tags]);

  async function handleScore() {
    await scoreLead.mutateAsync({ id });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(id) }),
      queryClient.invalidateQueries({ queryKey: getGetLeadTimelineQueryKey(id) }),
    ]);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateLead.mutateAsync({
      id,
      data: {
        companyId: toOptionalString(formData.get("companyId")),
        primaryContactId: toOptionalString(formData.get("primaryContactId")),
        assignedTo: toOptionalString(formData.get("assignedTo")),
        leadSource: toOptionalString(formData.get("leadSource")),
        leadStatus: toOptionalString(formData.get("leadStatus")),
        contactStatus: toOptionalString(formData.get("contactStatus")),
        qualificationStatus: toOptionalString(formData.get("qualificationStatus")),
        currentFunnelStageId: toOptionalString(formData.get("currentFunnelStageId")),
        aiSummary: toOptionalString(formData.get("aiSummary")),
        tags: tagsInput.split(",").map((item) => item.trim()).filter(Boolean),
      },
    });
    await queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(id) });
  }

  return (
    <AppShell
      description="Timeline-first customer profile with editable ownership, status, and linking metadata."
      title={lead?.company?.companyName ?? lead?.leadCode ?? "Lead detail"}
    >
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard description="Core qualification, entity linking, and ownership details." title="Profile">
          <form className="space-y-4 text-sm" onSubmit={handleSave}>
            <div className="flex gap-3">
              <StatusBadge value={lead?.leadStatus} />
              <ScoreBadge grade={lead?.scoreGrade} score={lead?.aiLeadScore} />
            </div>
            <Field label="Company">
              <select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" defaultValue={lead?.companyId ?? ""} name="companyId">
                <option value="">No company selected</option>
                {companies?.map((company) => (
                  <option key={company.id} value={company.id}>{company.companyName}</option>
                ))}
              </select>
            </Field>
            <Field label="Primary contact">
              <select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" defaultValue={lead?.primaryContactId ?? ""} name="primaryContactId">
                <option value="">No contact selected</option>
                {contacts?.map((contact) => (
                  <option key={contact.id} value={contact.id}>{contact.fullName}</option>
                ))}
              </select>
            </Field>
            <Field label="Assigned user">
              <select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" defaultValue={lead?.assignedTo ?? ""} name="assignedTo">
                <option value="">Unassigned</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Lead source"><Input defaultValue={lead?.leadSource ?? ""} name="leadSource" /></Field>
            <Field label="Lead status"><Input defaultValue={lead?.leadStatus ?? ""} name="leadStatus" /></Field>
            <Field label="Contact status"><Input defaultValue={lead?.contactStatus ?? ""} name="contactStatus" /></Field>
            <Field label="Qualification status"><Input defaultValue={lead?.qualificationStatus ?? ""} name="qualificationStatus" /></Field>
            <Field label="Funnel stage">
              <select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" defaultValue={lead?.currentFunnelStageId ?? ""} name="currentFunnelStageId">
                <option value="">No funnel stage</option>
                {stages?.map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Tags">
              <Input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} />
            </Field>
            <Field label="AI summary">
              <textarea className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" defaultValue={lead?.aiSummary ?? ""} name="aiSummary" />
            </Field>
            <div className="flex gap-2">
              <Button disabled={updateLead.isPending} type="submit">
                {updateLead.isPending ? "Saving..." : "Save lead"}
              </Button>
              <Button onClick={handleScore} size="sm" type="button" variant="outline">
                Rescore lead
              </Button>
            </div>
          </form>
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

function toOptionalString(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : undefined;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
