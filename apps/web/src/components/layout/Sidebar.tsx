"use client";

import { Bot, Briefcase, Building2, CheckSquare, GitBranch, LayoutDashboard, Megaphone, MessageSquare, Phone, Settings, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { stripLocale } from "@/lib/session";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/contacts", label: "Contacts", icon: Phone },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/opportunities", label: "Opportunities", icon: TrendingUp },
  { href: "/pipeline", label: "Pipeline", icon: Target },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/ai-continuity", label: "AI Continuity", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = stripLocale(usePathname());

  return (
    <aside className="hidden w-[17.5rem] shrink-0 flex-col px-4 py-4 lg:flex">
      <div className="glass rounded-[2rem] px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-amber-500 text-white shadow-lg shadow-brand-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              Revenue OS
            </p>
            <p className="text-lg font-semibold">Smarketing CRM</p>
          </div>
        </div>

        <div className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-700 hover:bg-white/80",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-[1.5rem] bg-slate-900 px-4 py-4 text-sm text-slate-100">
          <p className="font-semibold">Implementation alignment</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            Dashboard, CRM entities, pipeline, inbox, workflows, AI continuity,
            and settings are now surfaced from the implementation scopes.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-300">
            <Briefcase className="h-4 w-4" />
            Scope-by-scope rollout
          </div>
        </div>
      </div>
    </aside>
  );
}
