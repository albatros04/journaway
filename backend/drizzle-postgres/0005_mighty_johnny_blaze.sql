ALTER TABLE "tour_packages" ADD COLUMN "catalog_type" text DEFAULT 'package' NOT NULL;--> statement-breakpoint
CREATE INDEX "tour_packages_catalog_status_idx" ON "tour_packages" USING btree ("catalog_type","status");
--> statement-breakpoint
INSERT INTO "tour_packages" ("id", "slug", "name", "destination", "duration", "price_inr", "description", "image_key", "status", "catalog_type", "created_by_user_id", "updated_by_user_id") VALUES
  ('legacy-leh-ladakh-explorer', 'leh-ladakh-explorer', 'Leh Ladakh Explorer', 'Ladakh', '6D / 5N', 0, 'A classic Ladakh journey through high passes, mountain roads, and the landscapes around Leh.', 'ladakh-high-pass', 'published', 'tour', 'legacy-migration', 'legacy-migration'),
  ('legacy-pangong-nubra-trail', 'pangong-nubra-trail', 'Pangong & Nubra Trail', 'Ladakh', '7D / 6N', 0, 'A Ladakh route connecting the stillness of Pangong Lake with Nubra Valley landscapes.', 'pangong-lake', 'published', 'tour', 'legacy-migration', 'legacy-migration'),
  ('legacy-kashmir-valley-escape', 'kashmir-valley-escape', 'Kashmir Valley Escape', 'Kashmir', '5D / 4N', 0, 'An unhurried Kashmir journey through valley views, alpine meadows, and mountain air.', 'pahalgam-valley', 'published', 'tour', 'legacy-migration', 'legacy-migration')
ON CONFLICT ("slug") DO NOTHING;
