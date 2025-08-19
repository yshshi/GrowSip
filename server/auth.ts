import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import "dotenv/config";


const JWT_SECRET = process.env.JWT_SECRET || "your-secure-jwt-secret-key-here";
const SESSION_SECRET = process.env.SESSION_SECRET || "your-secure-session-secret-here";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function generateResetToken(): string {
  return jwt.sign({ type: 'reset', timestamp: Date.now() }, JWT_SECRET, { expiresIn: '1h' });
}

export function generateEmailVerificationToken(email: string): string {
  return jwt.sign({ type: 'email_verification', email }, JWT_SECRET, { expiresIn: '24h' });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    let user: User | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded && decoded.userId) {
        user = await storage.getUser(decoded.userId);
      }
    }

    // Check for user in session as fallback
    if (!user && req.session && (req.session as any).userId) {
      user = await storage.getUser((req.session as any).userId);
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: "Account is not active" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const optionalAuth: RequestHandler = async (req, res, next) => {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    let user: User | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded && decoded.userId) {
        user = await storage.getUser(decoded.userId);
      }
    }

    // Check for user in session as fallback
    if (!user && req.session && (req.session as any).userId) {
      user = await storage.getUser((req.session as any).userId);
    }

    if (user && user.status === 'active') {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};