import { pgTable, text, boolean, integer, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { botPersonasTable } from "./bot_personas";

export const botFlowsTable = pgTable("bot_flows", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  flowType: text("flow_type").notNull(),
  // types: welcome|qualification|after_hours|busy_agent|no_response_followup|
  //        demo_reminder|signup_completion|activation_assistant|payment_reminder|reactivation
  personaId: uuid("persona_id").references(() => botPersonasTable.id, { onDelete: "set null" }),

  // Scope
  appliesToChannels: text("applies_to_channels").array().notNull().default(["all"]),
  appliesToPipelines: text("applies_to_pipelines").array().notNull().default([]),
  appliesToStages: text("applies_to_stages").array().notNull().default([]),

  // Trigger Configuration
  triggerType: text("trigger_type").notNull(),
  // triggers: new_conversation|agent_unavailable|sla_breach|no_response|
  //           stage_entered|event_occurred|scheduled|manual
  triggerConditions: jsonb("trigger_conditions"),
  triggerDelayMinutes: integer("trigger_delay_minutes").notNull().default(0),

  // Stop Conditions
  stopConditions: jsonb("stop_conditions"),
  maxMessages: integer("max_messages").notNull().default(5),
  maxDurationHours: integer("max_duration_hours").notNull().default(72),

  // Escalation
  escalationRules: jsonb("escalation_rules"),
  fallbackAction: text("fallback_action").notNull().default("escalate_to_manager"),

  // Human approval
  requiresApproval: boolean("requires_approval").notNull().default(false),
  approvalTimeoutMinutes: integer("approval_timeout_minutes").notNull().default(5),

  // A/B Testing
  abTestEnabled: boolean("ab_test_enabled").notNull().default(false),
  abTestVariants: jsonb("ab_test_variants"),

  // Rate Limiting
  rateLimitPerConversation: integer("rate_limit_per_conversation").notNull().default(5),
  rateLimitPerChannel: integer("rate_limit_per_channel").notNull().default(100),

  isActive: boolean("is_active").notNull().default(true),
  isTestable: boolean("is_testable").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const botFlowStepsTable = pgTable("bot_flow_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  flowId: uuid("flow_id").notNull().references(() => botFlowsTable.id, { onDelete: "cascade" }),
  stepType: text("step_type").notNull(),
  // types: send_template|ai_generate|wait|decision_branch|collect_input|
  //        create_task|update_field|move_stage|escalate|notify|
  //        create_timeline_event|check_condition|end
  position: integer("position").notNull(),

  // Content
  templateId: uuid("template_id"),
  aiPromptTemplate: text("ai_prompt_template"),
  aiProvider: text("ai_provider"), // openai|gemini

  // Wait / Delay
  waitMinutes: integer("wait_minutes"),
  waitUntilCondition: jsonb("wait_until_condition"),

  // Branch
  branchConditions: jsonb("branch_conditions"),
  branchTrueStepId: uuid("branch_true_step_id"),
  branchFalseStepId: uuid("branch_false_step_id"),

  // Action params
  actionParams: jsonb("action_params"),

  // AB Testing variant
  abVariant: text("ab_variant"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBotFlowSchema = createInsertSchema(botFlowsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBotFlowStepSchema = createInsertSchema(botFlowStepsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBotFlow = z.infer<typeof insertBotFlowSchema>;
export type BotFlow = typeof botFlowsTable.$inferSelect;
export type InsertBotFlowStep = z.infer<typeof insertBotFlowStepSchema>;
export type BotFlowStep = typeof botFlowStepsTable.$inferSelect;
