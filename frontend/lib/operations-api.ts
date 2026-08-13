import { getChatGPTUser, isAdminUser, isDriverUser, isHotelPartnerUser, type ChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "../../backend/db";

export type OperationsRole = "admin" | "driver" | "hotel";

export async function requireApiActor(role: OperationsRole): Promise<ChatGPTUser | Response> {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });

  const allowed = role === "admin" ? isAdminUser(user) : role === "driver" ? isDriverUser(user) : isHotelPartnerUser(user);
  if (!allowed) return Response.json({ error: "You are not authorized to access this resource." }, { status: 403 });
  return user;
}

export function isErrorResponse(value: unknown): value is Response {
  return value instanceof Response;
}

export function jsonError(error: unknown): Response {
  console.error("Operations API error", error);
  return Response.json(
    { error: "The operations service is unavailable. Confirm the D1 binding and apply the database migration." },
    { status: 503 },
  );
}

export function requiredText(value: unknown, field: string, maxLength = 160): string | Response {
  if (typeof value !== "string") return Response.json({ error: `${field} is required.` }, { status: 400 });
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return Response.json({ error: `${field} must be between 1 and ${maxLength} characters.` }, { status: 400 });
  return trimmed;
}

export function optionalText(value: unknown, field: string, maxLength = 500): string | null | Response {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return Response.json({ error: `${field} must be text.` }, { status: 400 });
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return Response.json({ error: `${field} must be at most ${maxLength} characters.` }, { status: 400 });
  return trimmed || null;
}

export function positiveInteger(value: unknown, field: string, max = 1000): number | Response {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number) || number < 1 || number > max) return Response.json({ error: `${field} must be a whole number between 1 and ${max}.` }, { status: 400 });
  return number;
}

export function isoDate(value: unknown, field: string): string | Response {
  const text = requiredText(value, field, 10);
  if (isErrorResponse(text)) return text;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`))) return Response.json({ error: `${field} must be an ISO date (YYYY-MM-DD).` }, { status: 400 });
  return text;
}

export function isoDateTime(value: unknown, field: string): string | Response {
  const text = requiredText(value, field, 40);
  if (isErrorResponse(text)) return text;
  if (Number.isNaN(Date.parse(text))) return Response.json({ error: `${field} must be a valid ISO date-time.` }, { status: 400 });
  return new Date(text).toISOString();
}

export function getOperationsDb() {
  return getDb();
}
