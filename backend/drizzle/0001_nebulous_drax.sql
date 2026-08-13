CREATE TABLE `tour_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`destination` text NOT NULL,
	`duration` text NOT NULL,
	`description` text NOT NULL,
	`image_key` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by_user_id` text NOT NULL,
	`updated_by_user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tour_packages_slug_unique` ON `tour_packages` (`slug`);--> statement-breakpoint
CREATE INDEX `tour_packages_status_updated_idx` ON `tour_packages` (`status`,`updated_at`);