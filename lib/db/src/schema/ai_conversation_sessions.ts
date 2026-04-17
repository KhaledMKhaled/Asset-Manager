import { pgTable, text, integer, numeric, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conversationsTable } from "./conversations";
import { botPersonasTable } from "./bot_personas";
import { botFlowsTable } from "./bot_flows";
import { usersTable } from "./users";

export const aiConversationSessionsTable = pgTable("ai_conversation_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversationsTable.id, { onDelete: "cascade" }),
  botPersonaId: uuid("bot_persona_id").references(() => botPersonasTable.id, { onDelete: "set null" }),
  botFlowId: uuid("bot_flow_id").references(() => botFlowsTable.id, { onDelete: "set null" }),

  // Coverage context
  coverageReason: text("coverage_reason").notNull(),
  // reasons: agent_busy|agent_absent|agent_offline|after_hours|
  //          unassigned|sla_breach|overloaded|manual_activation
  originalAgentId: uuid("original_agent_id").references(() => usersTable.id, { onDelete: "set null" }),

  // Session lifecycle
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  endReason: text("end_reason"),
  // reasons: agent_returned|customer_opted_out|handoff_triggered|
  //          max_messages|max_duration|escalated|stop_condition_met|
  //          conversation_closed|error

  // Stats
  botMessagesSent: integer("bot_messages_sent").notNull().default(0),
  customerMessagesReceived: integer("customer_messages_received").notNull().default(0),
  dataCollected: jsonb("data_collected"),
  tasksCreated: integer("tasks_created").notNull().default(0),

  // Handoff
  handoffTo: uuid("handoff_to").references(() => usersTable.id, { onDelete: "set null" }),
  handoffSummary: text("handoff_summary"),
  handoffCustomerIntent: text("handoff_customer_intent"),
  handoffObjections: text("handoff_objections").array().notNull().default([]),
  handoffPendingQuestions: text("handoff_pending_questions").array().notNull().default([]),
  handoffPromisedFollowup: text("handoff_promised_followup"),
  handoffRecommendedAction: text("handoff_recommended_action"),
  handoffUrgency: text("handoff_urgency"),

  // Quality
  agentSatisfactionRating: integer("agent_satisfaction_rating"),
  agentFeedback: text("agent_feedback"),
  customerSatisfactionRating: integer("customer_satisfaction_rating"),

  // AB Testing
  abTestVariant: text("ab_test_variant"),
  conversionOutcome: text("conversion_outcome"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAiConversationSessionSchema = createInsertSchema(aiConversationSessionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAiConversationSession = z.infer<typeof insertAiConversationSessionSchema>;
export type AiConversationSession = typeof aiConversationSessionsTable.$inferSelect;
