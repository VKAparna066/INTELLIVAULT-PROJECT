import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("other"),
  fileType: text("file_type").notNull().default("pdf"),
  fileSize: integer("file_size").notNull().default(0),
  expiryDate: text("expiry_date"),
  tags: text("tags").array().default([]),
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  isSelfDestruct: boolean("is_self_destruct").notNull().default(false),
  selfDestructAt: text("self_destruct_at"),
  isOneTimeView: boolean("is_one_time_view").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  maxViews: integer("max_views"),
  fraudRisk: text("fraud_risk").notNull().default("low"),
  riskScore: integer("risk_score").notNull().default(0),
  aiSummary: text("ai_summary"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  folderId: integer("folder_id"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, uploadedAt: true, updatedAt: true, viewCount: true, isDeleted: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
