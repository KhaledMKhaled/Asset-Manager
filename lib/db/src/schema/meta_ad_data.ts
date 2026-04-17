import { pgTable, text, integer, numeric, date, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { campaignsTable } from "./campaigns";
import { adSetsTable, adsTable } from "./ad_sets";

export const metaAdDataTable = pgTable("meta_ad_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").references(() => campaignsTable.id, { onDelete: "set null" }),
  adSetId: uuid("ad_set_id").references(() => adSetsTable.id, { onDelete: "set null" }),
  adId: uuid("ad_id").references(() => adsTable.id, { onDelete: "set null" }),
  campaignKey: text("campaign_key"),
  date: date("date").notNull(),
  spend: numeric("spend", { precision: 12, scale: 2 }).notNull().default("0"),
  impressions: integer("impressions").notNull().default(0),
  reach: integer("reach").notNull().default(0),
  frequency: numeric("frequency", { precision: 5, scale: 2 }),
  clicksAll: integer("clicks_all").notNull().default(0),
  linkClicks: integer("link_clicks").notNull().default(0),
  landingPageViews: integer("landing_page_views").notNull().default(0),
  ctrAll: numeric("ctr_all", { precision: 8, scale: 4 }),
  linkCtr: numeric("link_ctr", { precision: 8, scale: 4 }),
  cpcAll: numeric("cpc_all", { precision: 8, scale: 2 }),
  cpcLink: numeric("cpc_link", { precision: 8, scale: 2 }),
  cpm: numeric("cpm", { precision: 8, scale: 2 }),
  metaFormLeads: integer("meta_form_leads").notNull().default(0),
  websiteLeads: integer("website_leads").notNull().default(0),
  leadsTotal: integer("leads_total").notNull().default(0),
  signups: integer("signups").notNull().default(0),
  cpl: numeric("cpl", { precision: 8, scale: 2 }),
  costPerSignup: numeric("cost_per_signup", { precision: 8, scale: 2 }),
  budgetType: text("budget_type"),
  syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMetaAdDataSchema = createInsertSchema(metaAdDataTable).omit({
  id: true,
  syncedAt: true,
});

export type InsertMetaAdData = z.infer<typeof insertMetaAdDataSchema>;
export type MetaAdData = typeof metaAdDataTable.$inferSelect;
