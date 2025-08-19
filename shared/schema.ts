import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"), // 'user' or 'admin'
  status: varchar("status").notNull().default("active"), // 'active', 'frozen'
  kycStatus: varchar("kyc_status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  pan: varchar("pan"),
  aadhaarLast4: varchar("aadhaar_last4"),
  bankMasked: varchar("bank_masked"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SIP Plans
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // 'Large Cap', 'Mid Cap', 'Small Cap', etc.
  riskLevel: varchar("risk_level").notNull(), // 'Low', 'Medium', 'High', 'Very High'
  minSipAmount: decimal("min_sip_amount", { precision: 10, scale: 2 }).notNull(),
  lockInMonths: integer("lock_in_months").notNull(),
  expectedReturnDefault: decimal("expected_return_default", { precision: 5, scale: 2 }).notNull(),
  expectedReturnMin: decimal("expected_return_min", { precision: 5, scale: 2 }).notNull(),
  expectedReturnMax: decimal("expected_return_max", { precision: 5, scale: 2 }).notNull(),
  description: text("description"),
  tags: text("tags").array(),
  cagr3y: decimal("cagr_3y", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market Series for charts
export const marketSeries = pgTable("market_series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  points: jsonb("points").notNull(), // Array of {date, open, high, low, close}
  monthlyReturns: jsonb("monthly_returns").notNull(), // Array of {month: YYYY-MM, pct}
  createdAt: timestamp("created_at").defaultNow(),
});

// User Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dayOfMonth: integer("day_of_month").notNull(),
  status: varchar("status").notNull().default("active"), // 'active', 'paused', 'cancelled'
  startDate: timestamp("start_date").notNull(),
  pauseDates: jsonb("pause_dates"), // Array of {from, to}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").references(() => plans.id),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  type: varchar("type").notNull(), // 'SIP', 'REFUND', 'ADJUSTMENT'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("SUCCESS"), // 'SUCCESS', 'FAILED', 'PENDING'
  gatewayRef: varchar("gateway_ref"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rate Adjustments
export const rateAdjustments = pgTable("rate_adjustments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  deltaBps: integer("delta_bps").notNull(), // basis points adjustment
  reason: text("reason"),
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").notNull().references(() => users.id),
  action: varchar("action").notNull(),
  targetType: varchar("target_type").notNull(),
  targetId: varchar("target_id").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertRateAdjustmentSchema = createInsertSchema(rateAdjustments).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type MarketSeries = typeof marketSeries.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type RateAdjustment = typeof rateAdjustments.$inferSelect;
export type InsertRateAdjustment = z.infer<typeof insertRateAdjustmentSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
