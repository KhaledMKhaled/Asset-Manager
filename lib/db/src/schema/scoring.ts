import { pgTable, text, boolean, integer, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scoringModelsTable = pgTable("scoring_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  entityType: text("entity_type").notNull().default("lead"),
  isActive: boolean("is_active").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  totalWeight: numeric("total_weight", { precision: 5, scale: 2 }).notNull().default("100"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scoringRulesTable = pgTable("scoring_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  modelId: uuid("model_id").notNull().references(() => scoringModelsTable.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  ruleName: text("rule_name").notNull(),
  ruleNameAr: text("rule_name_ar"),
  description: text("description"),
  scoreValue: numeric("score_value", { precision: 6, scale: 2 }).notNull().default("0"),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull().default("1"),
  isNegative: boolean("is_negative").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertScoringModelSchema = createInsertSchema(scoringModelsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScoringRuleSchema = createInsertSchema(scoringRulesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScoringModel = z.infer<typeof insertScoringModelSchema>;
export type ScoringModel = typeof scoringModelsTable.$inferSelect;
export type InsertScoringRule = z.infer<typeof insertScoringRuleSchema>;
export type ScoringRule = typeof scoringRulesTable.$inferSelect;
