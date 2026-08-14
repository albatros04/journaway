CREATE TABLE "operations_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "operations_accounts_user_id_unique" ON "operations_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "operations_accounts_email_unique" ON "operations_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "operations_accounts_role_status_idx" ON "operations_accounts" USING btree ("role","status");