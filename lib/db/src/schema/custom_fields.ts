import { pgTable, text, boolean, integer, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customFieldDefinitionsTable = pgTable("custom_field_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(), // lead|contact|company|opportunity
  fieldName: text("field_name").notNull(),
  fieldLabelEn: text("field_label_en"),
  fieldLabelAr: text("field_label_ar"),
  fieldType: text("field_type").notNull(),
  // types: text|long_text|number|currency|percentage|date|datetime|phone|
  //        email|select|multi_select|checkbox|boolean|relation|formula|ai_generated
  options: jsonb("options"), // for select/multi-select
  isRequired: boolean("is_required").notNull().default(false),
  requiredInStages: text("required_in_stages").array().notNull().default([]),
  defaultValue: text("default_value"),
  conditionalVisibility: jsonb("conditional_visibility"),
  conditionalValidation: jsonb("conditional_validation"),
  visibleToRoles: text("visible_to_roles").array().notNull().default([]),
  visibleToTeams: text("visible_to_teams").array().notNull().default([]),
  fieldGroup: text("field_group"),
  fieldSection: text("field_section"),
  position: integer("position").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCustomFieldDefinitionSchema = createInsertSchema(customFieldDefinitionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomFieldDefinition = z.infer<typeof insertCustomFieldDefinitionSchema>;
export type CustomFieldDefinition = typeof customFieldDefinitionsTable.$inferSelect;
