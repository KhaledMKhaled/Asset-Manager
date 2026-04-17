import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "../globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ["latin"] });
const cairo = Cairo({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "Smarketing CRM",
  description: "Bilingual, AI-first operating system for unified sales and marketing.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const currentFont = locale === 'ar' ? cairo.className : inter.className;

  return (
    <html lang={locale} dir={dir} className="dark">
      <body className={`${currentFont} min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <QueryProvider>
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </QueryProvider>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
