CREATE TABLE "trip_documents" (
	"trip_id" text PRIMARY KEY NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"details_json" text NOT NULL,
	"confirmed_pdf_base64" text,
	"confirmed_at" text,
	"confirmed_customer_name" text,
	"confirmed_customer_email" text,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_packages" ADD COLUMN "source_package_slug" text;--> statement-breakpoint
ALTER TABLE "trip_documents" ADD CONSTRAINT "trip_documents_trip_id_custom_packages_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."custom_packages"("id") ON DELETE cascade ON UPDATE no action;