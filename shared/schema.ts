import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  smsNumber: varchar("sms_number", { length: 20 }),
});

export const envelopes = pgTable("envelopes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'expense' or 'savings'
  budgetAmount: decimal("budget_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  period: varchar("period", { length: 20 }).notNull().default("monthly"), // 'weekly', 'monthly', 'yearly'
  icon: varchar("icon", { length: 50 }).notNull().default("wallet"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  envelopeId: integer("envelope_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  source: varchar("source", { length: 20 }).notNull().default("sms"), // 'sms', 'web'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  phoneNumber: true,
  smsNumber: true,
});

export const insertEnvelopeSchema = createInsertSchema(envelopes).pick({
  name: true,
  type: true,
  budgetAmount: true,
  period: true,
  icon: true,
}).extend({
  budgetAmount: z.number().positive(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  envelopeId: true,
  amount: true,
  description: true,
  source: true,
}).extend({
  amount: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEnvelope = z.infer<typeof insertEnvelopeSchema>;
export type Envelope = typeof envelopes.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
