import { pgTable, text, boolean, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { leadsTable } from "./leads";
import { contactsTable } from "./contacts";
import { usersTable } from "./users";

export const conversationsTable = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  channel: text("channel").notNull().default("whatsapp"),
  participantName: text("participant_name"),
  participantPhone: text("participant_phone"),
  participantAvatarUrl: text("participant_avatar_url"),
  linkedLeadId: uuid("linked_lead_id").references(() => leadsTable.id, { onDelete: "set null" }),
  linkedContactId: uuid("linked_contact_id").references(() => contactsTable.id, { onDelete: "set null" }),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  assignedTo: uuid("assigned_to").references(() => usersTable.id, { onDelete: "set null" }),
  team: text("team"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  slaStatus: text("sla_status").notNull().default("ok"),
  slaBreachAt: timestamp("sla_breach_at", { withTimezone: true }),
  aiSummary: text("ai_summary"),
  aiSentiment: text("ai_sentiment"),
  botActive: boolean("bot_active").notNull().default(false),
  unreadCount: integer("unread_count").notNull().default(0),
  messageCount: integer("message_count").notNull().default(0),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  direction: text("direction").notNull().default("inbound"),
  senderType: text("sender_type").notNull().default("customer"),
  senderName: text("sender_name"),
  senderId: uuid("sender_id").references(() => usersTable.id, { onDelete: "set null" }),
  contentType: text("content_type").notNull().default("text"),
  messageText: text("message_text"),
  attachmentUrl: text("attachment_url"),
  deliveryStatus: text("delivery_status").notNull().default("delivered"),
  isInternalNote: boolean("is_internal_note").notNull().default(false),
  botGenerated: boolean("bot_generated").notNull().default(false),
  aiSentiment: text("ai_sentiment"),
  templateId: uuid("template_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversationsTable.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
