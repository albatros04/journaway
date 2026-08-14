CREATE TABLE "enquiry_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"window_started_at" text NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
