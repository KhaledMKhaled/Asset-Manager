import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { campaignsTable } from "./campaigns";

export const adSetsTable = pgTable("ad_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").references(() => campaignsTable.id, { onDelete: "cascade" }),
  externalAdSetId: text("external_ad_set_id"),
  adSetName: text("ad_set_name"),
  audienceType: text("audience_type"),
  geography: text("geography"),
  placement: text("placement"),
  optimizationGoal: text("optimization_goal"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adsTable = pgTable("ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  adSetId: uuid("ad_set_id").references(() => adSetsTable.id, { onDelete: "cascade" }),
  externalAdId: text("external_ad_id"),
  adName: text("ad_name"),
  creativeType: text("creative_type"),
  creativeAngle: text("creative_angle"),
  offerType: text("offer_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdSetSchema = createInsertSchema(adSetsTable).omit({
  id: true,
  createdAt: true,
});

export const insertAdSchema = createInsertSchema(adsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAdSet = z.infer<typeof insertAdSetSchema>;
export type AdSet = typeof adSetsTable.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof adsTable.$inferSelect;
