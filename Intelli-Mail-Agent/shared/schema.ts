import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { sql } from "drizzle-orm";

export * from "./models/auth";
export * from "./models/chat";

export const templates = sqliteTable("templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const campaigns = sqliteTable("campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetCompany: text("target_company").notNull(),
  companyDescription: text("company_description").notNull(),
  status: text("status").notNull().default("draft"), // draft, generated, sent
  templateId: integer("template_id").references(() => templates.id),
  generatedEmail: text("generated_email"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true, status: true, generatedEmail: true });

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type UpdateCampaignRequest = Partial<InsertCampaign> & { status?: string, generatedEmail?: string };
