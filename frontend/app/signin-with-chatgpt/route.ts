import { configuredLocalDevelopmentUser, localDevelopmentAuthEnabled, localSessionCookieName } from "@/app/chatgpt-auth";

function safeReturnTo(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  if (!localDevelopmentAuthEnabled()) return new Response("Not found", { status: 404 });
  const user = configuredLocalDevelopmentUser();
  if (!user) return new Response("Local auth is enabled, but JOURNAWAY_LOCAL_AUTH_EMAIL is not configured in frontend/.env.local.", { status: 503 });

  const url = new URL(request.url);
  const responseHeaders = new Headers({ Location: new URL(safeReturnTo(url.searchParams.get("return_to")), url.origin).toString() });
  responseHeaders.append("Set-Cookie", `${localSessionCookieName()}=${encodeURIComponent(JSON.stringify(user))}; Path=/; HttpOnly; SameSite=Lax`);
  return new Response(null, { status: 302, headers: responseHeaders });
}
