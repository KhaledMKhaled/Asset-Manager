import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useRequireAuth } from "@/hooks/useAuth";

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  const [lang, setLang] = useState<"en" | "ar">(() => {
    return (localStorage.getItem("crm_lang") as "en" | "ar") ?? "en";
  });

  const { isLoading, isAuthenticated } = useRequireAuth();

  function toggleLang() {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
    localStorage.setItem("crm_lang", next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background dark">
      <Sidebar lang={lang} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={title} lang={lang} onToggleLang={toggleLang} />
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
