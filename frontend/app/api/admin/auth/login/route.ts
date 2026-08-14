import { adminAuthIsConfigured, createAdminSessionCookie, credentialsMatch } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!adminAuthIsConfigured()) return Response.json({ error: "Admin login is not configured. Add the admin secrets on the server." }, { status: 503 });
  try {
    const body = await request.json() as { username?: unknown; password?: unknown };
    if (typeof body.username !== "string" || typeof body.password !== "string") return Response.json({ error: "Username and password are required." }, { status: 400 });
    if (!credentialsMatch(body.username, body.password)) return Response.json({ error: "Incorrect username or password." }, { status: 401 });
    const headers = new Headers({ "content-type": "application/json" });
    headers.append("Set-Cookie", createAdminSessionCookie(body.username));
    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch { return Response.json({ error: "Unable to process the admin login." }, { status: 400 }); }
}
