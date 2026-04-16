import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const activitiesTable = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  activityType: text("activity_type").notNull(),
  direction: text("direction"),
  activityDatetime: timestamp("activity_datetime", { withTimezone: true }).notNull().defaultNow(),
  subject: text("subject"),
  content: text("content"),
  outcome: text("outcome"),
  nextStep: text("next_step"),
  interestLevel: text("interest_level"),
  aiSummary: text("ai_summary"),
  aiSentiment: text("ai_sentiment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activitiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activitiesTable.$inferSelect;
