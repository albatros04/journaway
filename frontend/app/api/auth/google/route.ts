import { eq } from "drizzle-orm";
import { customerSessions, customers } from "../../../../../backend/db/schema";
import { createSessionToken, customerSessionCookieName, customerSessionMaxAge, sessionExpiry, sha256 } from "@/lib/customer-auth";
import { verifyGoogleIdToken } from "@/lib/google-id-token";
import { getOperationsDb } from "@/lib/operations-api";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { credential?: unknown };
    if (typeof body.credential !== "string" || body.credential.length > 10000) return Response.json({ error: "A Google sign-in credential is required." }, { status: 400 });
    const identity = await verifyGoogleIdToken(body.credential);
    const db = getOperationsDb();
    const [bySubject] = await db.select().from(customers).where(eq(customers.googleSubject, identity.sub)).limit(1);
    const [byEmail] = bySubject ? [] : await db.select().from(customers).where(eq(customers.email, identity.email.toLowerCase())).limit(1);
    if (byEmail && byEmail.googleSubject !== identity.sub) return Response.json({ error: "An account already exists for this email. Contact JournAway support to link it securely." }, { status: 409 });
    const displayName = identity.name?.trim() || identity.email;
    const isNewCustomer = !bySubject;
    const customer = bySubject
      ? (await db.update(customers).set({ email: identity.email.toLowerCase(), displayName, profileImageUrl: identity.picture ?? null, updatedAt: new Date().toISOString() }).where(eq(customers.id, bySubject.id)).returning())[0]
      : (await db.insert(customers).values({ id: crypto.randomUUID(), googleSubject: identity.sub, email: identity.email.toLowerCase(), displayName, profileImageUrl: identity.picture ?? null }).returning())[0];
    const sessionToken = createSessionToken();
    await db.insert(customerSessions).values({ id: crypto.randomUUID(), customerId: customer.id, tokenHash: await sha256(sessionToken), expiresAt: sessionExpiry() });
    const headers = new Headers({ "content-type": "application/json" });
    headers.append("Set-Cookie", `${customerSessionCookieName()}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${customerSessionMaxAge()}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    return new Response(JSON.stringify({ customer: { displayName: customer.displayName, email: customer.email }, isNewCustomer }), { status: 200, headers });
  } catch (error) {
    console.error("Google authentication failed", error);
    const errorText = error instanceof Error ? `${error.message} ${"cause" in error ? String(error.cause ?? "") : ""}` : "";
    const message = /DATABASE_URL|ECONNREFUSED|connect ECONNREFUSED|Connection terminated/i.test(errorText)
      ? "Account service is unavailable. Start PostgreSQL on localhost:5432 and try again."
      : "We could not verify your Google sign-in. Please try again.";
    return Response.json({ error: message }, { status: 401 });
  }
}
