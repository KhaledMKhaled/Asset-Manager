import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import {
  useGetConversation, useSendMessage, useAssignConversation, useCloseConversation,
  getGetConversationQueryKey,
} from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, X, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConversationPage() {
  const [, params] = useRoute("/inbox/:id");
  const id = params?.id ?? "";
  const [text, setText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: conv, isLoading } = useGetConversation(id, {
    query: { enabled: !!id, queryKey: getGetConversationQueryKey(id) },
  });

  const sendMsg = useSendMessage();
  const closeConv = useCloseConversation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages]);

  async function handleSend() {
    if (!text.trim()) return;
    try {
      await sendMsg.mutateAsync({ id, data: { messageText: text.trim(), isInternalNote } });
      setText("");
      queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(id) });
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  }

  async function handleClose() {
    try {
      await closeConv.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(id) });
      toast({ title: "Conversation closed" });
    } catch {
      toast({ title: "Failed to close", variant: "destructive" });
    }
  }

  const messages = conv?.messages ?? [];

  return (
    <AppShell title="Conversation">
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col rounded-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <Link href="/inbox">
                <Button variant="ghost" size="icon" className="h-7 w-7" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <p className="text-sm font-medium text-foreground">{conv?.participantName ?? conv?.participantPhone ?? "Unknown"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {conv && <StatusBadge status={conv.status} />}
                  <span className="text-xs capitalize text-muted-foreground">{conv?.channel}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {conv?.status !== "resolved" && (
                <Button
                  data-testid="button-close-conversation"
                  variant="outline"
                  size="sm"
                  className="gap-2 h-7 text-xs"
                  onClick={handleClose}
                >
                  <X className="h-3.5 w-3.5" /> Close
                </Button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No messages yet
              </div>
            ) : (
              messages.map((msg) => {
                const isOut = msg.direction === "outbound";
                const isNote = msg.isInternalNote;
                const isBot = msg.botGenerated;
                return (
                  <div
                    key={msg.id}
                    data-testid={`message-${msg.id}`}
                    className={cn("flex gap-2", isOut ? "justify-end" : "justify-start")}
                  >
                    {!isOut && (
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                        {isBot ? <Bot className="h-3.5 w-3.5 text-purple-400" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[70%] rounded-xl px-3 py-2 text-sm",
                      isNote
                        ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-200"
                        : isOut
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    )}>
                      {isNote && <p className="text-xs font-medium mb-1 opacity-70">Internal Note</p>}
                      <p className="leading-relaxed">{msg.messageText}</p>
                      <p className="text-[10px] mt-1 opacity-60">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {isOut && (
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply input */}
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                id="internal-note"
                checked={isInternalNote}
                onCheckedChange={setIsInternalNote}
              />
              <Label htmlFor="internal-note" className="text-xs cursor-pointer">Internal Note</Label>
            </div>
            <div className="flex gap-2">
              <Textarea
                data-testid="input-message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isInternalNote ? "Add internal note..." : "Type your message..."}
                className={cn(
                  "resize-none text-sm min-h-[64px] max-h-32",
                  isInternalNote && "border-yellow-500/50 bg-yellow-500/5"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                data-testid="button-send-message"
                size="icon"
                className="h-16 w-10 shrink-0"
                onClick={handleSend}
                disabled={!text.trim() || sendMsg.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* CRM Entity panel */}
        <div className="w-60 shrink-0 rounded-lg border border-border p-4 space-y-4 overflow-y-auto">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Details</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <span className="capitalize text-foreground">{conv?.channel ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                {conv && <StatusBadge status={conv.priority} />}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SLA</span>
                {conv && <StatusBadge status={conv.slaStatus} />}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages</span>
                <span className="text-foreground">{conv?.messageCount ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bot</span>
                <span className={conv?.botActive ? "text-purple-400" : "text-muted-foreground"}>
                  {conv?.botActive ? "Active" : "Off"}
                </span>
              </div>
            </div>
          </div>

          {conv?.linkedLeadId && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Linked Lead</p>
              <Link href={`/leads/${conv.linkedLeadId}`}>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View Lead
                </Button>
              </Link>
            </div>
          )}

          {conv?.aiSummary && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">AI Summary</p>
              <p className="text-xs text-muted-foreground">{conv.aiSummary}</p>
            </div>
          )}

          {conv?.tags && conv.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {conv.tags.map((t) => (
                  <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
