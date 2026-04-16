import { pgTable, text, boolean, integer, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pipelinesTable = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  pipelineType: text("pipeline_type").notNull().default("sales"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pipelineStagesTable = pgTable("pipeline_stages", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id").notNull().references(() => pipelinesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  color: text("color"),
  position: integer("position").notNull().default(0),
  stageType: text("stage_type").notNull().default("active"),
  isEntry: boolean("is_entry").notNull().default(false),
  isExit: boolean("is_exit").notNull().default(false),
  probability: numeric("probability", { precision: 5, scale: 2 }),
  slaHours: integer("sla_hours"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPipelineSchema = createInsertSchema(pipelinesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertPipelineStageSchema = createInsertSchema(pipelineStagesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type Pipeline = typeof pipelinesTable.$inferSelect;
export type InsertPipelineStage = z.infer<typeof insertPipelineStageSchema>;
export type PipelineStage = typeof pipelineStagesTable.$inferSelect;
