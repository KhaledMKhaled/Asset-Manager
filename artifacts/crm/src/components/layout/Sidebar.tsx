import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Building2, Phone, TrendingUp,
  Target, MessageSquare, CheckSquare, Bell, Megaphone,
  GitBranch, Settings, Star, BarChart3, ChevronLeft,
  ChevronRight, LogOut, User,
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

const navItems = [
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
  { label: "Settings", labelAr: "الإعدادات", href: "/settings", icon: Settings },
];

interface SidebarProps {
  lang: "en" | "ar";
}

export function Sidebar({ lang }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: notifications } = useListNotifications({ isRead: false });
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

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
        {navItems.map((item) => {
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
