import { pgTable, text, boolean, integer, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workflowsTable = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  type: text("type").notNull().default("automation"),
  appliesTo: text("applies_to").notNull().default("lead"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const automationRulesTable = pgTable("automation_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").notNull().references(() => workflowsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  triggerEvent: text("trigger_event").notNull(),
  triggerConditions: jsonb("trigger_conditions"),
  actionType: text("action_type").notNull(),
  actionParams: jsonb("action_params"),
  delayMinutes: integer("delay_minutes").notNull().default(0),
  executionOrder: integer("execution_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkflowSchema = createInsertSchema(workflowsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAutomationRuleSchema = createInsertSchema(automationRulesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflowsTable.$inferSelect;
export type InsertAutomationRule = z.infer<typeof insertAutomationRuleSchema>;
export type AutomationRule = typeof automationRulesTable.$inferSelect;
