CREATE TABLE "enquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"service" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"destination" text,
	"pickup_location" text,
	"dropoff_location" text,
	"travel_start_date" text,
	"travel_end_date" text,
	"guests" integer,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "enquiries_status_updated_idx" ON "enquiries" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "enquiries_type_created_idx" ON "enquiries" USING btree ("type","created_at");