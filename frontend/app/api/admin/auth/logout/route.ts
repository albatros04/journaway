import { clearAdminSessionCookie } from "@/lib/admin-auth";

export async function POST() {
  const headers = new Headers({ "content-type": "application/json" });
  headers.append("Set-Cookie", clearAdminSessionCookie());
  return new Response(JSON.stringify({ ok: true }), { headers });
}
