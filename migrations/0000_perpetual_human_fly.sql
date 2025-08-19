CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"target_type" varchar NOT NULL,
	"target_id" varchar NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_series" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" varchar NOT NULL,
	"points" jsonb NOT NULL,
	"monthly_returns" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar NOT NULL,
	"risk_level" varchar NOT NULL,
	"min_sip_amount" numeric(10, 2) NOT NULL,
	"lock_in_months" integer NOT NULL,
	"expected_return_default" numeric(5, 2) NOT NULL,
	"expected_return_min" numeric(5, 2) NOT NULL,
	"expected_return_max" numeric(5, 2) NOT NULL,
	"description" text,
	"tags" text[],
	"cagr_3y" numeric(5, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rate_adjustments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"delta_bps" integer NOT NULL,
	"reason" text,
	"effective_from" timestamp NOT NULL,
	"effective_to" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"day_of_month" integer NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"start_date" timestamp NOT NULL,
	"pause_dates" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar,
	"subscription_id" varchar,
	"type" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'SUCCESS' NOT NULL,
	"gateway_ref" varchar,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'user' NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"kyc_status" varchar DEFAULT 'pending' NOT NULL,
	"pan" varchar,
	"aadhaar_last4" varchar,
	"bank_masked" varchar,
	"kyc_verified_at" timestamp,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" varchar,
	"password_reset_token" varchar,
	"password_reset_expires" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_series" ADD CONSTRAINT "market_series_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_adjustments" ADD CONSTRAINT "rate_adjustments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_adjustments" ADD CONSTRAINT "rate_adjustments_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_adjustments" ADD CONSTRAINT "rate_adjustments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");