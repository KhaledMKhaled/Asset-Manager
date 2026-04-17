import { pgTable, text, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { leadsTable } from "./leads";
import { usersTable } from "./users";

export const leadStageHistoryTable = pgTable("lead_stage_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leadsTable.id, { onDelete: "cascade" }),
  fromStageId: uuid("from_stage_id"),
  toStageId: uuid("to_stage_id"),
  stageContext: text("stage_context"), // funnel|pipeline
  changedBy: uuid("changed_by").references(() => usersTable.id, { onDelete: "set null" }),
  approvedBy: uuid("approved_by").references(() => usersTable.id, { onDelete: "set null" }),
  notes: text("notes"),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeadStageHistorySchema = createInsertSchema(leadStageHistoryTable).omit({
  id: true,
  changedAt: true,
});

export type InsertLeadStageHistory = z.infer<typeof insertLeadStageHistorySchema>;
export type LeadStageHistory = typeof leadStageHistoryTable.$inferSelect;
