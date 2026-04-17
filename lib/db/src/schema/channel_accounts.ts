import { pgTable, text, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { integrationsTable } from "./integrations";

export const channelAccountsTable = pgTable("channel_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelType: text("channel_type").notNull(), // whatsapp|messenger|instagram
  externalAccountId: text("external_account_id"),
  displayName: text("display_name"),
  status: text("status").notNull().default("active"), // active|inactive|error
  integrationId: uuid("integration_id").references(() => integrationsTable.id, { onDelete: "set null" }),
  defaultTeamId: text("default_team_id"),
  defaultOwnerRule: jsonb("default_owner_rule"),
  businessHoursProfile: jsonb("business_hours_profile"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertChannelAccountSchema = createInsertSchema(channelAccountsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChannelAccount = z.infer<typeof insertChannelAccountSchema>;
export type ChannelAccount = typeof channelAccountsTable.$inferSelect;
