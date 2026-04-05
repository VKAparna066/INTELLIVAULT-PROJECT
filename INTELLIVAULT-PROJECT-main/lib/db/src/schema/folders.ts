import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const foldersTable = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pinHash: text("pin_hash"),
  decoyPinHash: text("decoy_pin_hash"),
  isPinEnabled: boolean("is_pin_enabled").notNull().default(false),
  isHidden: boolean("is_hidden").notNull().default(false),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFolderSchema = createInsertSchema(foldersTable).omit({ id: true, createdAt: true, failedAttempts: true });
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof foldersTable.$inferSelect;
