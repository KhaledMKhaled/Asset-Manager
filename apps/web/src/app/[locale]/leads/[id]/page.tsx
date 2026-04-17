"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetLeadQueryKey,
  getGetLeadTimelineQueryKey,
  useGetLead,
  useGetLeadTimeline,
  useListActivities,
  useListCompanies,
  useListContacts,
  useListConversations,
  useListFunnelStages,
  useListNotes,
  useListUsers,
  useScoreLeadAi,
  useUpdateLead,
} from "@workspace/api-client-react";
import { SectionCard } from "@/components/crm/blocks";
import { ScoreBadge, StatusBadge } from "@/components/crm/badges";
import { EmptyPanel, FeedCard, ProfileTabBar } from "@/components/crm/profile-tabs";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = use(params);
  const queryClient = useQueryClient();
  const scoreLead = useScoreLeadAi();
  const updateLead = useUpdateLead();
  const { data: lead } = useGetLead(id, {
    query: { queryKey: getGetLeadQueryKey(id) },
  });
  const { data: timeline } = useGetLeadTimeline(id, {
    query: { queryKey: getGetLeadTimelineQueryKey(id) },
  });
  const { data: activities } = useListActivities({ entityType: "lead", entityId: id });
  const { data: notes } = useListNotes({ entityType: "lead", entityId: id });
  const { data: conversations } = useListConversations();
  const { data: companies } = useListCompanies();
  const { data: contacts } = useListContacts();
  const { data: users } = useListUsers();
  const { data: stages } = useListFunnelStages();
  const [tagsInput, setTagsInput] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setTagsInput(lead?.tags?.join(", ") ?? "");
  }, [lead?.tags]);

  const linkedConversations = useMemo(
    () =>
      (conversations ?? []).filter(
        (conversation) =>
          conversation.linkedLeadId === id ||
          (lead?.primaryContactId != null && conversation.linkedContactId === lead.primaryContactId),
      ),
    [conversations, id, lead?.primaryContactId],
  );

  async function handleScore() {
    await scoreLead.mutateAsync({ id });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(id) }),
      queryClient.invalidateQueries({ queryKey: getGetLeadTimelineQueryKey(id) }),
    ]);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateLead.mutateAsync({
      id,
      data: {
        companyId: toOptionalString(formData.get("companyId")),
        primaryContactId: toOptionalString(formData.get("primaryContactId")),
        assignedTo: toOptionalString(formData.get("assignedTo")),
        leadSource: toOptionalString(formData.get("leadSource")),
        leadStatus: toOptionalString(formData.get("leadStatus")),
        contactStatus: toOptionalString(formData.get("contactStatus")),
        qualificationStatus: toOptionalString(formData.get("qualificationStatus")),
        currentFunnelStageId: toOptionalString(formData.get("currentFunnelStageId")),
        aiSummary: toOptionalString(formData.get("aiSummary")),
        tags: tagsInput.split(",").map((item) => item.trim()).filter(Boolean),
      },
    });
    await queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(id) });
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline", count: timeline?.length ?? 0 },
    { id: "activities", label: "Activities", count: activities?.length ?? 0 },
    { id: "notes", label: "Notes", count: notes?.length ?? 0 },
    { id: "messaging", label: "Messaging", count: linkedConversations.length },
  ];

  return (
    <AppShell
      description="Timeline-first customer profile with editable ownership, related records, and channel context."
      title={lead?.company?.companyName ?? lead?.leadCode ?? "Lead detail"}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge value={lead?.leadStatus} />
          <ScoreBadge grade={lead?.scoreGrade} score={lead?.aiLeadScore} />
          {lead?.duplicateFlag ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Potential duplicate
            </span>
          ) : null}
        </div>

        <ProfileTabBar activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />

        {activeTab === "overview" ? (
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard description="Core qualification, entity linking, and ownership details." title="Profile">
              <form className="space-y-4 text-sm" onSubmit={handleSave}>
                <Field label="Company">
                  <select
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    defaultValue={lead?.companyId ?? ""}
                    name="companyId"
                  >
                    <option value="">No company selected</option>
                    {companies?.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Primary contact">
                  <select
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    defaultValue={lead?.primaryContactId ?? ""}
                    name="primaryContactId"
                  >
                    <option value="">No contact selected</option>
                    {contacts?.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.fullName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Assigned user">
                  <select
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    defaultValue={lead?.assignedTo ?? ""}
                    name="assignedTo"
                  >
                    <option value="">Unassigned</option>
                    {users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Lead source">
                  <Input defaultValue={lead?.leadSource ?? ""} name="leadSource" />
                </Field>
                <Field label="Lead status">
                  <Input defaultValue={lead?.leadStatus ?? ""} name="leadStatus" />
                </Field>
                <Field label="Contact status">
                  <Input defaultValue={lead?.contactStatus ?? ""} name="contactStatus" />
                </Field>
                <Field label="Qualification status">
                  <Input defaultValue={lead?.qualificationStatus ?? ""} name="qualificationStatus" />
                </Field>
                <Field label="Funnel stage">
                  <select
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    defaultValue={lead?.currentFunnelStageId ?? ""}
                    name="currentFunnelStageId"
                  >
                    <option value="">No funnel stage</option>
                    {stages?.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tags">
                  <Input onChange={(event) => setTagsInput(event.target.value)} value={tagsInput} />
                </Field>
                <Field label="AI summary">
                  <textarea
                    className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    defaultValue={lead?.aiSummary ?? ""}
                    name="aiSummary"
                  />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={updateLead.isPending} type="submit">
                    {updateLead.isPending ? "Saving..." : "Save lead"}
                  </Button>
                  <Button onClick={handleScore} size="sm" type="button" variant="outline">
                    Rescore lead
                  </Button>
                </div>
              </form>
            </SectionCard>

            <div className="space-y-4">
              <SectionCard description="Current coverage across profile tabs and linked entities." title="Profile summary">
                <div className="grid gap-4 md:grid-cols-2">
                  <FeedCard
                    eyebrow="Timeline"
                    title={`${timeline?.length ?? 0} events`}
                    description="History of stage changes, AI updates, and system-generated milestones."
                  />
                  <FeedCard
                    eyebrow="Activities"
                    title={`${activities?.length ?? 0} logged`}
                    description="Manual outreach and structured activity records on this lead."
                  />
                  <FeedCard
                    eyebrow="Notes"
                    title={`${notes?.length ?? 0} notes`}
                    description="Pinned context and internal observations for the account team."
                  />
                  <FeedCard
                    eyebrow="Messaging"
                    title={`${linkedConversations.length} threads`}
                    description="Inbox conversations linked to the lead or its primary contact."
                  />
                </div>
              </SectionCard>

              <SectionCard description="Quick access to the linked record graph for this lead." title="Related records">
                <div className="space-y-3">
                  <FeedCard
                    eyebrow="Company"
                    title={lead?.company?.companyName ?? "No company linked"}
                    description={lead?.company?.businessType ?? "Link the lead to a company record to complete account context."}
                  >
                    {lead?.companyId ? (
                      <div className="mt-3">
                        <Link
                          className="text-sm font-medium text-slate-900 underline underline-offset-4"
                          href={`/${locale}/companies/${lead.companyId}`}
                        >
                          Open company profile
                        </Link>
                      </div>
                    ) : null}
                  </FeedCard>
                  <FeedCard
                    eyebrow="Primary contact"
                    title={lead?.primaryContact?.fullName ?? "No contact linked"}
                    description={lead?.primaryContact?.email ?? lead?.primaryContact?.phone ?? "Link a contact to unlock richer messaging context."}
                  >
                    {lead?.primaryContactId ? (
                      <div className="mt-3">
                        <Link
                          className="text-sm font-medium text-slate-900 underline underline-offset-4"
                          href={`/${locale}/contacts/${lead.primaryContactId}`}
                        >
                          Open contact profile
                        </Link>
                      </div>
                    ) : null}
                  </FeedCard>
                </div>
              </SectionCard>
            </div>
          </div>
        ) : null}

        {activeTab === "timeline" ? (
          <SectionCard description="Chronological event stream for the lead lifecycle." title="Timeline">
            <div className="space-y-3">
              {timeline?.length ? (
                timeline.map((item) => (
                  <FeedCard
                    key={item.id}
                    eyebrow={item.sourceSystem ?? item.eventType}
                    title={item.renderedTitle ?? item.eventType}
                    description={item.renderedDescription}
                    meta={formatDateTime(item.eventTimestamp)}
                  />
                ))
              ) : (
                <EmptyPanel
                  body="No timeline events are available yet for this lead."
                  title="Timeline is empty"
                />
              )}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === "activities" ? (
          <SectionCard description="Logged outreach, follow-up, and structured actions." title="Activities">
            <div className="space-y-3">
              {activities?.length ? (
                activities.map((activity) => (
                  <FeedCard
                    key={activity.id}
                    eyebrow={activity.activityType}
                    title={activity.subject ?? formatLabel(activity.activityType)}
                    description={activity.aiSummary ?? activity.content ?? activity.outcome}
                    meta={formatDateTime(activity.activityDatetime)}
                  />
                ))
              ) : (
                <EmptyPanel
                  body="Structured activity logging lands in the next Scope 3 tasks. This tab is now ready to display those records."
                  title="No activities yet"
                />
              )}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === "notes" ? (
          <SectionCard description="Internal context, observations, and pinned guidance." title="Notes">
            <div className="space-y-3">
              {notes?.length ? (
                notes.map((note) => (
                  <FeedCard
                    key={note.id}
                    eyebrow={note.isPinned ? "Pinned note" : note.noteType}
                    title={formatLabel(note.noteType)}
                    description={note.noteBody}
                    meta={formatDateTime(note.updatedAt)}
                  />
                ))
              ) : (
                <EmptyPanel
                  body="Notes will appear here as soon as they are created or synced to this lead."
                  title="No notes yet"
                />
              )}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === "messaging" ? (
          <SectionCard description="Channel threads linked to the lead and its primary contact." title="Messaging">
            <div className="space-y-3">
              {linkedConversations.length ? (
                linkedConversations.map((conversation) => (
                  <FeedCard
                    key={conversation.id}
                    eyebrow={conversation.channel}
                    title={conversation.participantName ?? "Conversation"}
                    description={conversation.aiSummary ?? `${conversation.messageCount} messages in ${conversation.status} status.`}
                    meta={formatDateTime(conversation.lastMessageAt ?? conversation.openedAt)}
                  >
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
                      <span>Status: {conversation.status}</span>
                      <span>Unread: {conversation.unreadCount}</span>
                      <Link
                        className="font-medium text-slate-900 underline underline-offset-4"
                        href={`/${locale}/inbox/${conversation.id}`}
                      >
                        Open thread
                      </Link>
                    </div>
                  </FeedCard>
                ))
              ) : (
                <EmptyPanel
                  body="Messaging threads will appear here once conversations are linked to this lead or its primary contact."
                  title="No messaging threads"
                />
              )}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}

function toOptionalString(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : undefined;
}

function formatLabel(value: string) {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
