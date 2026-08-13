import { clearCustomerSession, customerSessionCookieName } from "@/lib/customer-auth";
export async function POST() { await clearCustomerSession(); const headers = new Headers({ "content-type": "application/json" }); headers.append("Set-Cookie", `${customerSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`); return new Response(JSON.stringify({ ok: true }), { headers }); }
