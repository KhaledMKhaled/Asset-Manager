import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smarketing CRM",
  description: "Bilingual, AI-first operating system for unified sales and marketing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex bg-slate-50 dark:bg-slate-950`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <QueryProvider>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
