"use client";

import { use, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetConversationQueryKey, useCloseConversation, useGetConversation, useSendMessage } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data } = useGetConversation(id, {
    query: { queryKey: getGetConversationQueryKey(id) },
  });
  const sendMessage = useSendMessage();
  const closeConversation = useCloseConversation();
  const [message, setMessage] = useState("");

  async function handleSend() {
    if (!message.trim()) return;
    await sendMessage.mutateAsync({
      id,
      data: { messageText: message, contentType: "text", isInternalNote: false },
    });
    setMessage("");
    await queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(id) });
  }

  async function handleClose() {
    await closeConversation.mutateAsync({ id });
    await queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(id) });
  }

  return (
    <AppShell description="Reply to the customer, review the transcript, and close the conversation when resolved." title={data?.participantName ?? "Conversation"}>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard description="Chronological message history from the unified inbox." title="Messages">
          <div className="space-y-3">
            {data?.messages?.map((item) => (
              <div
                key={item.id}
                className={[
                  "max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm",
                  item.direction === "outbound"
                    ? "ml-auto bg-cyan-100 text-cyan-900"
                    : "bg-white/80",
                ].join(" ")}
              >
                <p>{item.messageText ?? "Non-text content"}</p>
                <p className="mt-2 text-xs opacity-70">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard description="Reply, handoff, and resolution controls." title="Actions">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Reply</label>
              <Input onChange={(event) => setMessage(event.target.value)} placeholder="Send a message" value={message} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSend}>Send</Button>
              <Button onClick={handleClose} variant="outline">Close conversation</Button>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 px-4 py-4 text-sm">
              <p className="font-semibold">Conversation details</p>
              <p className="mt-2 text-muted">Channel: {data?.channel ?? "-"}</p>
              <p className="mt-1 text-muted">Status: {data?.status ?? "-"}</p>
              <p className="mt-1 text-muted">Unread count: {data?.unreadCount ?? 0}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
