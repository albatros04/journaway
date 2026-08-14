import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ChatGPTUser } from "@/app/chatgpt-auth";

const COOKIE_NAME = "journaway_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

type AdminSession = { username: string; expiresAt: number };

function secret() { return process.env.JOURNAWAY_ADMIN_SESSION_SECRET?.trim() ?? ""; }
function configuredUsername() { return process.env.JOURNAWAY_ADMIN_USERNAME?.trim() ?? ""; }
function configuredPassword() { return process.env.JOURNAWAY_ADMIN_PASSWORD ?? ""; }
function encode(value: string) { return Buffer.from(value).toString("base64url"); }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }

export function adminAuthIsConfigured(): boolean {
  return Boolean(secret() && configuredUsername() && configuredPassword());
}

export function credentialsMatch(username: string, password: string): boolean {
  if (!adminAuthIsConfigured()) return false;
  const hash = (value: string) => createHash("sha256").update(value).digest();
  const usernameMatch = timingSafeEqual(hash(username), hash(configuredUsername()));
  const passwordMatch = timingSafeEqual(hash(password), hash(configuredPassword()));
  return usernameMatch && passwordMatch;
}

export function createAdminSessionCookie(username: string): string {
  const payload = encode(JSON.stringify({ username, expiresAt: Date.now() + SESSION_SECONDS * 1000 } satisfies AdminSession));
  const token = `${payload}.${sign(payload)}`;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

function parseSession(value: string | undefined): AdminSession | null {
  if (!value || !secret()) return null;
  const [payload, suppliedSignature] = value.split(".");
  if (!payload || !suppliedSignature) return null;
  const expectedSignature = sign(payload);
  if (suppliedSignature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(suppliedSignature), Buffer.from(expectedSignature))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<AdminSession>;
    if (parsed.username !== configuredUsername() || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now()) return null;
    return { username: parsed.username, expiresAt: parsed.expiresAt };
  } catch { return null; }
}

export async function getAdminUser(): Promise<ChatGPTUser | null> {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(COOKIE_NAME)?.value);
  if (!session) return null;
  return { userId: `admin:${session.username}`, email: `${session.username}@journaway.internal`, displayName: session.username, fullName: session.username };
}

export async function requireAdmin(returnTo: string): Promise<ChatGPTUser> {
  const user = await getAdminUser();
  if (!user) redirect(`/admin-signin?return_to=${encodeURIComponent(safeAdminPath(returnTo))}`);
  return user;
}

export function clearAdminSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

function safeAdminPath(value: string) { return value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin"; }
