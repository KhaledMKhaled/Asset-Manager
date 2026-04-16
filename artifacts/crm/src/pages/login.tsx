import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, AlertCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const result = await login.mutateAsync({ data });
      localStorage.setItem("crm_auth_token", result.token);
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.response?.data?.error ?? "Invalid credentials",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex dark bg-background">
      <div className="flex-1 hidden lg:flex flex-col justify-between p-12 bg-[hsl(var(--sidebar))] border-r border-border">
        <div>
          <div className="text-xl font-bold tracking-widest uppercase text-[hsl(var(--sidebar-primary))]">
            Smarketing CRM
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Revenue Operating System</p>
        </div>
        <div className="space-y-4">
          {[
            { title: "AI-Powered Lead Scoring", desc: "Qualify and prioritize every lead automatically" },
            { title: "Omnichannel Inbox", desc: "WhatsApp, Messenger, Instagram — all in one place" },
            { title: "Full Funnel Visibility", desc: "From Meta Ads to paid subscription, every step tracked" },
          ].map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--sidebar-primary))]/20 flex items-center justify-center shrink-0">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--sidebar-primary))]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Smarketing CRM &copy; {new Date().getFullYear()}</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="form-login">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  placeholder="you@company.com"
                  className="pl-9"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder="Your password"
                  className="pl-9"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.password.message}
                </p>
              )}
            </div>

            <Button
              data-testid="button-submit"
              type="submit"
              className="w-full"
              disabled={isSubmitting || login.isPending}
            >
              {(isSubmitting || login.isPending) ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Demo: admin@smarketing.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
