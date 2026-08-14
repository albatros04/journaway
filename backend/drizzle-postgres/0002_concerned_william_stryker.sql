ALTER TABLE "customers" ALTER COLUMN "google_subject" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "password_hash" text;