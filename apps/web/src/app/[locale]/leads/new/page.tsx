"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListLeadsQueryKey, useCreateLead, useListCompanies, useListContacts, useListFunnelStages, useListLeads, useListUsers } from "@workspace/api-client-react";
import { useRouter } from "@/i18n/routing";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewLeadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createLead = useCreateLead();
  const [tagsInput, setTagsInput] = useState("");
  const [form, setForm] = useState({
    companyId: "",
    primaryContactId: "",
    assignedTo: "",
    leadSource: "manual",
    leadStatus: "new",
    currentFunnelStageId: "",
  });

  const { data: companies } = useListCompanies();
  const { data: contacts } = useListContacts();
  const { data: users } = useListUsers();
  const { data: stages } = useListFunnelStages();
  const { data: existingLeads } = useListLeads(
    { page: 1, limit: 100 },
    { query: { queryKey: getListLeadsQueryKey({ page: 1, limit: 100 }) } },
  );

  const duplicate = useMemo(
    () =>
      existingLeads?.leads?.find(
        (lead) =>
          (form.primaryContactId && lead.primaryContactId === form.primaryContactId) ||
          (form.companyId && lead.companyId === form.companyId),
      ),
    [existingLeads, form.primaryContactId, form.companyId],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createLead.mutateAsync({
      data: {
        ...form,
        companyId: form.companyId || undefined,
        primaryContactId: form.primaryContactId || undefined,
        assignedTo: form.assignedTo || undefined,
        currentFunnelStageId: form.currentFunnelStageId || undefined,
        tags: tagsInput.split(",").map((item) => item.trim()).filter(Boolean),
      },
    });
    await queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
    router.push(`/leads/${result.id}`);
  }

  return (
    <AppShell description="Scope 2 lead creation with company/contact linking, assignment, funnel stage mapping, and duplicate checks." title="Create lead">
      <SectionCard description="Create a lead and connect it to the core CRM entity graph from day one." title="New lead">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Company">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.companyId} onChange={(event) => setForm((current) => ({ ...current, companyId: event.target.value }))}>
              <option value="">No company selected</option>
              {companies?.map((company) => (
                <option key={company.id} value={company.id}>{company.companyName}</option>
              ))}
            </select>
          </Field>
          <Field label="Primary contact">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.primaryContactId} onChange={(event) => setForm((current) => ({ ...current, primaryContactId: event.target.value }))}>
              <option value="">No contact selected</option>
              {contacts?.map((contact) => (
                <option key={contact.id} value={contact.id}>{contact.fullName}</option>
              ))}
            </select>
          </Field>
          <Field label="Assigned to">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.assignedTo} onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}>
              <option value="">Auto assign</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Lead source">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.leadSource} onChange={(event) => setForm((current) => ({ ...current, leadSource: event.target.value }))}>
              <option value="manual">Manual</option>
              <option value="meta_ads">Meta ads</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="cold_call">Cold call</option>
            </select>
          </Field>
          <Field label="Lead status">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.leadStatus} onChange={(event) => setForm((current) => ({ ...current, leadStatus: event.target.value }))}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="nurturing">Nurturing</option>
              <option value="qualified">Qualified</option>
            </select>
          </Field>
          <Field label="Funnel stage">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.currentFunnelStageId} onChange={(event) => setForm((current) => ({ ...current, currentFunnelStageId: event.target.value }))}>
              <option value="">No funnel stage</option>
              {stages?.map((stage) => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Tags">
            <Input placeholder="hot, enterprise, follow-up" value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} />
          </Field>
          <div className="md:col-span-2">
            {duplicate ? (
              <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Possible duplicate lead found: {duplicate.leadCode} is already linked to this company or contact.
              </div>
            ) : null}
            <Button disabled={createLead.isPending} type="submit">
              {createLead.isPending ? "Creating..." : "Create lead"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
