import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160 ? email : null;
}

export function validPassword(value: string): boolean { return value.length >= 8 && value.length <= 128; }

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function passwordMatches(password: string, storedHash: string | null): boolean {
  if (!storedHash) return false;
  const [algorithm, salt, expected] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expected) return false;
  try {
    const actual = scryptSync(password, Buffer.from(salt, "base64url"), KEY_LENGTH);
    const expectedBytes = Buffer.from(expected, "base64url");
    return expectedBytes.length === actual.length && timingSafeEqual(expectedBytes, actual);
  } catch { return false; }
}
