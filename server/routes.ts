import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, optionalAuth, hashPassword, verifyPassword, generateToken } from "./auth";
import { 
  insertPlanSchema,
  insertSubscriptionSchema,
  insertTransactionSchema,
  insertRateAdjustmentSchema 
} from "@shared/schema";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        role: "user",
        status: "active",
        kycStatus: "pending",
        emailVerified: false,
      });

      // Generate token and set session
      const token = generateToken({ userId: user.id, email: user.email });
      (req.session as any).userId = user.id;

      // Return user without password hash
      const { passwordHash: _, ...userResponse } = user;
      res.json({ user: userResponse, token });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.status !== 'active') {
        return res.status(401).json({ message: "Account is not active" });
      }

      // Generate token and set session
      const token = generateToken({ userId: user.id, email: user.email });
      (req.session as any).userId = user.id;

      // Return user without password hash
      const { passwordHash: _, ...userResponse } = user;
      res.json({ user: userResponse, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Return user without password hash
      const { passwordHash: _, ...userResponse } = req.user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Plan routes
  app.get('/api/plans', async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get('/api/plans/:id', async (req, res) => {
    try {
      const plan = await storage.getPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });

  app.post('/api/plans', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const planData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(planData);
      
      // Create audit log
      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "CREATE_PLAN",
        targetType: "plan",
        targetId: plan.id,
        before: null,
        after: plan,
      });
      
      res.json(plan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(400).json({ message: "Failed to create plan" });
    }
  });

  app.patch('/api/plans/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const planId = req.params.id;
      const updates = insertPlanSchema.partial().parse(req.body);
      
      const existingPlan = await storage.getPlan(planId);
      if (!existingPlan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      const updatedPlan = await storage.updatePlan(planId, updates);
      
      // Create audit log
      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "UPDATE_PLAN",
        targetType: "plan",
        targetId: planId,
        before: existingPlan,
        after: updatedPlan,
      });
      
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(400).json({ message: "Failed to update plan" });
    }
  });

  app.delete('/api/plans/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const planId = req.params.id;
      
      const existingPlan = await storage.getPlan(planId);
      if (!existingPlan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      await storage.deletePlan(planId);
      
      // Create audit log
      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "DELETE_PLAN",
        targetType: "plan",
        targetId: planId,
        before: existingPlan,
        after: null,
      });
      
      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // Market series routes
  app.get('/api/market-series/:planId', async (req, res) => {
    try {
      const series = await storage.getMarketSeries(req.params.planId);
      if (!series) {
        return res.status(404).json({ message: "Market series not found" });
      }
      res.json(series);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market series" });
    }
  });

  // Subscription routes
  app.get('/api/subscriptions', isAuthenticated, async (req, res) => {
    try {
      const subscriptions = await storage.getUserSubscriptions(req.user!.id);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post('/api/subscriptions', isAuthenticated, async (req, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const subscription = await storage.createSubscription(subscriptionData);
      res.json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: "Failed to create subscription" });
    }
  });

  app.patch('/api/subscriptions/:id', isAuthenticated, async (req, res) => {
    try {
      const subscriptionId = req.params.id;
      const updates = insertSubscriptionSchema.partial().parse(req.body);
      
      // Verify ownership
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription || subscription.userId !== req.user!.id) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      const updatedSubscription = await storage.updateSubscription(subscriptionId, updates);
      res.json(updatedSubscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(400).json({ message: "Failed to update subscription" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const transactions = req.user!.role === 'admin' 
        ? await storage.getAllTransactions()
        : await storage.getUserTransactions(req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  // Rate adjustment routes
  app.get('/api/rate-adjustments/:planId', isAuthenticated, async (req, res) => {
    try {
      const adjustments = await storage.getRateAdjustments(req.user!.id, req.params.planId);
      res.json(adjustments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rate adjustments" });
    }
  });

  app.post('/api/rate-adjustments', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const adjustmentData = insertRateAdjustmentSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
      
      const adjustment = await storage.createRateAdjustment(adjustmentData);
      res.json(adjustment);
    } catch (error) {
      console.error("Error creating rate adjustment:", error);
      res.status(400).json({ message: "Failed to create rate adjustment" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password hashes from response
      const safeUsers = users.map(({ passwordHash: _, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:id/kyc', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { status } = z.object({
        status: z.enum(["pending", "approved", "rejected"]),
      }).parse(req.body);
      
      const verifiedAt = status === 'approved' ? new Date() : undefined;
      const user = await storage.updateUserKyc(userId, status, verifiedAt);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "UPDATE_KYC",
        targetType: "user",
        targetId: userId,
        before: null,
        after: { status, verifiedAt },
      });
      
      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error updating KYC:", error);
      res.status(400).json({ message: "Failed to update KYC status" });
    }
  });

  app.patch('/api/admin/users/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { status } = z.object({
        status: z.enum(["active", "frozen"]),
      }).parse(req.body);
      
      const user = await storage.updateUserStatus(userId, status);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "UPDATE_USER_STATUS",
        targetType: "user",
        targetId: userId,
        before: null,
        after: { status },
      });
      
      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(400).json({ message: "Failed to update user status" });
    }
  });

  app.get('/api/admin/audit-logs', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}