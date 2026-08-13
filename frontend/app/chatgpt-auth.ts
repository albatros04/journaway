import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/customer-auth";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_ID_HEADER = "oai-authenticated-user-id";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/login";
const SIGN_OUT_PATH = "/";
const CALLBACK_PATH = "/callback";
const LOCAL_SESSION_COOKIE = "journaway_local_identity";

type LocalDevelopmentUser = Pick<ChatGPTUser, "userId" | "email" | "fullName">;

function configuredAdminEmails(): Set<string> {
  const value = process.env.JOURNAWAY_ADMIN_EMAILS ?? "";
  return new Set(value.split(",").map(email => email.trim().toLowerCase()).filter(Boolean));
}

function configuredDriverEmails(): Set<string> {
  const value = process.env.JOURNAWAY_DRIVER_EMAILS ?? "";
  return new Set(value.split(",").map(email => email.trim().toLowerCase()).filter(Boolean));
}

function configuredHotelPartnerEmails(): Set<string> {
  const value = process.env.JOURNAWAY_HOTEL_PARTNER_EMAILS ?? "";
  return new Set(value.split(",").map(email => email.trim().toLowerCase()).filter(Boolean));
}

export function isAdminUser(user: ChatGPTUser): boolean {
  return configuredAdminEmails().has(user.email.toLowerCase());
}

export function isDriverUser(user: ChatGPTUser): boolean {
  return configuredDriverEmails().has(user.email.toLowerCase());
}

export function isHotelPartnerUser(user: ChatGPTUser): boolean {
  return configuredHotelPartnerEmails().has(user.email.toLowerCase());
}

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const userId = requestHeaders.get(USER_ID_HEADER);
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (!userId || !email) {
    // On a self-hosted deployment, Google is the identity provider for both
    // customers and portal users. Portal authorization remains fail-closed via
    // the role email allowlists below.
    const customer = await getCustomerUser();
    if (customer) return { userId: customer.id, email: customer.email, displayName: customer.displayName, fullName: customer.displayName };
    const localUser = await getLocalDevelopmentUser();
    if (!localUser) return null;
    return { ...localUser, displayName: localUser.fullName ?? localUser.email };
  }

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  return {
    userId,
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

/** Local-only identity bridge for testing protected routes without the hosted ChatGPT gateway. */
export function localDevelopmentAuthEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.JOURNAWAY_ENABLE_LOCAL_AUTH !== "false";
}

export function configuredLocalDevelopmentUser(): LocalDevelopmentUser | null {
  if (!localDevelopmentAuthEnabled()) return null;
  const email = process.env.JOURNAWAY_LOCAL_AUTH_EMAIL?.trim().toLowerCase() ?? [...configuredAdminEmails()][0];
  if (!email) return null;
  return {
    userId: process.env.JOURNAWAY_LOCAL_AUTH_USER_ID?.trim() || `local:${email}`,
    email,
    fullName: process.env.JOURNAWAY_LOCAL_AUTH_NAME?.trim() || null,
  };
}

export function localSessionCookieName(): string {
  return LOCAL_SESSION_COOKIE;
}

function parseLocalDevelopmentUser(value: string | undefined): LocalDevelopmentUser | null {
  if (!value || !localDevelopmentAuthEnabled()) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<LocalDevelopmentUser>;
    if (typeof parsed.userId !== "string" || typeof parsed.email !== "string") return null;
    return { userId: parsed.userId, email: parsed.email.toLowerCase(), fullName: typeof parsed.fullName === "string" ? parsed.fullName : null };
  } catch { return null; }
}

async function getLocalDevelopmentUser(): Promise<LocalDevelopmentUser | null> {
  const cookieStore = await cookies();
  return parseLocalDevelopmentUser(cookieStore.get(LOCAL_SESSION_COOKIE)?.value);
}

/**
 * Server-side, fail-closed admin guard. Configure JOURNAWAY_ADMIN_EMAILS with
 * a comma-separated list of authenticated identity emails before enabling the
 * admin routes in production.
 */
export async function requireAdmin(returnTo: string): Promise<ChatGPTUser> {
  const user = await requireChatGPTUser(returnTo);
  if (!isAdminUser(user)) redirect("/admin-access-denied");
  return user;
}

/** Server-side, fail-closed driver guard backed by an explicit allowlist. */
export async function requireDriver(returnTo: string): Promise<ChatGPTUser> {
  const user = await requireChatGPTUser(returnTo);
  if (!isDriverUser(user)) redirect("/driver-access-denied");
  return user;
}

/** Server-side, fail-closed hotel-partner guard backed by an explicit allowlist. */
export async function requireHotelPartner(returnTo: string): Promise<ChatGPTUser> {
  const user = await requireChatGPTUser(returnTo);
  if (!isHotelPartnerUser(user)) redirect("/hotel-access-denied");
  return user;
}

export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
