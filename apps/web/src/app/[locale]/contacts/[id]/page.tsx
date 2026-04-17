"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetContactQueryKey,
  useGetContact,
  useListActivities,
  useListCompanies,
  useListConversations,
  useListNotes,
  useUpdateContact,
} from "@workspace/api-client-react";
import { ActivityComposer } from "@/components/crm/activity-composer";
import { SectionCard } from "@/components/crm/blocks";
import { EmptyPanel, FeedCard, ProfileTabBar } from "@/components/crm/profile-tabs";
import { ProfileTimelineBrowser } from "@/components/crm/profile-timeline";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = use(params);
  const queryClient = useQueryClient();
  const { data: contact } = useGetContact(id, {
    query: { queryKey: getGetContactQueryKey(id) },
  });
  const { data: companies } = useListCompanies();
  const { data: activities } = useListActivities({ entityType: "contact", entityId: id });
  const { data: notes } = useListNotes({ entityType: "contact", entityId: id });
  const { data: conversations } = useListConversations();
  const updateContact = useUpdateContact();
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState({
    companyId: "",
    fullName: "",
    phone: "",
    email: "",
    jobTitle: "",
    preferredContactMethod: "phone",
    language: "en",
    isPrimary: false,
  });

  useEffect(() => {
    if (!contact) return;
    setForm({
      companyId: contact.companyId ?? "",
      fullName: contact.fullName ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      jobTitle: contact.jobTitle ?? "",
      preferredContactMethod: contact.preferredContactMethod ?? "phone",
      language: contact.language ?? "en",
      isPrimary: Boolean(contact.isPrimary),
    });
  }, [contact]);

  const linkedConversations = useMemo(
    () => (conversations ?? []).filter((conversation) => conversation.linkedContactId === id),
    [conversations, id],
  );
  const linkedCompany = useMemo(
    () => companies?.find((company) => company.id === (form.companyId || contact?.companyId)),
    [companies, contact?.companyId, form.companyId],
  );

  const timelineItems = useMemo(
    () =>
      [
        ...(activities ?? []).map((activity) => ({
          id: `activity-${activity.id}`,
          category: "activity",
          eyebrow: activity.activityType,
          title: activity.subject ?? formatLabel(activity.activityType),
          description: activity.aiSummary ?? activity.content ?? activity.outcome,
          timestamp: activity.activityDatetime,
          searchText: [activity.activityType, activity.subject, activity.content, activity.outcome]
            .filter(Boolean)
            .join(" "),
        })),
        ...(notes ?? []).map((note) => ({
          id: `note-${note.id}`,
          category: "note",
          eyebrow: note.isPinned ? "Pinned note" : note.noteType,
          title: formatLabel(note.noteType),
          description: note.noteBody,
          timestamp: note.updatedAt,
          searchText: [note.noteType, note.noteBody, note.isPinned ? "pinned" : ""]
            .filter(Boolean)
            .join(" "),
        })),
      ].sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp)),
    [activities, notes],
  );

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateContact.mutateAsync({
      id,
      data: {
        ...form,
        companyId: form.companyId || undefined,
      },
    });
    await queryClient.invalidateQueries({ queryKey: getGetContactQueryKey(id) });
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline", count: timelineItems.length },
    { id: "activities", label: "Activities", count: activities?.length ?? 0 },
    { id: "notes", label: "Notes", count: notes?.length ?? 0 },
    { id: "messaging", label: "Messaging", count: linkedConversations.length },
  ];

  return (
    <AppShell
      description="Timeline-first contact workspace with company linkage and messaging context."
      title={contact?.fullName ?? "Contact detail"}
    >
      <div className="space-y-4">
        <ProfileTabBar activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />

        {activeTab === "overview" ? (
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard
              description="Edit contact data and maintain entity linking to the company record."
              title="Contact profile"
            >
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
                <Field label="Full name">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                    value={form.fullName}
                  />
                </Field>
                <Field label="Company">
                  <select
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, companyId: event.target.value }))
                    }
                    value={form.companyId}
                  >
                    <option value="">No linked company</option>
                    {companies?.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Phone">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    value={form.phone}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                    value={form.email}
                  />
                </Field>
                <Field label="Job title">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, jobTitle: event.target.value }))
                    }
                    value={form.jobTitle}
                  />
                </Field>
                <Field label="Preferred contact method">
                  <select
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        preferredContactMethod: event.target.value,
                      }))
                    }
                    value={form.preferredContactMethod}
                  >
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </Field>
                <Field label="Language">
                  <select
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, language: event.target.value }))
                    }
                    value={form.language}
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </Field>
                <Field label="Primary contact">
                  <select
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isPrimary: event.target.value === "true",
                      }))
                    }
                    value={form.isPrimary ? "true" : "false"}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Button disabled={updateContact.isPending} type="submit">
                    {updateContact.isPending ? "Saving..." : "Save contact"}
                  </Button>
                </div>
              </form>
            </SectionCard>

            <div className="space-y-4">
              <SectionCard description="Coverage across the profile workspace." title="Profile summary">
                <div className="grid gap-4 md:grid-cols-2">
                  <FeedCard
                    eyebrow="Timeline"
                    title={`${timelineItems.length} items`}
                    description="Combined activity and note stream for the contact."
                  />
                  <FeedCard
                    eyebrow="Messaging"
                    title={`${linkedConversations.length} threads`}
                    description="Conversations linked directly to this contact."
                  />
                  <FeedCard
                    eyebrow="Activities"
                    title={`${activities?.length ?? 0} logged`}
                    description="Structured calls, follow-ups, and other contact actions."
                  />
                  <FeedCard
                    eyebrow="Notes"
                    title={`${notes?.length ?? 0} notes`}
                    description="Internal knowledge captured for this stakeholder."
                  />
                </div>
              </SectionCard>

              <SectionCard description="Quick navigation to linked account context." title="Linked records">
                <FeedCard
                  eyebrow="Company"
                  title={linkedCompany?.companyName ?? "No company linked"}
                  description={linkedCompany?.businessType ?? "Attach the contact to a company to enrich account context."}
                >
                  {contact?.companyId ? (
                    <div className="mt-3">
                      <Link
                        className="text-sm font-medium text-slate-900 underline underline-offset-4"
                        href={`/${locale}/companies/${contact.companyId}`}
                      >
                        Open company profile
                      </Link>
                    </div>
                  ) : null}
                </FeedCard>
              </SectionCard>
            </div>
          </div>
        ) : null}

        {activeTab === "timeline" ? (
          <SectionCard description="Merged event stream for contact-level work." title="Timeline">
            <ProfileTimelineBrowser
              emptyBody="Activities and notes will collect here as the contact record gets used."
              emptyTitle="Timeline is empty"
              items={timelineItems}
              noResultsBody="No contact timeline items match the current search or type filter."
            />
          </SectionCard>
        ) : null}

        {activeTab === "activities" ? (
          <SectionCard description="Structured actions recorded against this contact." title="Activities">
            <div className="space-y-3">
              <ActivityComposer entityId={id} entityLabel="contact" entityType="contact" />
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
                  body="This contact does not have any logged activity records yet. Use the composer above to add one."
                  title="No activities yet"
                />
              )}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === "notes" ? (
          <SectionCard description="Internal notes associated with this contact." title="Notes">
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
                  body="Notes will appear here once the team starts documenting context on this contact."
                  title="No notes yet"
                />
              )}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === "messaging" ? (
          <SectionCard description="Unified inbox context linked to this contact." title="Messaging">
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
                  body="No messaging threads are linked to this contact yet."
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
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
