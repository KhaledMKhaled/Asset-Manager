import { pgTable, text, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { leadsTable } from "./leads";
import { companiesTable } from "./companies";
import { pipelinesTable, pipelineStagesTable } from "./pipelines";
import { usersTable } from "./users";

export const opportunitiesTable = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leadsTable.id, { onDelete: "set null" }),
  companyId: uuid("company_id").references(() => companiesTable.id, { onDelete: "set null" }),
  pipelineId: uuid("pipeline_id").references(() => pipelinesTable.id, { onDelete: "set null" }),
  currentStageId: uuid("current_stage_id").references(() => pipelineStagesTable.id, { onDelete: "set null" }),
  assignedTo: uuid("assigned_to").references(() => usersTable.id, { onDelete: "set null" }),
  opportunityName: text("opportunity_name"),
  amountExpected: numeric("amount_expected", { precision: 12, scale: 2 }),
  planInterest: text("plan_interest"),
  closeProbability: numeric("close_probability", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("open"),
  wonLostReason: text("won_lost_reason"),
  expectedCloseDate: timestamp("expected_close_date", { withTimezone: true }),
  signupStatus: text("signup_status").notNull().default("pending"),
  signupDate: timestamp("signup_date", { withTimezone: true }),
  activationStatus: text("activation_status").notNull().default("pending"),
  activationDate: timestamp("activation_date", { withTimezone: true }),
  paidStatus: text("paid_status").notNull().default("pending"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  planName: text("plan_name"),
  contractValue: numeric("contract_value", { precision: 12, scale: 2 }),
  billingCycle: text("billing_cycle"),
  discountApplied: numeric("discount_applied", { precision: 5, scale: 2 }),
  finalRevenue: numeric("final_revenue", { precision: 12, scale: 2 }),
  currency: text("currency").notNull().default("SAR"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOpportunitySchema = createInsertSchema(opportunitiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunitiesTable.$inferSelect;
