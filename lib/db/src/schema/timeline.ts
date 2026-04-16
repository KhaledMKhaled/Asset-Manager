import { pgTable, text, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const timelineEventsTable = pgTable("timeline_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  eventType: text("event_type").notNull(),
  eventTimestamp: timestamp("event_timestamp", { withTimezone: true }).notNull().defaultNow(),
  renderedTitle: text("rendered_title"),
  renderedDescription: text("rendered_description"),
  eventData: jsonb("event_data"),
  sourceSystem: text("source_system"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTimelineEventSchema = createInsertSchema(timelineEventsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEventsTable.$inferSelect;
