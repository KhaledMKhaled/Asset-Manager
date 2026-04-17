"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetCompanyQueryKey,
  getListContactsQueryKey,
  useGetCompany,
  useListActivities,
  useListContacts,
  useListConversations,
  useListNotes,
  useUpdateCompany,
} from "@workspace/api-client-react";
import { ActivityComposer } from "@/components/crm/activity-composer";
import { SectionCard } from "@/components/crm/blocks";
import { NotesWorkspace } from "@/components/crm/notes-workspace";
import { EmptyPanel, FeedCard, ProfileTabBar } from "@/components/crm/profile-tabs";
import { ProfileTimelineBrowser } from "@/components/crm/profile-timeline";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = use(params);
  const queryClient = useQueryClient();
  const { data: company } = useGetCompany(id, {
    query: { queryKey: getGetCompanyQueryKey(id) },
  });
  const { data: contacts } = useListContacts(
    { companyId: id },
    { query: { queryKey: getListContactsQueryKey({ companyId: id }) } },
  );
  const { data: activities } = useListActivities({ entityType: "company", entityId: id });
  const { data: notes } = useListNotes({ entityType: "company", entityId: id });
  const { data: conversations } = useListConversations();
  const updateCompany = useUpdateCompany();
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState({
    companyName: "",
    businessType: "",
    companySize: "",
    city: "",
    country: "",
    website: "",
    currentSystem: "",
  });

  useEffect(() => {
    if (!company) return;
    setForm({
      companyName: company.companyName ?? "",
      businessType: company.businessType ?? "",
      companySize: company.companySize ?? "",
      city: company.city ?? "",
      country: company.country ?? "",
      website: company.website ?? "",
      currentSystem: company.currentSystem ?? "",
    });
  }, [company]);

  const contactIds = useMemo(() => new Set((contacts ?? []).map((contact) => contact.id)), [contacts]);
  const linkedConversations = useMemo(
    () =>
      (conversations ?? []).filter(
        (conversation) =>
          conversation.linkedContactId != null && contactIds.has(conversation.linkedContactId),
      ),
    [conversations, contactIds],
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
    await updateCompany.mutateAsync({ id, data: form });
    await queryClient.invalidateQueries({ queryKey: getGetCompanyQueryKey(id) });
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
      description="Account workspace with company profile, stakeholder graph, and messaging coverage."
      title={company?.companyName ?? "Company detail"}
    >
      <div className="space-y-4">
        <ProfileTabBar activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />

        {activeTab === "overview" ? (
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard description="Update company metadata and system context." title="Account profile">
              <form className="grid gap-4" onSubmit={handleSave}>
                <Field label="Company name">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, companyName: event.target.value }))
                    }
                    value={form.companyName}
                  />
                </Field>
                <Field label="Business type">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, businessType: event.target.value }))
                    }
                    value={form.businessType}
                  />
                </Field>
                <Field label="Company size">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, companySize: event.target.value }))
                    }
                    value={form.companySize}
                  />
                </Field>
                <Field label="City">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, city: event.target.value }))
                    }
                    value={form.city}
                  />
                </Field>
                <Field label="Country">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, country: event.target.value }))
                    }
                    value={form.country}
                  />
                </Field>
                <Field label="Website">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, website: event.target.value }))
                    }
                    value={form.website}
                  />
                </Field>
                <Field label="Current system">
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, currentSystem: event.target.value }))
                    }
                    value={form.currentSystem}
                  />
                </Field>
                <Button disabled={updateCompany.isPending} type="submit">
                  {updateCompany.isPending ? "Saving..." : "Save company"}
                </Button>
              </form>
            </SectionCard>

            <div className="space-y-4">
              <SectionCard description="Coverage across account history and engagement tabs." title="Profile summary">
                <div className="grid gap-4 md:grid-cols-2">
                  <FeedCard
                    eyebrow="Timeline"
                    title={`${timelineItems.length} items`}
                    description="Activity and note stream across the company record."
                  />
                  <FeedCard
                    eyebrow="Messaging"
                    title={`${linkedConversations.length} threads`}
                    description="Inbox conversations linked to contacts at this company."
                  />
                  <FeedCard
                    eyebrow="Activities"
                    title={`${activities?.length ?? 0} logged`}
                    description="Structured account-level work captured on the company."
                  />
                  <FeedCard
                    eyebrow="Contacts"
                    title={`${contacts?.length ?? 0} linked`}
                    description="Stakeholders and decision makers connected to the account."
                  />
                </div>
              </SectionCard>

              <SectionCard
                description="Linked contacts help complete the entity graph for companies and leads."
                title="Linked contacts"
              >
                <div className="space-y-3">
                  {contacts?.length ? (
                    contacts.map((contact) => (
                      <FeedCard
                        key={contact.id}
                        eyebrow={contact.isPrimary ? "Primary contact" : "Contact"}
                        title={contact.fullName}
                        description={contact.jobTitle ?? contact.email ?? "No role or email added yet."}
                      >
                        <div className="mt-3">
                          <Link
                            className="text-sm font-medium text-slate-900 underline underline-offset-4"
                            href={`/${locale}/contacts/${contact.id}`}
                          >
                            Open contact profile
                          </Link>
                        </div>
                      </FeedCard>
                    ))
                  ) : (
                    <EmptyPanel
                      body="No contacts are linked to this company yet."
                      title="No linked contacts"
                    />
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        ) : null}

        {activeTab === "timeline" ? (
          <SectionCard description="Merged account history for this company." title="Timeline">
            <ProfileTimelineBrowser
              emptyBody="Activities and notes will appear here as the account team works the company record."
              emptyTitle="Timeline is empty"
              items={timelineItems}
              noResultsBody="No company timeline items match the current search or type filter."
            />
          </SectionCard>
        ) : null}

        {activeTab === "activities" ? (
          <SectionCard description="Structured account actions recorded on the company." title="Activities">
            <div className="space-y-3">
              <ActivityComposer entityId={id} entityLabel="company" entityType="company" />
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
                  body="This company does not have any activity records yet. Use the composer above to add one."
                  title="No activities yet"
                />
              )}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === "notes" ? (
          <SectionCard description="Internal notes and context for the company record." title="Notes">
            <NotesWorkspace
              emptyBody="Notes will show here as the team adds account intelligence."
              entityId={id}
              entityLabel="company"
              entityType="company"
              notes={notes}
            />
          </SectionCard>
        ) : null}

        {activeTab === "messaging" ? (
          <SectionCard description="Inbox threads associated with contacts at this company." title="Messaging">
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
                  body="Messaging threads will appear here once linked contacts have active conversations."
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
