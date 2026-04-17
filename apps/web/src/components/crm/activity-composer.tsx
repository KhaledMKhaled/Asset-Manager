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

const CALL_OUTCOME_OPTIONS = [
  { value: "connected", label: "Connected" },
  { value: "no_answer", label: "No answer" },
  { value: "voicemail", label: "Voicemail" },
  { value: "callback_requested", label: "Callback requested" },
  { value: "wrong_number", label: "Wrong number" },
  { value: "qualified", label: "Qualified" },
  { value: "demo_booked", label: "Demo booked" },
  { value: "not_interested", label: "Not interested" },
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
  const [callForm, setCallForm] = useState({
    durationMinutes: "",
    reachedCustomer: "yes",
    decisionMakerPresent: "unknown",
    objections: "",
    callbackAt: "",
    followUpCommitment: "",
  });

  const isCallActivity = form.activityType === "call";
  const outcomeOptions = isCallActivity ? CALL_OUTCOME_OPTIONS : OUTCOME_OPTIONS;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = buildSubject({
      activityType: form.activityType,
      fallbackSubject: form.subject,
      direction: form.direction,
      outcome: form.outcome,
    });
    const content = isCallActivity
      ? buildCallContent({
          summary: form.content,
          durationMinutes: callForm.durationMinutes,
          reachedCustomer: callForm.reachedCustomer,
          decisionMakerPresent: callForm.decisionMakerPresent,
          objections: callForm.objections,
          callbackAt: callForm.callbackAt,
          followUpCommitment: callForm.followUpCommitment,
        })
      : toOptionalString(form.content);
    const nextStep = isCallActivity
      ? buildNextStep({
          explicitNextStep: form.nextStep,
          callbackAt: callForm.callbackAt,
          followUpCommitment: callForm.followUpCommitment,
        })
      : toOptionalString(form.nextStep);

    await createActivity.mutateAsync({
      data: {
        entityType,
        entityId,
        activityType: form.activityType,
        direction: form.direction || undefined,
        activityDatetime: form.activityDatetime
          ? new Date(form.activityDatetime).toISOString()
          : undefined,
        subject,
        content,
        outcome: toOptionalString(form.outcome),
        nextStep,
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
    setCallForm({
      durationMinutes: "",
      reachedCustomer: "yes",
      decisionMakerPresent: "unknown",
      objections: "",
      callbackAt: "",
      followUpCommitment: "",
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
                setForm((current) => ({
                  ...current,
                  activityType: event.target.value,
                  outcome: event.target.value === "call" ? "connected" : current.outcome,
                }))
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
              {!isCallActivity ? <option value="">Not set</option> : null}
              {outcomeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {isCallActivity ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
            <div className="mb-4">
              <p className="text-sm font-semibold">Call outcome form</p>
              <p className="mt-1 text-sm text-muted">
                Capture the structured result of the conversation so the next rep sees exactly what happened.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Duration (minutes)">
                <Input
                  min="0"
                  onChange={(event) =>
                    setCallForm((current) => ({
                      ...current,
                      durationMinutes: event.target.value,
                    }))
                  }
                  placeholder="12"
                  type="number"
                  value={callForm.durationMinutes}
                />
              </Field>
              <Field label="Reached customer">
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  onChange={(event) =>
                    setCallForm((current) => ({
                      ...current,
                      reachedCustomer: event.target.value,
                    }))
                  }
                  value={callForm.reachedCustomer}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>
              <Field label="Decision maker present">
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  onChange={(event) =>
                    setCallForm((current) => ({
                      ...current,
                      decisionMakerPresent: event.target.value,
                    }))
                  }
                  value={callForm.decisionMakerPresent}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              </Field>
              <Field label="Callback at">
                <Input
                  onChange={(event) =>
                    setCallForm((current) => ({
                      ...current,
                      callbackAt: event.target.value,
                    }))
                  }
                  type="datetime-local"
                  value={callForm.callbackAt}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Objections or blockers">
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  onChange={(event) =>
                    setCallForm((current) => ({
                      ...current,
                      objections: event.target.value,
                    }))
                  }
                  placeholder="Pricing concern, integration blocker, timing issue, or no objections."
                  value={callForm.objections}
                />
              </Field>
              <Field label="Follow-up commitment">
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  onChange={(event) =>
                    setCallForm((current) => ({
                      ...current,
                      followUpCommitment: event.target.value,
                    }))
                  }
                  placeholder="What was promised, who owns it, and what should happen next."
                  value={callForm.followUpCommitment}
                />
              </Field>
            </div>
          </div>
        ) : null}

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
              placeholder={
                isCallActivity
                  ? "What was discussed on the call, what signals you heard, and what changed."
                  : "What happened, what was discussed, and any objections or signals."
              }
              value={form.content}
            />
          </Field>
          <Field label="Next step">
            <textarea
              className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              onChange={(event) =>
                setForm((current) => ({ ...current, nextStep: event.target.value }))
              }
              placeholder={
                isCallActivity
                  ? "Document the explicit next action if it differs from the call commitment above."
                  : "Document the next action, owner, or follow-up promise."
              }
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

function buildSubject({
  activityType,
  direction,
  fallbackSubject,
  outcome,
}: {
  activityType: string;
  direction: string;
  fallbackSubject: string;
  outcome: string;
}) {
  const subject = toOptionalString(fallbackSubject);
  if (subject) {
    return subject;
  }

  const parts = [formatLabel(direction), formatLabel(activityType)];
  if (outcome) {
    parts.push(`(${formatLabel(outcome)})`);
  }
  return parts.join(" ");
}

function buildCallContent({
  summary,
  durationMinutes,
  reachedCustomer,
  decisionMakerPresent,
  objections,
  callbackAt,
  followUpCommitment,
}: {
  summary: string;
  durationMinutes: string;
  reachedCustomer: string;
  decisionMakerPresent: string;
  objections: string;
  callbackAt: string;
  followUpCommitment: string;
}) {
  const sections = [
    `Call summary: ${toOptionalString(summary) ?? "No summary provided."}`,
    `Reached customer: ${formatLabel(reachedCustomer)}`,
    `Decision maker present: ${formatLabel(decisionMakerPresent)}`,
  ];

  if (toOptionalString(durationMinutes)) {
    sections.push(`Duration (minutes): ${durationMinutes.trim()}`);
  }

  if (toOptionalString(objections)) {
    sections.push(`Objections / blockers: ${objections.trim()}`);
  }

  if (toOptionalString(callbackAt)) {
    sections.push(`Callback requested: ${new Date(callbackAt).toLocaleString()}`);
  }

  if (toOptionalString(followUpCommitment)) {
    sections.push(`Follow-up commitment: ${followUpCommitment.trim()}`);
  }

  return sections.join("\n");
}

function buildNextStep({
  explicitNextStep,
  callbackAt,
  followUpCommitment,
}: {
  explicitNextStep: string;
  callbackAt: string;
  followUpCommitment: string;
}) {
  const preferred = toOptionalString(explicitNextStep);
  if (preferred) {
    return preferred;
  }

  const commitment = toOptionalString(followUpCommitment);
  const callback = toOptionalString(callbackAt);

  if (commitment && callback) {
    return `${commitment} by ${new Date(callbackAt).toLocaleString()}`;
  }

  if (commitment) {
    return commitment;
  }

  if (callback) {
    return `Call back on ${new Date(callbackAt).toLocaleString()}`;
  }

  return undefined;
}

function formatLabel(value: string) {
  return value
    .split(/[_-\s]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function Field({ children, label }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
