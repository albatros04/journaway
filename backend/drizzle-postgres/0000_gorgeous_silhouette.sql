CREATE TABLE "custom_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"name" text NOT NULL,
	"destination_slug" text NOT NULL,
	"travel_start_date" text NOT NULL,
	"travel_end_date" text NOT NULL,
	"adults" integer NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"experiences_json" text DEFAULT '[]' NOT NULL,
	"accommodation_preference" text DEFAULT 'recommend' NOT NULL,
	"needs_cab" boolean DEFAULT false NOT NULL,
	"budget_inr" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"submitted_at" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"google_subject" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"profile_image_url" text,
	"phone" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"phone" text,
	"vehicle_registration" text,
	"vehicle_type" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_trips" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_reference" text,
	"driver_profile_id" text NOT NULL,
	"pickup_location" text NOT NULL,
	"dropoff_location" text NOT NULL,
	"pickup_at" text NOT NULL,
	"traveller_name" text NOT NULL,
	"traveller_phone" text,
	"status" text DEFAULT 'assigned' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"event_key" text NOT NULL,
	"customer_id" text,
	"recipient_email" text NOT NULL,
	"subject" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider_message_id" text,
	"sent_at" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_reference" text NOT NULL,
	"property_id" text NOT NULL,
	"room_id" text,
	"guest_name" text NOT NULL,
	"guest_email" text,
	"guest_phone" text,
	"check_in_date" text NOT NULL,
	"check_out_date" text NOT NULL,
	"adults" integer DEFAULT 1 NOT NULL,
	"room_count" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_partner_memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_properties" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"destination" text NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"contact_phone" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"inventory" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"destination" text NOT NULL,
	"duration" text NOT NULL,
	"price_inr" integer DEFAULT 0 NOT NULL,
	"description" text NOT NULL,
	"image_key" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"updated_by_user_id" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_packages" ADD CONSTRAINT "custom_packages_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_sessions" ADD CONSTRAINT "customer_sessions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_trips" ADD CONSTRAINT "driver_trips_driver_profile_id_driver_profiles_id_fk" FOREIGN KEY ("driver_profile_id") REFERENCES "public"."driver_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_bookings" ADD CONSTRAINT "hotel_bookings_property_id_hotel_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."hotel_properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_bookings" ADD CONSTRAINT "hotel_bookings_room_id_hotel_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."hotel_rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_partner_memberships" ADD CONSTRAINT "hotel_partner_memberships_property_id_hotel_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."hotel_properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_rooms" ADD CONSTRAINT "hotel_rooms_property_id_hotel_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."hotel_properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_packages_customer_updated_idx" ON "custom_packages" USING btree ("customer_id","updated_at");--> statement-breakpoint
CREATE INDEX "custom_packages_status_updated_idx" ON "custom_packages" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_sessions_token_hash_unique" ON "customer_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "customer_sessions_customer_idx" ON "customer_sessions" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_google_subject_unique" ON "customers" USING btree ("google_subject");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_email_unique" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "driver_profiles_user_id_unique" ON "driver_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "driver_profiles_email_unique" ON "driver_profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "driver_trips_driver_pickup_idx" ON "driver_trips" USING btree ("driver_profile_id","pickup_at");--> statement-breakpoint
CREATE UNIQUE INDEX "email_notifications_event_key_unique" ON "email_notifications" USING btree ("event_key");--> statement-breakpoint
CREATE INDEX "email_notifications_customer_idx" ON "email_notifications" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hotel_bookings_reference_unique" ON "hotel_bookings" USING btree ("booking_reference");--> statement-breakpoint
CREATE INDEX "hotel_bookings_property_dates_idx" ON "hotel_bookings" USING btree ("property_id","check_in_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hotel_partner_memberships_property_user_unique" ON "hotel_partner_memberships" USING btree ("property_id","user_id");--> statement-breakpoint
CREATE INDEX "hotel_partner_memberships_user_idx" ON "hotel_partner_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "hotel_rooms_property_idx" ON "hotel_rooms" USING btree ("property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tour_packages_slug_unique" ON "tour_packages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tour_packages_status_updated_idx" ON "tour_packages" USING btree ("status","updated_at");