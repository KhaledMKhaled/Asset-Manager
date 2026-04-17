import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Smartphone, MessageSquare, Instagram, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

const mockChannels = [
  { id: "1", type: "whatsapp", name: "Main WhatsApp Business", accountId: "+20 123 456 7890", status: "active", team: "Sales Team", businessHours: "Sun-Thu 9AM-6PM" },
  { id: "2", type: "messenger", name: "Facebook Page - Mofawtar", accountId: "Mofawtar Official", status: "active", team: "Support Team", businessHours: "24/7" },
  { id: "3", type: "instagram", name: "Instagram Business", accountId: "@mofawtar", status: "inactive", team: null, businessHours: null },
];

const channelIcons: Record<string, typeof Smartphone> = {
  whatsapp: Smartphone,
  messenger: MessageSquare,
  instagram: Instagram,
};

const channelColors: Record<string, string> = {
  whatsapp: "text-green-400 bg-green-400/10",
  messenger: "text-blue-400 bg-blue-400/10",
  instagram: "text-pink-400 bg-pink-400/10",
};

export default function ChannelsSettingsPage() {
  return (
    <AppShell title="Channel Accounts">
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-add-channel">
            <Plus className="h-3.5 w-3.5" /> Add Channel
          </Button>
        </div>

        <div className="space-y-3">
          {mockChannels.map((ch) => {
            const Icon = channelIcons[ch.type] ?? Smartphone;
            const colorClass = channelColors[ch.type] ?? "text-foreground bg-muted";
            return (
              <Card key={ch.id} data-testid={`card-channel-${ch.id}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{ch.name}</p>
                          {ch.status === "active" ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ch.accountId}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {ch.team && <span>Team: <span className="text-foreground">{ch.team}</span></span>}
                          {ch.businessHours && <span>· Hours: <span className="text-foreground">{ch.businessHours}</span></span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="h-7 text-xs">Configure</Button>
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
