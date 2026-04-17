import { pgTable, text, numeric, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { leadsTable } from "./leads";
import { scoringModelsTable } from "./scoring";

export const leadScoreHistoryTable = pgTable("lead_score_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leadsTable.id, { onDelete: "cascade" }),
  scoringModelId: uuid("scoring_model_id").references(() => scoringModelsTable.id, { onDelete: "set null" }),
  oldScore: numeric("old_score", { precision: 5, scale: 2 }),
  newScore: numeric("new_score", { precision: 5, scale: 2 }),
  oldGrade: text("old_grade"),
  newGrade: text("new_grade"),
  scoreType: text("score_type"), // manual|ai|rule_based|recalculation
  scoringBreakdown: jsonb("scoring_breakdown"),
  changedBy: text("changed_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeadScoreHistorySchema = createInsertSchema(leadScoreHistoryTable).omit({
  id: true,
  createdAt: true,
});

export type InsertLeadScoreHistory = z.infer<typeof insertLeadScoreHistorySchema>;
export type LeadScoreHistory = typeof leadScoreHistoryTable.$inferSelect;
