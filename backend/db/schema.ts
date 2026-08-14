import { sql } from "drizzle-orm";
import { boolean, foreignKey, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

const createdAt = text("created_at").notNull().default(sql`CURRENT_TIMESTAMP::text`);
const updatedAt = text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP::text`);

/**
 * Portal access is approved by an administrator and persisted here. This lets
 * JournAway onboard any number of drivers and hotel partners without secrets
 * containing a growing list of email addresses.
 */
export const operationsAccounts = pgTable("operations_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["driver", "hotel"] }).notNull(),
  status: text("status", { enum: ["pending", "active", "suspended"] }).notNull().default("pending"),
  createdAt,
  updatedAt,
}, table => [
  uniqueIndex("operations_accounts_user_id_unique").on(table.userId),
  uniqueIndex("operations_accounts_email_unique").on(table.email),
  index("operations_accounts_role_status_idx").on(table.role, table.status),
]);

/** A driver is linked to the authenticated ChatGPT identity, never a browser-supplied email alone. */
export const driverProfiles = pgTable("driver_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  phone: text("phone"),
  vehicleRegistration: text("vehicle_registration"),
  vehicleType: text("vehicle_type"),
  createdAt,
  updatedAt,
}, table => [
  uniqueIndex("driver_profiles_user_id_unique").on(table.userId),
  uniqueIndex("driver_profiles_email_unique").on(table.email),
]);

export const hotelProperties = pgTable("hotel_properties", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  city: text("city").notNull(),
  address: text("address"),
  contactPhone: text("contact_phone"),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  createdAt,
  updatedAt,
});

/** Maps a signed-in hotel partner to only the property or properties they may manage. */
export const hotelPartnerMemberships = pgTable("hotel_partner_memberships", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  role: text("role", { enum: ["owner", "manager"] }).notNull().default("owner"),
  createdAt,
}, table => [
  foreignKey({ columns: [table.propertyId], foreignColumns: [hotelProperties.id] }).onDelete("cascade"),
  uniqueIndex("hotel_partner_memberships_property_user_unique").on(table.propertyId, table.userId),
  index("hotel_partner_memberships_user_idx").on(table.userId),
]);

export const hotelRooms = pgTable("hotel_rooms", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  inventory: integer("inventory").notNull(),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  createdAt,
  updatedAt,
}, table => [
  foreignKey({ columns: [table.propertyId], foreignColumns: [hotelProperties.id] }).onDelete("cascade"),
  index("hotel_rooms_property_idx").on(table.propertyId),
]);

export const hotelBookings = pgTable("hotel_bookings", {
  id: text("id").primaryKey(),
  bookingReference: text("booking_reference").notNull(),
  propertyId: text("property_id").notNull(),
  roomId: text("room_id"),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  checkInDate: text("check_in_date").notNull(),
  checkOutDate: text("check_out_date").notNull(),
  adults: integer("adults").notNull().default(1),
  roomCount: integer("room_count").notNull().default(1),
  status: text("status", { enum: ["confirmed", "checked_in", "checked_out", "cancelled"] }).notNull().default("confirmed"),
  createdAt,
  updatedAt,
}, table => [
  foreignKey({ columns: [table.propertyId], foreignColumns: [hotelProperties.id] }).onDelete("restrict"),
  foreignKey({ columns: [table.roomId], foreignColumns: [hotelRooms.id] }).onDelete("set null"),
  uniqueIndex("hotel_bookings_reference_unique").on(table.bookingReference),
  index("hotel_bookings_property_dates_idx").on(table.propertyId, table.checkInDate),
]);

export const driverTrips = pgTable("driver_trips", {
  id: text("id").primaryKey(),
  bookingReference: text("booking_reference"),
  driverProfileId: text("driver_profile_id").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  pickupAt: text("pickup_at").notNull(),
  travellerName: text("traveller_name").notNull(),
  travellerPhone: text("traveller_phone"),
  status: text("status", { enum: ["assigned", "en_route", "completed", "cancelled"] }).notNull().default("assigned"),
  createdAt,
  updatedAt,
}, table => [
  foreignKey({ columns: [table.driverProfileId], foreignColumns: [driverProfiles.id] }).onDelete("restrict"),
  index("driver_trips_driver_pickup_idx").on(table.driverProfileId, table.pickupAt),
]);

/** Admin-managed packages. Image choices are intentionally limited to approved Ladakh and Kashmir scenery. */
export const tourPackages = pgTable("tour_packages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  destination: text("destination", { enum: ["Ladakh", "Kashmir"] }).notNull(),
  duration: text("duration").notNull(),
  priceInr: integer("price_inr").notNull().default(0),
  description: text("description").notNull(),
  imageKey: text("image_key", { enum: ["ladakh-high-pass", "pangong-lake", "pahalgam-valley", "gulmarg-snow"] }).notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  createdByUserId: text("created_by_user_id").notNull(),
  updatedByUserId: text("updated_by_user_id").notNull(),
  createdAt,
  updatedAt,
}, table => [
  uniqueIndex("tour_packages_slug_unique").on(table.slug),
  index("tour_packages_status_updated_idx").on(table.status, table.updatedAt),
]);

/** Google-authenticated customers are intentionally separate from internal operations identities. */
export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  googleSubject: text("google_subject"),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash"),
  profileImageUrl: text("profile_image_url"),
  phone: text("phone"),
  createdAt,
  updatedAt,
}, table => [
  uniqueIndex("customers_google_subject_unique").on(table.googleSubject),
  uniqueIndex("customers_email_unique").on(table.email),
]);

export const customerSessions = pgTable("customer_sessions", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt,
}, table => [
  foreignKey({ columns: [table.customerId], foreignColumns: [customers.id] }).onDelete("cascade"),
  uniqueIndex("customer_sessions_token_hash_unique").on(table.tokenHash),
  index("customer_sessions_customer_idx").on(table.customerId),
]);

export const customPackages = pgTable("custom_packages", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  name: text("name").notNull(),
  destinationSlug: text("destination_slug").notNull(),
  travelStartDate: text("travel_start_date").notNull(),
  travelEndDate: text("travel_end_date").notNull(),
  adults: integer("adults").notNull(),
  children: integer("children").notNull().default(0),
  experiencesJson: text("experiences_json").notNull().default("[]"),
  accommodationPreference: text("accommodation_preference", { enum: ["recommend", "none"] }).notNull().default("recommend"),
  needsCab: boolean("needs_cab").notNull().default(false),
  budgetInr: integer("budget_inr"),
  status: text("status", { enum: ["draft", "submitted", "under_review", "quoted", "confirmed", "cancelled"] }).notNull().default("draft"),
  submittedAt: text("submitted_at"),
  createdAt,
  updatedAt,
}, table => [
  foreignKey({ columns: [table.customerId], foreignColumns: [customers.id] }).onDelete("cascade"),
  index("custom_packages_customer_updated_idx").on(table.customerId, table.updatedAt),
  index("custom_packages_status_updated_idx").on(table.status, table.updatedAt),
]);

/** Idempotent server-side notification ledger. A unique event prevents duplicate customer email. */
export const emailNotifications = pgTable("email_notifications", {
  id: text("id").primaryKey(),
  eventKey: text("event_key").notNull(),
  customerId: text("customer_id"),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  status: text("status", { enum: ["pending", "sent", "failed"] }).notNull().default("pending"),
  providerMessageId: text("provider_message_id"),
  sentAt: text("sent_at"),
  createdAt,
}, table => [
  foreignKey({ columns: [table.customerId], foreignColumns: [customers.id] }).onDelete("set null"),
  uniqueIndex("email_notifications_event_key_unique").on(table.eventKey),
  index("email_notifications_customer_idx").on(table.customerId),
]);
