CREATE TABLE `driver_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`phone` text,
	`vehicle_registration` text,
	`vehicle_type` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `driver_profiles_user_id_unique` ON `driver_profiles` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `driver_profiles_email_unique` ON `driver_profiles` (`email`);--> statement-breakpoint
CREATE TABLE `driver_trips` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_reference` text,
	`driver_profile_id` text NOT NULL,
	`pickup_location` text NOT NULL,
	`dropoff_location` text NOT NULL,
	`pickup_at` text NOT NULL,
	`traveller_name` text NOT NULL,
	`traveller_phone` text,
	`status` text DEFAULT 'assigned' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`driver_profile_id`) REFERENCES `driver_profiles`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `driver_trips_driver_pickup_idx` ON `driver_trips` (`driver_profile_id`,`pickup_at`);--> statement-breakpoint
CREATE TABLE `hotel_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_reference` text NOT NULL,
	`property_id` text NOT NULL,
	`room_id` text,
	`guest_name` text NOT NULL,
	`guest_email` text,
	`guest_phone` text,
	`check_in_date` text NOT NULL,
	`check_out_date` text NOT NULL,
	`adults` integer DEFAULT 1 NOT NULL,
	`room_count` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `hotel_properties`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`room_id`) REFERENCES `hotel_rooms`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hotel_bookings_reference_unique` ON `hotel_bookings` (`booking_reference`);--> statement-breakpoint
CREATE INDEX `hotel_bookings_property_dates_idx` ON `hotel_bookings` (`property_id`,`check_in_date`);--> statement-breakpoint
CREATE TABLE `hotel_partner_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'owner' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `hotel_properties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hotel_partner_memberships_property_user_unique` ON `hotel_partner_memberships` (`property_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `hotel_partner_memberships_user_idx` ON `hotel_partner_memberships` (`user_id`);--> statement-breakpoint
CREATE TABLE `hotel_properties` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`destination` text NOT NULL,
	`city` text NOT NULL,
	`address` text,
	`contact_phone` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hotel_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`inventory` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `hotel_properties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `hotel_rooms_property_idx` ON `hotel_rooms` (`property_id`);