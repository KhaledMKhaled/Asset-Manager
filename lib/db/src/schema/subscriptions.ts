import { pgTable, text, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { opportunitiesTable } from "./opportunities";
import { companiesTable } from "./companies";

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").references(() => opportunitiesTable.id, { onDelete: "set null" }),
  companyId: uuid("company_id").references(() => companiesTable.id, { onDelete: "set null" }),
  planName: text("plan_name"),
  billingCycle: text("billing_cycle"), // monthly|yearly
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  grossRevenue: numeric("gross_revenue", { precision: 12, scale: 2 }),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }),
  netRevenue: numeric("net_revenue", { precision: 12, scale: 2 }),
  currency: text("currency").notNull().default("EGP"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  status: text("status").notNull().default("trial"), // trial|active|cancelled|expired
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;
