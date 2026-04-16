import { pgTable, text, boolean, integer, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const kpiDefinitionsTable = pgTable("kpi_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  kpiType: text("kpi_type").notNull(),
  displayType: text("display_type").notNull().default("number"),
  timeAggregation: text("time_aggregation").notNull().default("all_time"),
  targetValue: numeric("target_value", { precision: 12, scale: 2 }),
  warningThreshold: numeric("warning_threshold", { precision: 12, scale: 2 }),
  dangerThreshold: numeric("danger_threshold", { precision: 12, scale: 2 }),
  thresholdDirection: text("threshold_direction").notNull().default("higher_is_better"),
  isPinned: boolean("is_pinned").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertKpiDefinitionSchema = createInsertSchema(kpiDefinitionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertKpiDefinition = z.infer<typeof insertKpiDefinitionSchema>;
export type KpiDefinition = typeof kpiDefinitionsTable.$inferSelect;
