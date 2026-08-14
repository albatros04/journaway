import { AdminAccessManager } from "@/components/admin-access-manager";
import { asc, eq } from "drizzle-orm";
import { getOperationsDb } from "@/lib/operations-api";
import { hotelPartnerMemberships, hotelProperties, operationsAccounts } from "../../../../backend/db/schema";

export default async function AdminAccessPage() {
  let accounts: Awaited<ReturnType<ReturnType<typeof getOperationsDb>["select"]>> | never[] = [];
  let properties: Awaited<ReturnType<ReturnType<typeof getOperationsDb>["select"]>> | never[] = [];
  let initialMessage = "";
  try {
    const db = getOperationsDb();
    [accounts, properties] = await Promise.all([
      db.select().from(operationsAccounts).orderBy(asc(operationsAccounts.status), asc(operationsAccounts.role), asc(operationsAccounts.displayName)),
      db.select({ property: hotelProperties, member: hotelPartnerMemberships, account: operationsAccounts }).from(hotelProperties).leftJoin(hotelPartnerMemberships, eq(hotelProperties.id, hotelPartnerMemberships.propertyId)).leftJoin(operationsAccounts, eq(hotelPartnerMemberships.userId, operationsAccounts.userId)).orderBy(asc(hotelProperties.name)),
    ]);
  } catch {
    initialMessage = "Portal access needs PostgreSQL. Start the local database, apply the migration, then refresh this page.";
  }
  return <AdminAccessManager initialAccounts={accounts as never[]} initialProperties={properties as never[]} initialMessage={initialMessage} />;
}
