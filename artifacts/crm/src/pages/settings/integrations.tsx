import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plug, CheckCircle, AlertTriangle, XCircle, RefreshCw, Settings2 } from "lucide-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/shared/StatusBadge";

const integrations = [
  { provider: "meta", label: "Meta Platform", authType: "OAuth + API Key", status: "connected", lastSync: "2 hours ago", records: 1247 },
  { provider: "openai", label: "OpenAI (GPT-5.3)", authType: "API Key", status: "connected", lastSync: "Active", records: null },
  { provider: "gemini", label: "Google Gemini 3.1", authType: "API Key", status: "disconnected", lastSync: null, records: null },
  { provider: "whatsapp", label: "WhatsApp Business", authType: "Token + Webhook", status: "connected", lastSync: "Real-time", records: null },
  { provider: "messenger", label: "Facebook Messenger", authType: "Page Token + OAuth", status: "connected", lastSync: "Real-time", records: null },
  { provider: "instagram", label: "Instagram DM", authType: "Page Token + OAuth", status: "disconnected", lastSync: null, records: null },
];

function StatusIcon({ status }: { status: string }) {
  if (status === "connected") return <CheckCircle className="h-4 w-4 text-green-400" />;
  if (status === "error") return <XCircle className="h-4 w-4 text-red-400" />;
  return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
}

export default function IntegrationsSettingsPage() {
  return (
    <AppShell title="Integration Center">
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-add-integration">
            <Plug className="h-3.5 w-3.5" /> Add Integration
          </Button>
        </div>

        <div className="space-y-3">
          {integrations.map((integ) => (
            <Card key={integ.provider} data-testid={`card-integration-${integ.provider}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Plug className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{integ.label}</p>
                        <StatusIcon status={integ.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Auth: {integ.authType}</p>
                      {integ.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Last sync: {integ.lastSync}
                          {integ.records && ` · Records: ${integ.records.toLocaleString()}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {integ.status === "connected" ? (
                      <>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <RefreshCw className="h-3 w-3" /> Sync
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <Settings2 className="h-3 w-3" /> Edit
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="h-7 text-xs">Configure</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Health */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium text-foreground mb-3">Integration Health</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">Meta Platform</span>
                <span className="text-green-400">✅ 99.8% success rate (last 24h)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">OpenAI</span>
                <span className="text-green-400">✅ 100% success rate</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">WhatsApp</span>
                <span className="text-green-400">✅ 99.5% delivery rate</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">Gemini</span>
                <span className="text-yellow-400">⚠️ Not configured</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
