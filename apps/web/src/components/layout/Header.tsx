"use client";

import { Bell, Globe, LogOut, Search } from "lucide-react";
import { useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, useGetMe, useListNotifications } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "@/i18n/routing";

export function Header({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({
    query: { queryKey: getGetMeQueryKey() },
  });
  const { data: notifications } = useListNotifications({ isRead: false });
  const unreadCount = notifications?.filter((item) => !item.isRead).length ?? 0;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    queryClient.clear();
    router.push("/login");
  }

  function toggleLocale() {
    router.replace(pathname, { locale: locale === "ar" ? "en" : "ar" });
  }

  return (
    <header className="panel sticky top-0 z-20 mx-4 mt-4 rounded-[1.75rem] px-5 py-4 md:mx-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
            Smarketing OS
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative min-w-[14rem]">
            <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
            <Input
              aria-label="Search"
              className="h-10 rounded-full border-white/70 bg-white/70 pl-9"
              placeholder="Search leads, messages, settings"
            />
          </label>

          <div className="flex items-center gap-2">
            <Button className="rounded-full" size="icon" type="button" variant="outline" onClick={toggleLocale}>
              <Globe className="h-4 w-4" />
            </Button>
            <Button className="relative rounded-full" size="icon" type="button" variant="outline">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Button>
            <div className="hidden rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm md:block">
              <span className="font-medium">{user?.name ?? "Workspace user"}</span>
              <span className="ml-2 text-muted">{user?.role?.replaceAll("_", " ") ?? "viewer"}</span>
            </div>
            <Button className="rounded-full" type="button" variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
