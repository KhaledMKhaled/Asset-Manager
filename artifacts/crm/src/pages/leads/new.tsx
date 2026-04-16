import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import {
  useCreateLead, useCreateCompany, useCreateContact,
  getListLeadsQueryKey,
} from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, AlertCircle } from "lucide-react";

const schema = z.object({
  companyName: z.string().min(1, "Company name required"),
  country: z.string().optional(),
  city: z.string().optional(),
  contactName: z.string().min(1, "Contact name required"),
  phone: z.string().optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  jobTitle: z.string().optional(),
  leadSource: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewLeadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createCompany = useCreateCompany();
  const createContact = useCreateContact();
  const createLead = useCreateLead();
  const [leadSource, setLeadSource] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const company = await createCompany.mutateAsync({
        data: {
          companyName: data.companyName,
          country: data.country || undefined,
          city: data.city || undefined,
        },
      });

      const contact = await createContact.mutateAsync({
        data: {
          companyId: (company as any).id,
          fullName: data.contactName,
          phone: data.phone || undefined,
          email: data.email || undefined,
          jobTitle: data.jobTitle || undefined,
          isPrimary: true,
        },
      });

      await createLead.mutateAsync({
        data: {
          companyId: (company as any).id,
          primaryContactId: (contact as any).id,
          leadSource: leadSource || undefined,
        },
      });

      queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey({}) });
      toast({ title: "Lead created successfully" });
      setLocation("/leads");
    } catch (err: any) {
      toast({
        title: "Failed to create lead",
        description: err?.message ?? "Something went wrong",
        variant: "destructive",
      });
    }
  }

  const isPending = isSubmitting || createLead.isPending || createCompany.isPending || createContact.isPending;

  return (
    <AppShell title="New Lead">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/leads">
            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-base font-semibold text-foreground">Create New Lead</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} data-testid="form-create-lead" className="space-y-6">
          <div className="rounded-lg border border-border p-6 space-y-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  data-testid="input-company-name"
                  {...register("companyName")}
                  placeholder="Acme Corp"
                />
                {errors.companyName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.companyName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" data-testid="input-country" {...register("country")} placeholder="Saudi Arabia" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" data-testid="input-city" {...register("city")} placeholder="Riyadh" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-6 space-y-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactName">Full Name *</Label>
                <Input
                  id="contactName"
                  data-testid="input-contact-name"
                  {...register("contactName")}
                  placeholder="John Doe"
                />
                {errors.contactName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.contactName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" data-testid="input-job-title" {...register("jobTitle")} placeholder="CEO" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" data-testid="input-phone" {...register("phone")} placeholder="+966 5xxxxxxxx" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" data-testid="input-email" type="email" {...register("email")} placeholder="john@acme.com" />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-6 space-y-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lead Details</h3>
            <div className="space-y-1.5">
              <Label>Lead Source</Label>
              <Select value={leadSource} onValueChange={setLeadSource}>
                <SelectTrigger data-testid="select-lead-source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {["meta_ads", "google_ads", "website", "referral", "cold_call", "event", "partner", "organic"].map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/leads">
              <Button type="button" variant="outline" data-testid="button-cancel">Cancel</Button>
            </Link>
            <Button
              type="submit"
              data-testid="button-submit"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
