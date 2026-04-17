"use client";

import { getListCompaniesQueryKey, useListCompanies } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function CompaniesPage() {
  const { data } = useListCompanies(undefined, {
    query: { queryKey: getListCompaniesQueryKey() },
  });

  return (
    <AppShell description="Company records from the core entity scope, ready for profile and opportunity expansion." title="Companies">
      <SectionCard description="Accounts tracked through the CRM profile model." title="Company directory">
        <div className="mb-4 flex justify-end">
          <Link href="/companies/new">
            <Button>Create company</Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.map((company) => (
            <Link key={company.id} href={`/companies/${company.id}`}>
              <div className="rounded-[1.5rem] bg-white/70 px-4 py-4 transition hover:bg-white">
                <p className="text-lg font-semibold">{company.companyName}</p>
                <p className="mt-1 text-sm text-muted">{company.city ?? "Unknown city"}, {company.country ?? "Unknown country"}</p>
                <div className="mt-4 space-y-1 text-sm text-muted">
                  <p>Type: {company.businessType ?? "-"}</p>
                  <p>Size: {company.companySize ?? "-"}</p>
                  <p>System: {company.currentSystem ?? "-"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
