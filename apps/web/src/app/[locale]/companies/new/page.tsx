"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCompaniesQueryKey, useCreateCompany, useListCompanies } from "@workspace/api-client-react";
import { useRouter } from "@/i18n/routing";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewCompanyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createCompany = useCreateCompany();
  const [form, setForm] = useState({
    companyName: "",
    businessType: "B2B",
    companySize: "small",
    city: "",
    country: "Egypt",
    website: "",
    currentSystem: "",
  });

  const queryParams = form.companyName ? { search: form.companyName } : undefined;
  const { data: duplicateCandidates } = useListCompanies(queryParams, {
    query: { queryKey: getListCompaniesQueryKey(queryParams) },
  });

  const hasDuplicate = useMemo(
    () =>
      duplicateCandidates?.some(
        (item) => item.companyName.trim().toLowerCase() === form.companyName.trim().toLowerCase(),
      ) ?? false,
    [duplicateCandidates, form.companyName],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createCompany.mutateAsync({ data: form });
    await queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
    router.push(`/companies/${result.id}`);
  }

  return (
    <AppShell description="Scope 2 company creation with duplicate warning and CRM-ready account metadata." title="Create company">
      <SectionCard description="Create a company record that contacts, leads, and opportunities can link to." title="New company">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Company name">
            <Input required value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} />
          </Field>
          <Field label="Business type">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.businessType} onChange={(event) => setForm((current) => ({ ...current, businessType: event.target.value }))}>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </Field>
          <Field label="Company size">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.companySize} onChange={(event) => setForm((current) => ({ ...current, companySize: event.target.value }))}>
              <option value="solo">Solo</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          </Field>
          <Field label="Country">
            <Input value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} />
          </Field>
          <Field label="Website">
            <Input value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
          </Field>
          <Field label="Current system">
            <Input value={form.currentSystem} onChange={(event) => setForm((current) => ({ ...current, currentSystem: event.target.value }))} />
          </Field>
          <div className="md:col-span-2">
            {hasDuplicate ? (
              <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                A company with this exact name already exists. Review before creating a duplicate account.
              </div>
            ) : null}
            <Button disabled={createCompany.isPending} type="submit">
              {createCompany.isPending ? "Creating..." : "Create company"}
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
