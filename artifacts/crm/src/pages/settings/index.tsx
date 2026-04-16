import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users, BarChart3, Target, Star, Settings2, GitBranch, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { title: "Users & Roles", desc: "Manage team members, roles, and permissions", icon: Users, href: "/settings/users" },
  { title: "Funnel Stages", desc: "Configure your marketing funnel stages", icon: Target, href: "/settings/funnel" },
  { title: "Pipelines", desc: "Setup sales pipelines and stages", icon: GitBranch, href: "/settings/pipelines" },
  { title: "KPI Definitions", desc: "Define and track key performance indicators", icon: BarChart3, href: "/settings/kpis" },
  { title: "Lead Scoring", desc: "Configure AI and rule-based scoring models", icon: Star, href: "/settings/scoring" },
  { title: "Channels", desc: "Connect WhatsApp, Messenger, and Instagram", icon: Phone, href: "/settings/channels" },
  { title: "General", desc: "System-wide configuration and preferences", icon: Settings2, href: "/settings/general" },
];

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm text-muted-foreground">Configure your CRM, pipelines, scoring models, KPIs, and integrations.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.href} href={s.href}>
                <a>
                  <Card className="hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer h-full">
                    <CardContent className="pt-4 pb-4 flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
