import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Route, Users, Star, Megaphone } from "lucide-react";
import { Link } from "wouter";

const mockRules = [
  { id: "1", name: "Round Robin - Sales", type: "round_robin", team: "Sales Team", channels: ["whatsapp", "messenger"], priority: "normal", isActive: true },
  { id: "2", name: "VIP Leads Priority", type: "vip", team: "Senior Sales", channels: ["all"], priority: "high", isActive: true },
  { id: "3", name: "Campaign-Based Routing", type: "campaign", team: "Media Buying", channels: ["whatsapp"], priority: "normal", isActive: true },
  { id: "4", name: "After-Hours Queue", type: "queue", team: "AI Bot", channels: ["all"], priority: "normal", isActive: true },
];

const routingTypeIcons: Record<string, typeof Route> = {
  round_robin: Users,
  vip: Star,
  campaign: Megaphone,
  queue: Route,
};

export default function RoutingSettingsPage() {
  return (
    <AppShell title="Conversation Routing">
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-routing-rule">
            <Plus className="h-3.5 w-3.5" /> New Rule
          </Button>
        </div>

        <div className="space-y-3">
          {mockRules.map((r) => {
            const Icon = routingTypeIcons[r.type] ?? Route;
            return (
              <Card key={r.id} data-testid={`card-routing-${r.id}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Type: {r.type.replace(/_/g, " ")} · Team: {r.team} · Channels: {r.channels.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        r.isActive ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"
                      }`}>
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
