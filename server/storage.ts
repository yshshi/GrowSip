// src/storage.ts
import { db } from "./db";
import {
  users,
  plans,
  subscriptions,
  transactions,
  rateAdjustments,
  auditLogs,
  marketSeries,
} from "@shared/schema";
import { and, eq } from "drizzle-orm";

export const storage = {
  // ----- USERS -----
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  },
  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  },

  async createUser(data: typeof users.$inferInsert) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async getAllUsers() {
    return db.select().from(users);
  },

  async updateUserStatus(id: string, status: "active" | "frozen") {
    const [user] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    return user ?? null;
  },

  async updateUserKyc(
    id: string,
    kycStatus: "pending" | "approved" | "rejected",
    verifiedAt?: Date,
  ) {
    const [user] = await db
      .update(users)
      .set({ kycStatus, kycVerifiedAt: verifiedAt })
      .where(eq(users.id, id))
      .returning();
    return user ?? null;
  },

  // ----- PLANS -----
  async getPlans() {
    return db.select().from(plans);
  },

  async getPlan(id: string) {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan ?? null;
  },

  async createPlan(data: typeof plans.$inferInsert) {
    const [plan] = await db.insert(plans).values(data).returning();
    return plan;
  },

  async updatePlan(id: string, updates: Partial<typeof plans.$inferInsert>) {
    const [plan] = await db.update(plans).set(updates).where(eq(plans.id, id)).returning();
    return plan ?? null;
  },

  async deletePlan(id: string) {
    await db.delete(plans).where(eq(plans.id, id));
  },

  // ----- MARKET SERIES -----
  async getMarketSeries(planId: string) {
    return db.select().from(marketSeries).where(eq(marketSeries.planId, planId));
  },

  async createMarketSeries(data: typeof marketSeries.$inferInsert) {
    const [ms] = await db.insert(marketSeries).values(data).returning();
    return ms;
  },

  // ----- SUBSCRIPTIONS -----
  async getUserSubscriptions(userId: string) {
    return db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  },

  async createSubscription(data: typeof subscriptions.$inferInsert) {
    const [sub] = await db.insert(subscriptions).values(data).returning();
    return sub;
  },

  async getSubscription(id: string) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return sub ?? null;
  },

  async updateSubscription(id: string, updates: Partial<typeof subscriptions.$inferInsert>) {
    const [sub] = await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id)).returning();
    return sub ?? null;
  },

  // ----- TRANSACTIONS -----
  async getUserTransactions(userId: string) {
    return db.select().from(transactions).where(eq(transactions.userId, userId));
  },

  async getAllTransactions() {
    return db.select().from(transactions);
  },

  async createTransaction(data: typeof transactions.$inferInsert) {
    const [tx] = await db.insert(transactions).values(data).returning();
    return tx;
  },

  // ----- RATE ADJUSTMENTS -----
  async getRateAdjustments(userId: string, planId: string) {
  return db.select()
    .from(rateAdjustments)
    .where(and(
      eq(rateAdjustments.userId, userId),
      eq(rateAdjustments.planId, planId)
    ));
},

  async createRateAdjustment(data: typeof rateAdjustments.$inferInsert) {
    const [adj] = await db.insert(rateAdjustments).values(data).returning();
    return adj;
  },

  // ----- AUDIT LOGS -----
  async createAuditLog(data: typeof auditLogs.$inferInsert) {
    await db.insert(auditLogs).values(data);
  },

  async getAuditLogs() {
    return db.select().from(auditLogs);
  },
};
