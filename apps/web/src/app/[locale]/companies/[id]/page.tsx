"use client";

import { use, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCompanyQueryKey, getListContactsQueryKey, useGetCompany, useListContacts, useUpdateCompany } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: company } = useGetCompany(id, {
    query: { queryKey: getGetCompanyQueryKey(id) },
  });
  const { data: contacts } = useListContacts(
    { companyId: id },
    { query: { queryKey: getListContactsQueryKey({ companyId: id }) } },
  );
  const updateCompany = useUpdateCompany();
  const [form, setForm] = useState({
    companyName: "",
    businessType: "",
    companySize: "",
    city: "",
    country: "",
    website: "",
    currentSystem: "",
  });

  useEffect(() => {
    if (!company) return;
    setForm({
      companyName: company.companyName ?? "",
      businessType: company.businessType ?? "",
      companySize: company.companySize ?? "",
      city: company.city ?? "",
      country: company.country ?? "",
      website: company.website ?? "",
      currentSystem: company.currentSystem ?? "",
    });
  }, [company]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateCompany.mutateAsync({ id, data: form });
    await queryClient.invalidateQueries({ queryKey: getGetCompanyQueryKey(id) });
  }

  return (
    <AppShell description="Company detail and editing flow for the core CRM entity scope." title={company?.companyName ?? "Company detail"}>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard description="Update company metadata and system context." title="Account profile">
          <form className="grid gap-4" onSubmit={handleSave}>
            <Field label="Company name"><Input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} /></Field>
            <Field label="Business type"><Input value={form.businessType} onChange={(event) => setForm((current) => ({ ...current, businessType: event.target.value }))} /></Field>
            <Field label="Company size"><Input value={form.companySize} onChange={(event) => setForm((current) => ({ ...current, companySize: event.target.value }))} /></Field>
            <Field label="City"><Input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} /></Field>
            <Field label="Country"><Input value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} /></Field>
            <Field label="Website"><Input value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} /></Field>
            <Field label="Current system"><Input value={form.currentSystem} onChange={(event) => setForm((current) => ({ ...current, currentSystem: event.target.value }))} /></Field>
            <Button disabled={updateCompany.isPending} type="submit">
              {updateCompany.isPending ? "Saving..." : "Save company"}
            </Button>
          </form>
        </SectionCard>

        <SectionCard description="Linked contacts help complete the entity graph for companies and leads." title="Linked contacts">
          <div className="space-y-3">
            {contacts?.length ? contacts.map((contact) => (
              <div key={contact.id} className="rounded-2xl bg-white/70 px-4 py-3">
                <p className="font-medium">{contact.fullName}</p>
                <p className="mt-1 text-sm text-muted">{contact.jobTitle ?? "No role"} • {contact.email ?? "No email"}</p>
              </div>
            )) : (
              <p className="text-sm text-muted">No contacts are linked to this company yet.</p>
            )}
          </div>
        </SectionCard>
      </div>
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
