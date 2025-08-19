export const RISK_LEVELS = {
  LOW: "Low",
  MEDIUM: "Medium", 
  HIGH: "High",
  VERY_HIGH: "Very High"
} as const;

export const PLAN_CATEGORIES = {
  LARGE_CAP: "Large Cap",
  MID_CAP: "Mid Cap",
  SMALL_CAP: "Small Cap",
  MULTI_CAP: "Multi Cap"
} as const;

export const TRANSACTION_TYPES = {
  SIP: "SIP",
  REFUND: "REFUND",
  ADJUSTMENT: "ADJUSTMENT"
} as const;

export const TRANSACTION_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED", 
  PENDING: "PENDING"
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled"
} as const;

export const KYC_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
} as const;

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin"
} as const;

export const USER_STATUS = {
  ACTIVE: "active",
  FROZEN: "frozen"
} as const;

// Financial calculation constants
export const MONTHS_IN_YEAR = 12;
export const DEFAULT_SIP_DAY = 15;
export const MIN_SIP_AMOUNT = 500;
export const MAX_SIP_AMOUNT = 100000;
export const MIN_DURATION_YEARS = 1;
export const MAX_DURATION_YEARS = 40;
export const MIN_RETURN_RATE = 1;
export const MAX_RETURN_RATE = 30;

// Chart colors matching the design
export const CHART_COLORS = {
  PRIMARY: "hsl(203.8863, 88.2845%, 53.1373%)",
  SUCCESS: "hsl(159.7826, 100%, 36.0784%)",
  WARNING: "hsl(42.0290, 92.8251%, 56.2745%)",
  CHART_4: "hsl(147.1429, 78.5047%, 41.9608%)",
  CHART_5: "hsl(341.4894, 75.2000%, 50.9804%)"
} as const;
