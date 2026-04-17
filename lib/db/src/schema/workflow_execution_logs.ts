import { pgTable, text, boolean, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { automationRulesTable, workflowsTable } from "./workflows";

export const workflowExecutionLogsTable = pgTable("workflow_execution_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  automationRuleId: uuid("automation_rule_id").references(() => automationRulesTable.id, { onDelete: "set null" }),
  workflowId: uuid("workflow_id").references(() => workflowsTable.id, { onDelete: "set null" }),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  triggerEvent: text("trigger_event"),
  conditionsMet: boolean("conditions_met"),
  actionExecuted: text("action_executed"),
  actionResult: jsonb("action_result"),
  status: text("status"), // success|failed|skipped|delayed
  errorMessage: text("error_message"),
  executedAt: timestamp("executed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkflowExecutionLogSchema = createInsertSchema(workflowExecutionLogsTable).omit({
  id: true,
  executedAt: true,
});

export type InsertWorkflowExecutionLog = z.infer<typeof insertWorkflowExecutionLogSchema>;
export type WorkflowExecutionLog = typeof workflowExecutionLogsTable.$inferSelect;
