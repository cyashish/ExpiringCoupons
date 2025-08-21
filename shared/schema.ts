import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  merchant: text("merchant").notNull(),
  category: text("category").notNull(), // food, ecommerce, travel, banking
  value: text("value").notNull(), // e.g., "₹200 off", "10% cashback"
  description: text("description"),
  minimumAmount: text("minimum_amount"), // e.g., "₹500"
  expiryDate: timestamp("expiry_date").notNull(),
  isActive: boolean("is_active").default(true),
  source: text("source").default("email"), // email, sms, manual
  createdAt: timestamp("created_at").default(sql`now()`),
  usageInstructions: text("usage_instructions"),
});

export const emailAccounts = pgTable("email_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  provider: text("provider").notNull().default("gmail"), // gmail only for now
  googleId: text("google_id"), // Google user ID for OAuth
  isConnected: boolean("is_connected").default(false),
  lastScanAt: timestamp("last_scan_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
  // No sensitive data stored - OAuth tokens handled securely in session
});

export const scanSettings = pgTable("scan_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  autoScan: boolean("auto_scan").default(true),
  scanFrequency: integer("scan_frequency").default(6), // hours
  expiryAlerts: boolean("expiry_alerts").default(true),
  alertDays: text("alert_days").default("1,3"), // comma-separated days
  exportFormat: text("export_format").default("xlsx"),
  includeCategories: boolean("include_categories").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
});

export const insertEmailAccountSchema = createInsertSchema(emailAccounts).omit({
  id: true,
  createdAt: true,
  lastScanAt: true,
});

export const insertScanSettingsSchema = createInsertSchema(scanSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertScanSettings = z.infer<typeof insertScanSettingsSchema>;
export type ScanSettings = typeof scanSettings.$inferSelect;
