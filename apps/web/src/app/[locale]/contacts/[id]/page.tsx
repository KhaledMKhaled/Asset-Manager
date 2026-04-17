"use client";

import { use, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetContactQueryKey, useGetContact, useListCompanies, useUpdateContact } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: contact } = useGetContact(id, {
    query: { queryKey: getGetContactQueryKey(id) },
  });
  const { data: companies } = useListCompanies();
  const updateContact = useUpdateContact();
  const [form, setForm] = useState({
    companyId: "",
    fullName: "",
    phone: "",
    email: "",
    jobTitle: "",
    preferredContactMethod: "phone",
    language: "en",
    isPrimary: false,
  });

  useEffect(() => {
    if (!contact) return;
    setForm({
      companyId: contact.companyId ?? "",
      fullName: contact.fullName ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      jobTitle: contact.jobTitle ?? "",
      preferredContactMethod: contact.preferredContactMethod ?? "phone",
      language: contact.language ?? "en",
      isPrimary: Boolean(contact.isPrimary),
    });
  }, [contact]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateContact.mutateAsync({
      id,
      data: {
        ...form,
        companyId: form.companyId || undefined,
      },
    });
    await queryClient.invalidateQueries({ queryKey: getGetContactQueryKey(id) });
  }

  return (
    <AppShell description="Contact detail and edit surface with linked account ownership." title={contact?.fullName ?? "Contact detail"}>
      <SectionCard description="Edit contact data and maintain entity linking to the company record." title="Contact profile">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
          <Field label="Full name"><Input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></Field>
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
            <Button disabled={updateContact.isPending} type="submit">
              {updateContact.isPending ? "Saving..." : "Save contact"}
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
