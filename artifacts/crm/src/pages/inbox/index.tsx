import { useState } from "react";
import { Link } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import {
  useListConversations, useCloseConversation,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, MessageCircle, Phone, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNELS = ["all", "whatsapp", "messenger", "instagram"] as const;
const channelColors: Record<string, string> = {
  whatsapp: "text-green-400",
  messenger: "text-blue-400",
  instagram: "text-pink-400",
};

export default function InboxPage() {
  const [channel, setChannel] = useState<string>("all");
  const [status, setStatus] = useState<string>("open");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const params = {
    ...(channel !== "all" ? { channel } : {}),
    ...(status !== "all" ? { status } : {}),
    ...(search ? { search } : {}),
  };

  const { data: conversations, isLoading } = useListConversations(params, {
    query: { queryKey: getListConversationsQueryKey(params) },
  });

  const closeConv = useCloseConversation();

  async function handleClose(id: string) {
    try {
      await closeConv.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey({}) });
      toast({ title: "Conversation closed" });
    } catch {
      toast({ title: "Failed to close", variant: "destructive" });
    }
  }

  return (
    <AppShell title="Inbox">
      <div className="space-y-4">
        {/* Channel tabs */}
        <div className="flex items-center gap-1 border-b border-border pb-1">
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              data-testid={`tab-channel-${ch}`}
              className={cn(
                "px-4 py-1.5 text-sm rounded-t font-medium capitalize transition-colors",
                channel === ch
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setChannel(ch)}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search conversations..."
              className="pl-8 h-8 w-48 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {["all", "open", "pending", "resolved"].map((s) => (
            <button
              key={s}
              data-testid={`filter-status-${s}`}
              className={cn(
                "px-3 py-1 text-xs rounded-full border transition-colors capitalize",
                status === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          {isLoading ? (
            <div className="space-y-0">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="p-4 border-b border-border/50 flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : !conversations?.length ? (
            <div className="py-16 text-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No conversations found</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                data-testid={`row-conversation-${conv.id}`}
                className="flex items-center gap-4 p-3 border-b border-border/50 hover:bg-muted/20 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Phone className={`h-4 w-4 ${channelColors[conv.channel] ?? "text-muted-foreground"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {conv.participantName ?? conv.participantPhone ?? "Unknown"}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs capitalize font-medium ${channelColors[conv.channel] ?? "text-muted-foreground"}`}>
                      {conv.channel}
                    </span>
                    <StatusBadge status={conv.status} />
                    {conv.priority !== "normal" && <StatusBadge status={conv.priority} />}
                    {conv.slaStatus !== "ok" && <StatusBadge status={conv.slaStatus} />}
                    {conv.botActive && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Bot Active</span>
                    )}
                  </div>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/inbox/${conv.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-open-conv-${conv.id}`}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  {conv.status !== "resolved" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      data-testid={`button-close-conv-${conv.id}`}
                      onClick={() => handleClose(conv.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
