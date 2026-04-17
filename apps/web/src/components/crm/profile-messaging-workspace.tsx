"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { Conversation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyPanel, FeedCard } from "@/components/crm/profile-tabs";

export interface MessagingQuickLink {
  href: string;
  label: string;
}

export function ProfileMessagingWorkspace({
  contextLinks = [],
  conversations,
  emptyBody,
  noResultsBody = "Try adjusting the search or conversation filter.",
  resolveConversationLinks,
}: {
  conversations: Conversation[];
  emptyBody: string;
  noResultsBody?: string;
  contextLinks?: MessagingQuickLink[];
  resolveConversationLinks?: (conversation: Conversation) => MessagingQuickLink[];
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const filters = useMemo(
    () => [
      { id: "all", label: "All", count: conversations.length },
      {
        id: "open",
        label: "Open",
        count: conversations.filter((conversation) => conversation.status === "open").length,
      },
      {
        id: "unread",
        label: "Unread",
        count: conversations.filter((conversation) => conversation.unreadCount > 0).length,
      },
      {
        id: "bot-active",
        label: "Bot active",
        count: conversations.filter((conversation) => conversation.botActive).length,
      },
      {
        id: "priority",
        label: "High priority",
        count: conversations.filter((conversation) => conversation.priority === "high").length,
      },
    ],
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "open" && conversation.status === "open") ||
        (activeFilter === "unread" && conversation.unreadCount > 0) ||
        (activeFilter === "bot-active" && conversation.botActive) ||
        (activeFilter === "priority" && conversation.priority === "high");

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        conversation.channel,
        conversation.participantName,
        conversation.status,
        conversation.priority,
        conversation.aiSummary,
        ...(conversation.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [activeFilter, conversations, deferredSearch]);

  const unreadTotal = useMemo(
    () => conversations.reduce((total, conversation) => total + conversation.unreadCount, 0),
    [conversations],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] bg-white/70 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Threads" value={conversations.length} />
          <SummaryCard label="Unread" value={unreadTotal} />
          <SummaryCard
            label="Bot Active"
            value={conversations.filter((conversation) => conversation.botActive).length}
          />
        </div>
        {contextLinks.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {contextLinks.map((link) => (
              <Button asChild key={link.href} size="sm" type="button" variant="outline">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-[1.5rem] bg-white/70 p-4">
        <div className="flex flex-col gap-3">
          <Input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
            value={search}
          />
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const selected = filter.id === activeFilter;
              return (
                <Button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  size="sm"
                  type="button"
                  variant={selected ? "default" : "outline"}
                >
                  {filter.label}
                  <span className="ml-2 opacity-80">{filter.count}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {!conversations.length ? (
          <EmptyPanel body={emptyBody} title="No messaging threads" />
        ) : !filteredConversations.length ? (
          <EmptyPanel body={noResultsBody} title="No matching threads" />
        ) : (
          filteredConversations.map((conversation) => {
            const quickLinks = resolveConversationLinks?.(conversation) ?? [];

            return (
              <FeedCard
                key={conversation.id}
                eyebrow={conversation.channel}
                title={conversation.participantName ?? "Conversation"}
                description={
                  conversation.aiSummary ??
                  `${conversation.messageCount} messages in ${conversation.status} status.`
                }
                meta={formatDateTime(conversation.lastMessageAt ?? conversation.openedAt)}
              >
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Status: {formatLabel(conversation.status)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Priority: {formatLabel(conversation.priority)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Unread: {conversation.unreadCount}
                  </span>
                  {conversation.botActive ? (
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-900">
                      Bot active
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" type="button">
                    <Link href={`./${conversation.id}`}>Open thread</Link>
                  </Button>
                  {quickLinks.map((link) => (
                    <Button asChild key={link.href} size="sm" type="button" variant="outline">
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  ))}
                </div>
              </FeedCard>
            );
          })
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.25rem] bg-slate-50/90 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatLabel(value: string) {
  return value
    .split(/[_-\s]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
