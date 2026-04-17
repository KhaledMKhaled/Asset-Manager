"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListContactsQueryKey, useCreateContact, useListCompanies, useListContacts } from "@workspace/api-client-react";
import { useRouter } from "@/i18n/routing";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewContactPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createContact = useCreateContact();
  const [form, setForm] = useState({
    companyId: "",
    fullName: "",
    phone: "",
    email: "",
    jobTitle: "",
    preferredContactMethod: "phone",
    language: "en",
    isPrimary: true,
  });
  const { data: companies } = useListCompanies();
  const { data: contacts } = useListContacts();

  const duplicate = useMemo(
    () =>
      contacts?.find(
        (item) =>
          (form.email && item.email?.toLowerCase() === form.email.toLowerCase()) ||
          (form.phone && item.phone === form.phone),
      ),
    [contacts, form.email, form.phone],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createContact.mutateAsync({
      data: {
        ...form,
        companyId: form.companyId || undefined,
      },
    });
    await queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
    router.push(`/contacts/${result.id}`);
  }

  return (
    <AppShell description="Scope 2 contact creation with company linking and duplicate checks for phone and email." title="Create contact">
      <SectionCard description="Capture a contact and link it to an account for lead and opportunity assignment." title="New contact">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Full name"><Input required value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></Field>
          <Field label="Company">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.companyId} onChange={(event) => setForm((current) => ({ ...current, companyId: event.target.value }))}>
              <option value="">No linked company</option>
              {companies?.map((company) => (
                <option key={company.id} value={company.id}>{company.companyName}</option>
              ))}
            </select>
          </Field>
          <Field label="Phone"><Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></Field>
          <Field label="Job title"><Input value={form.jobTitle} onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))} /></Field>
          <Field label="Preferred contact method">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.preferredContactMethod} onChange={(event) => setForm((current) => ({ ...current, preferredContactMethod: event.target.value }))}>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </Field>
          <Field label="Language">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.language} onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </Field>
          <Field label="Primary contact">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.isPrimary ? "true" : "false"} onChange={(event) => setForm((current) => ({ ...current, isPrimary: event.target.value === "true" }))}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            {duplicate ? (
              <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Possible duplicate found: {duplicate.fullName} already uses this phone or email.
              </div>
            ) : null}
            <Button disabled={createContact.isPending} type="submit">
              {createContact.isPending ? "Creating..." : "Create contact"}
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
