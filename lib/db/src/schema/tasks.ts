import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const tasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  assignedTo: uuid("assigned_to").references(() => usersTable.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  taskType: text("task_type").notNull().default("follow_up"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  source: text("source").notNull().default("manual"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  result: text("result"),
  completionNotes: text("completion_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
