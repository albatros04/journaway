"use client";

import { useEffect, useRef, useState } from "react";

declare global { interface Window { google?: { accounts: { id: { initialize(config: { client_id: string; callback: (response: { credential?: string }) => void; auto_select?: boolean }): void; renderButton(parent: HTMLElement, options: { theme: "outline"; size: "large"; width: number; text: "continue_with" }): void; } } } } }

export function GoogleSignIn({ returnTo = "/account" }: { returnTo?: string }) {
  const mount = useRef<HTMLDivElement>(null); const [message, setMessage] = useState(""); const [clientId, setClientId] = useState("");
  useEffect(() => { fetch("/api/auth/config").then(response => response.json()).then(data => { const id = data.googleClientId ?? ""; setClientId(id); if (!id) setMessage("Google sign-in is not configured yet."); }).catch(() => setMessage("Google sign-in is not configured yet.")); }, []);
  useEffect(() => {
    if (!clientId || !mount.current) return;
    setMessage("");
    const render = () => { if (!window.google || !mount.current) return; window.google.accounts.id.initialize({ client_id: clientId, callback: async response => { if (!response.credential) { setMessage("Google did not return a sign-in credential. Please try again."); return; } setMessage("Signing you in…"); try { const result = await fetch("/api/auth/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential: response.credential }) }); const payload = await result.json() as { error?: string }; if (!result.ok) throw new Error(payload.error ?? "Unable to sign in."); window.location.assign(returnTo); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to sign in. Please try again."); } } }); window.google.accounts.id.renderButton(mount.current, { theme: "outline", size: "large", width: 340, text: "continue_with" }); };
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) { existing.addEventListener("load", render); render(); return () => existing.removeEventListener("load", render); }
    const script = document.createElement("script"); script.src = "https://accounts.google.com/gsi/client"; script.async = true; script.defer = true; script.onload = render; script.onerror = () => setMessage("Google sign-in could not load. Check your connection and authorized origin."); document.head.appendChild(script); return () => { script.onload = null; };
  }, [clientId, returnTo]);
  return <div className="google-sign-in"><div ref={mount} aria-label="Continue with Google" />{message && <p role="status">{message}</p>}</div>;
}
