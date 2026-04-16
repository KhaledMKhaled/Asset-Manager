import { pgTable, text, boolean, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const integrationsTable = pgTable("integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: text("provider").notNull(),
  providerLabel: text("provider_label"),
  authType: text("auth_type").notNull().default("api_key"),
  credentials: jsonb("credentials"),
  config: jsonb("config"),
  status: text("status").notNull().default("disconnected"),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  lastError: text("last_error"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertIntegrationSchema = createInsertSchema(integrationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrationsTable.$inferSelect;
