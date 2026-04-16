import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useListCampaigns, getListCampaignsQueryKey } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Megaphone } from "lucide-react";

export default function CampaignsPage() {
  const [search, setSearch] = useState("");

  const { data: campaigns, isLoading } = useListCampaigns(undefined, {
    query: { queryKey: getListCampaignsQueryKey() },
  });

  const filtered = (campaigns ?? []).filter((c) =>
    !search || c.campaignName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Campaigns">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search campaigns..."
              className="pl-8 h-8 w-48 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-campaign">
            <Plus className="h-3.5 w-3.5" /> New Campaign
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No campaigns yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Create your first campaign to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((campaign) => {
              const c = campaign as any;
              return (
              <Card key={c.id} data-testid={`card-campaign-${c.id}`} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{c.campaignName}</CardTitle>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{c.campaignObjective ?? c.platform ?? "-"}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{c.impressions?.toLocaleString() ?? "-"}</p>
                      <p className="text-muted-foreground">Impressions</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.clicks?.toLocaleString() ?? "-"}</p>
                      <p className="text-muted-foreground">Clicks</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.leadsGenerated ?? "-"}</p>
                      <p className="text-muted-foreground">Leads</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Budget: SAR {Number(c.budgetAllocated ?? 0).toLocaleString()}</span>
                    {c.roiPercentage != null && (
                      <span className={`font-medium ${Number(c.roiPercentage) > 0 ? "text-green-400" : "text-red-400"}`}>
                        ROI: {Number(c.roiPercentage).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
