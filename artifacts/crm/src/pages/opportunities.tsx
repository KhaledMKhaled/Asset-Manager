import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useListOpportunities, getListOpportunitiesQueryKey } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, DollarSign } from "lucide-react";

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const params = {
    ...(search ? { search } : {}),
    ...(status && status !== "all" ? { status } : {}),
    page, limit: 25,
  };

  const { data: opps, isLoading } = useListOpportunities(params, {
    query: { queryKey: getListOpportunitiesQueryKey(params) },
  });

  return (
    <AppShell title="Opportunities">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                data-testid="input-search"
                placeholder="Search opportunities..."
                className="pl-8 h-8 w-48 text-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger data-testid="select-status" className="h-8 w-36 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {["open", "won", "lost", "pending"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-opp">
            <Plus className="h-3.5 w-3.5" /> New Opportunity
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["Name", "Company", "Plan", "Expected Value", "Win Prob", "Status", "Close Date", "Assigned"].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array(8).fill(0).map((_, j) => (
                        <td key={j} className="px-3 py-2.5">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (opps ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground text-sm">
                        No opportunities found
                      </td>
                    </tr>
                  )
                : (opps ?? []).map((o) => (
                    <tr key={o.id} data-testid={`row-opp-${o.id}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2.5 text-xs font-medium text-foreground">{o.opportunityName ?? "-"}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">-</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{o.planInterest ?? "-"}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {o.currency} {Number(o.amountExpected ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {o.closeProbability != null ? `${o.closeProbability}%` : "-"}
                      </td>
                      <td className="px-3 py-2.5"><StatusBadge status={o.status} /></td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {o.expectedCloseDate ? new Date(o.expectedCloseDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{o.assignedTo ?? "-"}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {opps && <p className="text-xs text-muted-foreground">{opps.length} opportunities</p>}
      </div>
    </AppShell>
  );
}
