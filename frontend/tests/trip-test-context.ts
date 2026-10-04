import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../../backend/db/schema";
export const pg = new PGlite();
export const db = drizzle(pg, { schema });
export const identity = { admin: true, customerId: "customer-one" as string | null };
export const getOperationsDb = () => db;
export const getDb = () => db;
export async function requireApiActor() { return identity.admin ? { userId: "admin-test" } : Response.json({ error: "Unauthorized" }, { status: 401 }); }
export async function getCustomerUser() { return identity.customerId ? { id: identity.customerId, email: `${identity.customerId}@example.test`, displayName: identity.customerId } : null; }
