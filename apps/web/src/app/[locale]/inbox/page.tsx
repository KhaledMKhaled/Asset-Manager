"use client";

import { Link } from "@/i18n/routing";
import { getListConversationsQueryKey, useListConversations } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { StatusBadge } from "@/components/crm/badges";

export default function InboxPage() {
  const { data } = useListConversations(undefined, {
    query: { queryKey: getListConversationsQueryKey() },
  });

  return (
    <AppShell description="Scope 10 omnichannel messaging with unified conversation access across social and chat channels." title="Unified inbox">
      <SectionCard description="Open the conversation view to reply, reassign, and close threads." title="Conversations">
        <div className="space-y-3">
          {data?.map((conversation) => (
            <Link
              key={conversation.id}
              className="block rounded-[1.5rem] bg-white/70 px-4 py-4 transition hover:bg-white"
              href={`/inbox/${conversation.id}`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{conversation.participantName ?? "Unknown participant"}</p>
                  <p className="mt-1 text-sm text-muted">
                    {conversation.channel} • {conversation.aiSummary ?? "Conversation ready for review"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={conversation.status} />
                  <span className="text-sm text-muted">{conversation.unreadCount} unread</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
