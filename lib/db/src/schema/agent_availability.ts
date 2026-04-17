import { pgTable, text, integer, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const agentAvailabilityTable = pgTable("agent_availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("online"),
  // status: online|busy|away|offline|on_leave|overloaded
  activeConversationCount: integer("active_conversation_count").notNull().default(0),
  maxConcurrentConversations: integer("max_concurrent_conversations").notNull().default(10),
  businessHoursProfile: jsonb("business_hours_profile"),
  autoAwayAfterMinutes: integer("auto_away_after_minutes").notNull().default(30),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
  statusChangedAt: timestamp("status_changed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAgentAvailabilitySchema = createInsertSchema(agentAvailabilityTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentAvailability = z.infer<typeof insertAgentAvailabilitySchema>;
export type AgentAvailability = typeof agentAvailabilityTable.$inferSelect;
