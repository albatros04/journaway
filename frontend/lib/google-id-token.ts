type GooglePayload = { sub: string; email: string; email_verified: boolean; name?: string; picture?: string; aud: string | string[]; iss: string; exp: number };
type GoogleJwk = JsonWebKey & { kid?: string; alg?: string; use?: string };

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(normalized); return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
}

export async function verifyGoogleIdToken(token: string): Promise<GooglePayload> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) throw new Error("Google sign-in is not configured.");
  const [headerPart, payloadPart, signaturePart, ...extra] = token.split(".");
  if (!headerPart || !payloadPart || !signaturePart || extra.length) throw new Error("Invalid sign-in credential.");
  const header = decodeJson<{ alg?: string; kid?: string }>(headerPart);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported sign-in credential.");
  const keyResponse = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!keyResponse.ok) throw new Error("Google verification service is unavailable.");
  const keySet = await keyResponse.json() as { keys?: GoogleJwk[] };
  const key = keySet.keys?.find(item => item.kid === header.kid && item.kty === "RSA" && item.use === "sig");
  if (!key) throw new Error("Google signing key is unavailable. Please try again.");
  const cryptoKey = await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const validSignature = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, decodeBase64Url(signaturePart), new TextEncoder().encode(`${headerPart}.${payloadPart}`));
  if (!validSignature) throw new Error("Invalid sign-in credential.");
  const payload = decodeJson<GooglePayload>(payloadPart);
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!payload.sub || !payload.email || payload.email_verified !== true || !audiences.includes(clientId) || !["accounts.google.com", "https://accounts.google.com"].includes(payload.iss) || !Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) throw new Error("Google credential verification failed.");
  return payload;
}
