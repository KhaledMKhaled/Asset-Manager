import { pgTable, text, boolean, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiAnalysisLogsTable = pgTable("ai_analysis_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityId: uuid("entity_id"),
  entityType: text("entity_type"),
  activityId: uuid("activity_id"),
  provider: text("provider"), // openai|gemini
  model: text("model"),
  analysisType: text("analysis_type"),
  prompt: text("prompt"),
  result: text("result"),
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  cost: numeric("cost", { precision: 8, scale: 4 }),
  acceptedByUser: boolean("accepted_by_user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAiAnalysisLogSchema = createInsertSchema(aiAnalysisLogsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAiAnalysisLog = z.infer<typeof insertAiAnalysisLogSchema>;
export type AiAnalysisLog = typeof aiAnalysisLogsTable.$inferSelect;
