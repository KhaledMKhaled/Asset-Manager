import { useState } from "react";
import { Link } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { useListContacts, getListContactsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Mail, Phone, Eye } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = { ...(search ? { search } : {}), page, limit: 25 };
  const { data: contacts, isLoading } = useListContacts(params, {
    query: { queryKey: getListContactsQueryKey(params) },
  });

  return (
    <AppShell title="Contacts">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search contacts..."
              className="pl-8 h-8 w-48 text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-contact">
            <Plus className="h-3.5 w-3.5" /> New Contact
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["Name", "Email", "Phone", "Company", "Job Title", "Source", ""].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(10).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array(7).fill(0).map((_, j) => (
                        <td key={j} className="px-3 py-2.5">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (contacts ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground text-sm">
                        No contacts found
                      </td>
                    </tr>
                  )
                : (contacts ?? []).map((c) => (
                    <tr key={c.id} data-testid={`row-contact-${c.id}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2.5 text-xs font-medium text-foreground">{c.fullName}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email ?? "-"}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone ?? "-"}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">-</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{c.jobTitle ?? "-"}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{c.preferredContactMethod ?? "-"}</td>
                      <td className="px-3 py-2.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{contacts?.length ?? 0} contacts total</p>
      </div>
    </AppShell>
  );
}
