import { pgTable, text, boolean, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";
import { contactsTable } from "./contacts";
import { campaignsTable } from "./campaigns";
import { usersTable } from "./users";
import { funnelStagesTable } from "./funnel_stages";
import { pipelinesTable, pipelineStagesTable } from "./pipelines";

export const leadsTable = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadCode: text("lead_code").notNull().unique(),
  companyId: uuid("company_id").references(() => companiesTable.id, { onDelete: "set null" }),
  primaryContactId: uuid("primary_contact_id").references(() => contactsTable.id, { onDelete: "set null" }),
  campaignId: uuid("campaign_id").references(() => campaignsTable.id, { onDelete: "set null" }),
  assignedTo: uuid("assigned_to").references(() => usersTable.id, { onDelete: "set null" }),
  leadSource: text("lead_source"),
  leadStatus: text("lead_status").notNull().default("new"),
  contactStatus: text("contact_status").notNull().default("not_contacted"),
  qualificationStatus: text("qualification_status").notNull().default("unqualified"),
  qualificationReason: text("qualification_reason"),
  isMql: boolean("is_mql").notNull().default(false),
  isSql: boolean("is_sql").notNull().default(false),
  leadScore: numeric("lead_score", { precision: 5, scale: 2 }),
  aiLeadScore: numeric("ai_lead_score", { precision: 5, scale: 2 }),
  scoreGrade: text("score_grade"),
  aiSummary: text("ai_summary"),
  currentFunnelStageId: uuid("current_funnel_stage_id").references(() => funnelStagesTable.id, { onDelete: "set null" }),
  pipelineId: uuid("pipeline_id").references(() => pipelinesTable.id, { onDelete: "set null" }),
  currentStageId: uuid("current_stage_id").references(() => pipelineStagesTable.id, { onDelete: "set null" }),
  tags: text("tags").array().notNull().default([]),
  duplicateFlag: boolean("duplicate_flag").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
