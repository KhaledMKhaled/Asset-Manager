import { pgTable, text, boolean, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { leadsTable } from "./leads";
import { contactsTable } from "./contacts";
import { companiesTable } from "./companies";
import { opportunitiesTable } from "./opportunities";
import { usersTable } from "./users";
import { campaignsTable } from "./campaigns";

export const conversationsTable = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  channel: text("channel").notNull().default("whatsapp"), // whatsapp|messenger|instagram
  channelAccountId: uuid("channel_account_id"),
  externalConversationId: text("external_conversation_id"),
  participantName: text("participant_name"),
  participantPhone: text("participant_phone"),
  participantEmail: text("participant_email"),
  participantHandle: text("participant_handle"),
  participantAvatarUrl: text("participant_avatar_url"),
  linkedLeadId: uuid("linked_lead_id").references(() => leadsTable.id, { onDelete: "set null" }),
  linkedContactId: uuid("linked_contact_id").references(() => contactsTable.id, { onDelete: "set null" }),
  linkedCompanyId: uuid("linked_company_id").references(() => companiesTable.id, { onDelete: "set null" }),
  linkedOpportunityId: uuid("linked_opportunity_id").references(() => opportunitiesTable.id, { onDelete: "set null" }),
  status: text("status").notNull().default("new"), // new|open|waiting|resolved|closed
  priority: text("priority").notNull().default("medium"),
  assignedTo: uuid("assigned_to").references(() => usersTable.id, { onDelete: "set null" }),
  team: text("team"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  firstResponseAt: timestamp("first_response_at", { withTimezone: true }),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  slaStatus: text("sla_status").notNull().default("pending"), // pending|ok|warning|breached
  slaFirstResponseDeadline: timestamp("sla_first_response_deadline", { withTimezone: true }),
  slaResolutionDeadline: timestamp("sla_resolution_deadline", { withTimezone: true }),
  aiSummary: text("ai_summary"),
  aiSentiment: text("ai_sentiment"),
  aiIntent: text("ai_intent"),
  aiUrgency: text("ai_urgency"),

  // Bot coverage tracking
  botActive: boolean("bot_active").notNull().default(false),
  botPersonaId: uuid("bot_persona_id"),
  botFlowId: uuid("bot_flow_id"),
  botHandoffAt: timestamp("bot_handoff_at", { withTimezone: true }),
  botMessageCount: integer("bot_message_count").notNull().default(0),
  customerOptedOutOfBot: boolean("customer_opted_out_of_bot").notNull().default(false),

  tags: text("tags").array().notNull().default([]),
  disposition: text("disposition"),
  isSpam: boolean("is_spam").notNull().default(false),
  campaignId: uuid("campaign_id").references(() => campaignsTable.id, { onDelete: "set null" }),
  campaignKey: text("campaign_key"),
  unreadCount: integer("unread_count").notNull().default(0),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  externalMessageId: text("external_message_id"),
  direction: text("direction").notNull().default("inbound"),
  senderType: text("sender_type").notNull().default("customer"), // customer|agent|system|ai|bot
  senderName: text("sender_name"),
  senderId: uuid("sender_id").references(() => usersTable.id, { onDelete: "set null" }),
  contentType: text("content_type").notNull().default("text"),
  messageText: text("message_text"),
  attachmentUrl: text("attachment_url"),
  attachmentMetadata: text("attachment_metadata"), // JSON string for file info
  templateId: uuid("template_id"),
  templateName: text("template_name"),
  templateVariables: text("template_variables"), // JSON string
  deliveryStatus: text("delivery_status").notNull().default("sent"), // sent|delivered|read|failed
  readAt: timestamp("read_at", { withTimezone: true }),
  isInternalNote: boolean("is_internal_note").notNull().default(false),

  // Bot metadata
  botGenerated: boolean("bot_generated").notNull().default(false),
  botPersonaId: uuid("bot_persona_id"),
  botFlowStepId: uuid("bot_flow_step_id"),
  botConfidence: text("bot_confidence"),

  // A/B testing
  abTestVariant: text("ab_test_variant"),

  // Agent feedback
  agentQualityRating: integer("agent_quality_rating"), // 1-5
  agentFeedbackNote: text("agent_feedback_note"),

  aiTags: text("ai_tags").array().notNull().default([]),
  aiSentiment: text("ai_sentiment"),
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
