import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const funnelStagesTable = pgTable("funnel_stages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  stageType: text("stage_type").notNull().default("marketing"),
  color: text("color"),
  icon: text("icon"),
  position: integer("position").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  slaHours: integer("sla_hours"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFunnelStageSchema = createInsertSchema(funnelStagesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFunnelStage = z.infer<typeof insertFunnelStageSchema>;
export type FunnelStage = typeof funnelStagesTable.$inferSelect;
