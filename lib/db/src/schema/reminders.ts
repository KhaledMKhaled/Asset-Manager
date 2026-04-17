import { pgTable, text, boolean, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tasksTable } from "./tasks";
import { usersTable } from "./users";

export const remindersTable = pgTable("reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasksTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  reminderType: text("reminder_type").notNull(), // immediate|scheduled|repeated|escalation
  triggerAt: timestamp("trigger_at", { withTimezone: true }).notNull(),
  repeatIntervalMinutes: integer("repeat_interval_minutes"),
  escalationLevel: integer("escalation_level").notNull().default(0),
  priority: text("priority"),
  stageFilter: text("stage_filter"),
  taskTypeFilter: text("task_type_filter"),
  isSent: boolean("is_sent").notNull().default(false),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReminderSchema = createInsertSchema(remindersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof remindersTable.$inferSelect;
