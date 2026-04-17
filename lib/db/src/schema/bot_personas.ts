import { pgTable, text, boolean, integer, numeric, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botPersonasTable = pgTable("bot_personas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),

  // Identity
  botDisplayName: text("bot_display_name"),
  botDisplayNameAr: text("bot_display_name_ar"),
  botRole: text("bot_role"), // sales_assistant|qualifier|onboarding_helper|support|follow_up

  // Tone Configuration
  tone: text("tone").notNull().default("professional"),
  formalityLevel: integer("formality_level").notNull().default(3),
  friendlinessLevel: integer("friendliness_level").notNull().default(3),
  brevityLevel: integer("brevity_level").notNull().default(3),

  // Language Configuration
  primaryLanguage: text("primary_language").notNull().default("ar"),
  fallbackLanguage: text("fallback_language").notNull().default("en"),
  dialectStyle: text("dialect_style").notNull().default("egyptian_business"),
  allowCodeSwitching: boolean("allow_code_switching").notNull().default(false),
  emojiUsage: text("emoji_usage").notNull().default("minimal"),
  messageLengthPreference: text("message_length_preference").notNull().default("moderate"),

  // Experience Level
  experienceMode: text("experience_mode").notNull().default("trained_coordinator"),

  // Sales Behavior
  salesStyle: text("sales_style").notNull().default("consultative"),
  objectionHandling: text("objection_handling").notNull().default("escalate"),
  canDiscussPricing: boolean("can_discuss_pricing").notNull().default(false),
  canOfferDiscounts: boolean("can_offer_discounts").notNull().default(false),
  canBookDemos: boolean("can_book_demos").notNull().default(true),
  canGuideOnboarding: boolean("can_guide_onboarding").notNull().default(true),

  // Knowledge Boundaries
  knowledgeSources: text("knowledge_sources").array().notNull().default([]),
  restrictedTopics: text("restricted_topics").array().notNull().default([]),

  // Communication Guardrails
  prohibitedBehaviors: text("prohibited_behaviors").array().notNull().default([]),
  maxMessagesBeforeHandoff: integer("max_messages_before_handoff").notNull().default(10),
  maxConversationDurationMinutes: integer("max_conversation_duration_minutes").notNull().default(60),
  confidenceThreshold: numeric("confidence_threshold", { precision: 5, scale: 2 }).notNull().default("0.70"),

  // Brand Rules
  brandGuidelines: text("brand_guidelines"),
  approvedPromises: text("approved_promises").array().notNull().default([]),
  customInstructions: text("custom_instructions"),

  isActive: boolean("is_active").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBotPersonaSchema = createInsertSchema(botPersonasTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBotPersona = z.infer<typeof insertBotPersonaSchema>;
export type BotPersona = typeof botPersonasTable.$inferSelect;
