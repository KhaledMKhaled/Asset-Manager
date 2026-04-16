import { AppShell } from "@/components/layout/AppShell";
import { useListUsers, getListUsersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-500/20 text-red-400 border-red-500/30",
  admin: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  sales_manager: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  sales_rep: "bg-blue-400/20 text-blue-300 border-blue-400/30",
  marketing_manager: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  marketing_specialist: "bg-purple-400/20 text-purple-300 border-purple-400/30",
  support_manager: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  support_agent: "bg-cyan-400/20 text-cyan-300 border-cyan-400/30",
  account_manager: "bg-green-500/20 text-green-400 border-green-500/30",
  viewer: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function UsersSettingsPage() {
  const { data: users, isLoading } = useListUsers(undefined, {
    query: { queryKey: getListUsersQueryKey() },
  });

  return (
    <AppShell title="Users & Roles">
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-invite-user">
            <Plus className="h-3.5 w-3.5" /> Invite User
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["User", "Email", "Role", "Status", "Last Login"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (users ?? []).map((u) => (
                    <tr key={u.id} data-testid={`row-user-${u.id}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/20 text-primary">
                              {u.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${ROLE_COLORS[u.role] ?? "bg-gray-500/20 text-gray-400"}`}>
                          {u.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-green-400">Active</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">-</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
