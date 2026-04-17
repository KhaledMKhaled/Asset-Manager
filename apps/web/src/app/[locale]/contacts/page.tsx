"use client";

import { getListContactsQueryKey, useListContacts } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function ContactsPage() {
  const { data } = useListContacts(undefined, {
    query: { queryKey: getListContactsQueryKey() },
  });

  return (
    <AppShell description="Core CRM contact records linked to companies and leads." title="Contacts">
      <SectionCard description="Primary and secondary contacts coming from the CRM entity layer." title="Contact list">
        <div className="mb-4 flex justify-end">
          <Link href="/contacts/new">
            <Button>Create contact</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="pb-3">Name</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Phone</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((contact) => (
                <tr key={contact.id} className="border-t border-slate-200/70">
                  <td className="py-3 font-medium">
                    <Link className="hover:text-brand-700" href={`/contacts/${contact.id}`}>
                      {contact.fullName}
                    </Link>
                  </td>
                  <td className="py-3">{contact.companyId ?? "-"}</td>
                  <td className="py-3">{contact.jobTitle ?? "-"}</td>
                  <td className="py-3">{contact.email ?? "-"}</td>
                  <td className="py-3">{contact.phone ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
