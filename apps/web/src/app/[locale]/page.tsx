import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CRM_AUTH_COOKIE } from '@/lib/session';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const token = (await cookies()).get(CRM_AUTH_COOKIE)?.value;

  redirect(`/${locale}/${token ? 'dashboard' : 'login'}`);
}
