import { Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useListNotifications, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { getListNotificationsQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";

interface TopBarProps {
  title: string;
  lang: "en" | "ar";
  onToggleLang: () => void;
}

export function TopBar({ title, lang, onToggleLang }: TopBarProps) {
  const { data: notifications } = useListNotifications({ isRead: false });
  const unread = notifications?.filter((n) => !n.isRead) ?? [];
  const markAll = useMarkAllNotificationsRead();

  function handleMarkAll() {
    markAll.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      },
    });
  }

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background shrink-0">
      <h1 data-testid="text-page-title" className="text-base font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        <Button
          data-testid="button-toggle-lang"
          variant="ghost"
          size="sm"
          onClick={onToggleLang}
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <Globe className="h-4 w-4" />
          {lang === "en" ? "العربية" : "English"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid="button-notifications"
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unread.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-sm font-medium">Notifications</span>
              {unread.length > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-6" onClick={handleMarkAll}>
                  Mark all read
                </Button>
              )}
            </div>
            {notifications?.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">No notifications</div>
            )}
            {notifications?.slice(0, 5).map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
                <span className="text-xs font-medium">{n.title}</span>
                {n.message && <span className="text-xs text-muted-foreground">{n.message}</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
