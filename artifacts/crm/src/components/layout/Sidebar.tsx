import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Building2, Phone, TrendingUp,
  Target, MessageSquare, CheckSquare, Bell, Megaphone,
  GitBranch, Settings, BarChart3, ChevronLeft,
  ChevronRight, LogOut, User, Bot, DollarSign, Zap,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth, logout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useListNotifications } from "@workspace/api-client-react";

const mainNavItems = [
  { label: "Dashboard", labelAr: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", labelAr: "العملاء المحتملون", href: "/leads", icon: Users },
  { label: "Contacts", labelAr: "جهات الاتصال", href: "/contacts", icon: Phone },
  { label: "Companies", labelAr: "الشركات", href: "/companies", icon: Building2 },
  { label: "Opportunities", labelAr: "الفرص", href: "/opportunities", icon: TrendingUp },
  { label: "Pipeline", labelAr: "خط الأنابيب", href: "/pipeline", icon: Target },
  { label: "Tasks", labelAr: "المهام", href: "/tasks", icon: CheckSquare },
  { label: "Inbox", labelAr: "البريد الوارد", href: "/inbox", icon: MessageSquare },
  { label: "Campaigns", labelAr: "الحملات", href: "/campaigns", icon: Megaphone },
  { label: "Workflows", labelAr: "سير العمل", href: "/workflows", icon: GitBranch },
];

const dashboardSubItems = [
  { label: "Executive", labelAr: "تنفيذي", href: "/dashboard", icon: LayoutDashboard },
  { label: "Media Buying", labelAr: "شراء الإعلانات", href: "/dashboard/media", icon: DollarSign },
  { label: "Sales", labelAr: "المبيعات", href: "/dashboard/sales", icon: TrendingUp },
  { label: "Smarketing", labelAr: "سماركتنج", href: "/dashboard/smarketing", icon: BarChart3 },
  { label: "Messaging", labelAr: "الرسائل", href: "/dashboard/messaging", icon: MessageSquare },
  { label: "AI Continuity", labelAr: "استمرارية الذكاء", href: "/dashboard/ai-continuity", icon: Bot },
];

interface SidebarProps {
  lang: "en" | "ar";
}

export function Sidebar({ lang }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dashExpanded, setDashExpanded] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: notifications } = useListNotifications({ isRead: false });
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  const isDashboardActive = location.startsWith("/dashboard");

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        "flex flex-col h-screen bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-[hsl(var(--sidebar-border))]">
        {!collapsed && (
          <span data-testid="text-brand" className="text-sm font-bold text-[hsl(var(--sidebar-primary))] tracking-widest uppercase">
            Smarketing
          </span>
        )}
        <Button
          data-testid="button-toggle-sidebar"
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {/* Dashboard with sub-nav */}
        <div>
          <button
            onClick={() => !collapsed && setDashExpanded(!dashExpanded)}
            className={cn(
              "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors w-[calc(100%-16px)]",
              isDashboardActive
                ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{lang === "ar" ? "لوحات القيادة" : "Dashboards"}</span>
                {dashExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </>
            )}
          </button>
          {!collapsed && dashExpanded && (
            <div className="ml-4 mt-0.5 space-y-0.5">
              {dashboardSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                const label = lang === "ar" ? item.labelAr : item.label;
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center gap-2 mx-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                        isActive
                          ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                          : "text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-accent))]/50 hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Main navigation (excluding Dashboard since it's handled above) */}
        {mainNavItems.filter(item => item.href !== "/dashboard").map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
          const label = lang === "ar" ? item.labelAr : item.label;
          return (
            <Link key={item.href} href={item.href}>
              <a
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors",
                  isActive
                    ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                    : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                )}
              >
                <div className="relative shrink-0">
                  <Icon className="h-4 w-4" />
                  {item.href === "/inbox" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                {!collapsed && <span>{label}</span>}
              </a>
            </Link>
          );
        })}

        {/* Settings */}
        <Link href="/settings">
          <a
            data-testid="nav-settings"
            className={cn(
              "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors",
              location.startsWith("/settings")
                ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{lang === "ar" ? "الإعدادات" : "Settings"}</span>}
          </a>
        </Link>
      </nav>

      <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="button-user-menu"
              className={cn(
                "flex items-center gap-3 w-full rounded-lg px-2 py-2 hover:bg-[hsl(var(--sidebar-accent))] transition-colors",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-xs bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]">
                  {user?.name?.slice(0, 2).toUpperCase() ?? "??"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-[hsl(var(--sidebar-foreground))] truncate">{user?.name}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize">{user?.role?.replace(/_/g, " ")}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2"><User className="h-4 w-4" /> Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
