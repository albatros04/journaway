import { eq } from "drizzle-orm";
import { customerSessions, customers } from "../../../../../../backend/db/schema";
import { createSessionToken, customerSessionCookieName, customerSessionMaxAge, sessionExpiry, sha256 } from "@/lib/customer-auth";
import { getOperationsDb } from "@/lib/operations-api";
import { hashPassword, normalizeEmail, validPassword } from "@/lib/password-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: unknown; email?: unknown; password?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : null;
    const password = typeof body.password === "string" ? body.password : "";
    if (!name || name.length > 120) return Response.json({ error: "Enter your name." }, { status: 400 });
    if (!email) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!validPassword(password)) return Response.json({ error: "Password must be 8–128 characters." }, { status: 400 });
    const db = getOperationsDb();
    const [existing] = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, email)).limit(1);
    if (existing) return Response.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });
    const [customer] = await db.insert(customers).values({ id: crypto.randomUUID(), email, displayName: name, passwordHash: hashPassword(password) }).returning();
    const sessionToken = createSessionToken();
    await db.insert(customerSessions).values({ id: crypto.randomUUID(), customerId: customer.id, tokenHash: await sha256(sessionToken), expiresAt: sessionExpiry() });
    const headers = new Headers({ "content-type": "application/json" });
    headers.append("Set-Cookie", `${customerSessionCookieName()}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${customerSessionMaxAge()}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    return new Response(JSON.stringify({ customer: { displayName: customer.displayName, email: customer.email } }), { status: 201, headers });
  } catch (error) { console.error("Email registration failed", error); return Response.json({ error: "We could not create your account. Please try again." }, { status: 503 }); }
}
