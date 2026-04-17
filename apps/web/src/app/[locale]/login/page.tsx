"use client";

import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("admin@smarketing.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await login.mutateAsync({ data: { email, password } });
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.data?.error ?? err?.message ?? "Login failed.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] panel lg:grid-cols-[1.15fr_0.85fr]">
        <div className="bg-slate-900 px-8 py-10 text-slate-50">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
            Smarketing CRM
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Revenue CRM plus bilingual operating system.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            The live app now aligns with the implementation plan around dashboard visibility,
            CRM entities, pipeline execution, omnichannel inbox, workflows, and AI continuity.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Dynamic funnel and pipeline orchestration",
              "Omnichannel WhatsApp, Messenger, and Instagram inbox",
              "AI continuity, bot personas, and handoff visibility",
              "Configurable KPIs, settings, workflows, and scoring",
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-10 sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700">
            Sign in
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Continue to the workspace
          </h2>
          <p className="mt-2 text-sm text-muted">
            Demo credentials are prefilled so we can verify the end-to-end flow quickly.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <Button className="h-11 w-full rounded-full" disabled={login.isPending} type="submit">
              {login.isPending ? "Signing in..." : "Enter workspace"}
            </Button>
          </form>

          <div className="mt-6 rounded-[1.5rem] bg-cyan-50 px-4 py-4 text-sm text-cyan-900">
            <p className="font-semibold">Demo access</p>
            <p className="mt-1">`admin@smarketing.com` / `admin123`</p>
          </div>
        </div>
      </div>
    </div>
  );
}
