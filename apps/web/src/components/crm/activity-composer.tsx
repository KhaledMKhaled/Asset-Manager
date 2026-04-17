"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListActivitiesQueryKey, useCreateActivity } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ACTIVITY_TYPE_OPTIONS = [
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "follow_up", label: "Follow-up" },
  { value: "demo", label: "Demo" },
];

const DIRECTION_OPTIONS = [
  { value: "outbound", label: "Outbound" },
  { value: "inbound", label: "Inbound" },
];

const OUTCOME_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "connected", label: "Connected" },
  { value: "no_answer", label: "No answer" },
  { value: "follow_up_needed", label: "Follow-up needed" },
  { value: "qualified", label: "Qualified" },
  { value: "demo_booked", label: "Demo booked" },
  { value: "not_interested", label: "Not interested" },
];

const INTEREST_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function ActivityComposer({
  entityId,
  entityLabel,
  entityType,
}: {
  entityType: string;
  entityId: string;
  entityLabel: string;
}) {
  const queryClient = useQueryClient();
  const createActivity = useCreateActivity();
  const [form, setForm] = useState({
    activityType: "call",
    direction: "outbound",
    activityDatetime: toDateTimeLocalValue(new Date()),
    subject: "",
    content: "",
    outcome: "",
    nextStep: "",
    interestLevel: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createActivity.mutateAsync({
      data: {
        entityType,
        entityId,
        activityType: form.activityType,
        direction: form.direction || undefined,
        activityDatetime: form.activityDatetime
          ? new Date(form.activityDatetime).toISOString()
          : undefined,
        subject: toOptionalString(form.subject),
        content: toOptionalString(form.content),
        outcome: toOptionalString(form.outcome),
        nextStep: toOptionalString(form.nextStep),
        interestLevel: toOptionalString(form.interestLevel),
      },
    });

    await queryClient.invalidateQueries({
      queryKey: getListActivitiesQueryKey({ entityType, entityId }),
    });

    setForm({
      activityType: form.activityType,
      direction: form.direction,
      activityDatetime: toDateTimeLocalValue(new Date()),
      subject: "",
      content: "",
      outcome: "",
      nextStep: "",
      interestLevel: "",
    });
  }

  return (
    <div className="rounded-[1.5rem] bg-white/70 p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold">Log activity</p>
        <p className="mt-1 text-sm text-muted">
          Capture the latest outreach, call result, or next step for this {entityLabel}.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Type">
            <select
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              onChange={(event) =>
                setForm((current) => ({ ...current, activityType: event.target.value }))
              }
              value={form.activityType}
            >
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Direction">
            <select
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              onChange={(event) =>
                setForm((current) => ({ ...current, direction: event.target.value }))
              }
              value={form.direction}
            >
              {DIRECTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="When">
            <Input
              onChange={(event) =>
                setForm((current) => ({ ...current, activityDatetime: event.target.value }))
              }
              type="datetime-local"
              value={form.activityDatetime}
            />
          </Field>
          <Field label="Outcome">
            <select
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              onChange={(event) =>
                setForm((current) => ({ ...current, outcome: event.target.value }))
              }
              value={form.outcome}
            >
              {OUTCOME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Subject">
            <Input
              onChange={(event) =>
                setForm((current) => ({ ...current, subject: event.target.value }))
              }
              placeholder="Short activity headline"
              value={form.subject}
            />
          </Field>
          <Field label="Interest level">
            <select
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              onChange={(event) =>
                setForm((current) => ({ ...current, interestLevel: event.target.value }))
              }
              value={form.interestLevel}
            >
              {INTEREST_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Summary">
            <textarea
              className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              onChange={(event) =>
                setForm((current) => ({ ...current, content: event.target.value }))
              }
              placeholder="What happened, what was discussed, and any objections or signals."
              value={form.content}
            />
          </Field>
          <Field label="Next step">
            <textarea
              className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              onChange={(event) =>
                setForm((current) => ({ ...current, nextStep: event.target.value }))
              }
              placeholder="Document the next action, owner, or follow-up promise."
              value={form.nextStep}
            />
          </Field>
        </div>

        <Button disabled={createActivity.isPending} type="submit">
          {createActivity.isPending ? "Logging..." : "Log activity"}
        </Button>
      </form>
    </div>
  );
}

function toDateTimeLocalValue(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toOptionalString(value: string) {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function Field({ children, label }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
