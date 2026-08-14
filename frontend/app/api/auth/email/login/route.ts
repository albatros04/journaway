import { eq } from "drizzle-orm";
import { customerSessions, customers } from "../../../../../../backend/db/schema";
import { createSessionToken, customerSessionCookieName, customerSessionMaxAge, sessionExpiry, sha256 } from "@/lib/customer-auth";
import { getOperationsDb } from "@/lib/operations-api";
import { normalizeEmail, passwordMatches } from "@/lib/password-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : null;
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return Response.json({ error: "Email and password are required." }, { status: 400 });
    const db = getOperationsDb();
    const [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (!customer || !passwordMatches(password, customer.passwordHash)) return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    const sessionToken = createSessionToken();
    await db.insert(customerSessions).values({ id: crypto.randomUUID(), customerId: customer.id, tokenHash: await sha256(sessionToken), expiresAt: sessionExpiry() });
    const headers = new Headers({ "content-type": "application/json" });
    headers.append("Set-Cookie", `${customerSessionCookieName()}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${customerSessionMaxAge()}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    return new Response(JSON.stringify({ customer: { displayName: customer.displayName, email: customer.email } }), { status: 200, headers });
  } catch (error) { console.error("Email login failed", error); return Response.json({ error: "We could not sign you in. Please try again." }, { status: 503 }); }
}
