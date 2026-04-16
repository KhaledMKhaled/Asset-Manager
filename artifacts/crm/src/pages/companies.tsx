import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useListCompanies, getListCompaniesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Building2, Globe, MapPin } from "lucide-react";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = { ...(search ? { search } : {}), page, limit: 25 };
  const { data: companies, isLoading } = useListCompanies(params, {
    query: { queryKey: getListCompaniesQueryKey(params) },
  });

  return (
    <AppShell title="Companies">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search companies..."
              className="pl-8 h-8 w-48 text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-company">
            <Plus className="h-3.5 w-3.5" /> New Company
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
              ))
            : (companies ?? []).length === 0 ? (
                <div className="col-span-3 py-16 text-center text-muted-foreground text-sm">
                  No companies found
                </div>
              )
            : (companies ?? []).map((c) => (
                <div key={c.id} data-testid={`card-company-${c.id}`} className="rounded-lg border border-border p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{c.companyName}</p>
                      {c.businessType && <p className="text-xs text-muted-foreground">{c.businessType}</p>}
                      {c.city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {c.city}, {c.country}
                        </p>
                      )}
                      {c.website && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {c.website}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                    <span>{c.companySize ?? "?"} employees</span>
                    <span>{c.businessType ?? "-"}</span>
                  </div>
                </div>
              ))}
        </div>
        {companies && <p className="text-xs text-muted-foreground">{companies.length} companies</p>}
      </div>
    </AppShell>
  );
}
