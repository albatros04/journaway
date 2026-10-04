import { and, eq } from "drizzle-orm";
import { customPackages, customers, emailNotifications, tripDocuments } from "../../backend/db/schema";
import { getOperationsDb } from "./operations-api";
import { emptyTripDocument, parseTripDocument } from "./trip-document";

export async function getTripBundle(tripId: string) {
  const [row] = await getOperationsDb().select({ trip: customPackages, customer: { id: customers.id, displayName: customers.displayName, email: customers.email } })
    .from(customPackages).innerJoin(customers, eq(customPackages.customerId, customers.id)).where(eq(customPackages.id, tripId)).limit(1);
  return row;
}
export async function ensureTripDocument(trip: typeof customPackages.$inferSelect) {
  const db = getOperationsDb();
  await db.insert(tripDocuments).values({ tripId: trip.id, detailsJson: JSON.stringify(emptyTripDocument(trip)) }).onConflictDoNothing();
  const [document] = await db.select().from(tripDocuments).where(eq(tripDocuments.tripId, trip.id)).limit(1);
  return document;
}
export const tripEmailKey = (tripId: string) => `trip-document:${tripId}:confirmed`;
export async function documentDeliveryStatus(tripId: string) {
  const [notification] = await getOperationsDb().select({ status: emailNotifications.status }).from(emailNotifications).where(eq(emailNotifications.eventKey, tripEmailKey(tripId))).limit(1);
  return notification?.status ?? "not_sent";
}
export async function customerDocument(tripId: string, customerId: string) {
  const [row] = await getOperationsDb().select({ pdf: tripDocuments.confirmedPdfBase64 }).from(tripDocuments)
    .innerJoin(customPackages, eq(customPackages.id, tripDocuments.tripId))
    .where(and(eq(tripDocuments.tripId, tripId), eq(customPackages.customerId, customerId))).limit(1);
  return row?.pdf;
}
export function publicDocument(document: typeof tripDocuments.$inferSelect) {
  return { revision: document.revision, details: parseTripDocument(JSON.parse(document.detailsJson)), confirmedAt: document.confirmedAt };
}
