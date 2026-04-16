import { useState } from "react";
import { Link } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { useListLeads, useDeleteLead, getListLeadsQueryKey } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [scoreGrade, setScoreGrade] = useState("");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const params = {
    ...(search ? { search } : {}),
    ...(status && status !== "all" ? { status } : {}),
    ...(scoreGrade && scoreGrade !== "all" ? { scoreGrade } : {}),
    page,
    limit: 25,
  };

  const { data, isLoading } = useListLeads(params, {
    query: { queryKey: getListLeadsQueryKey(params) },
  });

  const deleteLead = useDeleteLead();

  async function handleDelete(id: string) {
    if (!confirm("Delete this lead?")) return;
    try {
      await deleteLead.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey({}) });
      toast({ title: "Lead deleted" });
    } catch {
      toast({ title: "Failed to delete lead", variant: "destructive" });
    }
  }

  const leads = data?.leads ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 25);

  return (
    <AppShell title="Leads">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                data-testid="input-search"
                placeholder="Search leads..."
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
                {["new", "contacted", "nurturing", "qualified", "unqualified", "converted", "lost"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scoreGrade} onValueChange={(v) => { setScoreGrade(v); setPage(1); }}>
              <SelectTrigger data-testid="select-grade" className="h-8 w-28 text-xs">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {["A", "B", "C", "D", "F"].map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/leads/new">
            <Button data-testid="button-create-lead" size="sm" className="gap-2 h-8">
              <Plus className="h-3.5 w-3.5" /> New Lead
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["Lead Code", "Company", "Contact", "Source", "Status", "Score", "Assigned To", ""].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(10).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array(8).fill(0).map((_, j) => (
                        <td key={j} className="px-3 py-2.5">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : leads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground text-sm">
                        No leads found. Create your first lead to get started.
                      </td>
                    </tr>
                  )
                : leads.map((lead) => (
                    <tr key={lead.id} data-testid={`row-lead-${lead.id}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-xs text-primary">{lead.leadCode}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-foreground">
                        {lead.company?.companyName ?? "-"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {lead.primaryContact?.fullName ?? "-"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {lead.leadSource ?? "-"}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={lead.leadStatus} />
                      </td>
                      <td className="px-3 py-2.5">
                        <ScoreBadge grade={lead.scoreGrade} score={lead.aiLeadScore} />
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {lead.assignedUser?.name ?? "-"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <Link href={`/leads/${lead.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-view-lead-${lead.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            data-testid={`button-delete-lead-${lead.id}`}
                            onClick={() => handleDelete(lead.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {total > 25 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{total} total leads</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
