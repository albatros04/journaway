import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { customerSessions, customers } from "../../backend/db/schema";
import { getDb } from "../../backend/db";

const CUSTOMER_SESSION_COOKIE = "journaway_customer_session";
const SESSION_DAYS = 14;

export type CustomerUser = { id: string; email: string; displayName: string; profileImageUrl: string | null; phone: string | null };

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function createSessionToken(): string {
  const bytes = new Uint8Array(32); crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

export function customerSessionCookieName(): string { return CUSTOMER_SESSION_COOKIE; }
export function customerSessionMaxAge(): number { return SESSION_DAYS * 24 * 60 * 60; }
export function sessionExpiry(): string { return new Date(Date.now() + customerSessionMaxAge() * 1000).toISOString(); }

export async function getCustomerUser(): Promise<CustomerUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const tokenHash = await sha256(token);
    const [row] = await getDb().select({ customer: customers }).from(customerSessions).innerJoin(customers, eq(customerSessions.customerId, customers.id)).where(and(eq(customerSessions.tokenHash, tokenHash), gt(customerSessions.expiresAt, new Date().toISOString()))).limit(1);
    return row ? { id: row.customer.id, email: row.customer.email, displayName: row.customer.displayName, profileImageUrl: row.customer.profileImageUrl, phone: row.customer.phone } : null;
  } catch { return null; }
}

export async function requireCustomer(): Promise<CustomerUser> {
  const customer = await getCustomerUser();
  if (!customer) throw new Error("CUSTOMER_AUTH_REQUIRED");
  return customer;
}

export async function clearCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return;
  try { await getDb().delete(customerSessions).where(eq(customerSessions.tokenHash, await sha256(token))); } catch { /* Clear browser session even if persistent cleanup is unavailable. */ }
}
