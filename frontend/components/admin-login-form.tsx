"use client";

import { useState } from "react";

export function AdminLoginForm({ returnTo }: { returnTo: string }) {
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setMessage(""); try { const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username, password }) }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "Unable to sign in."); window.location.assign(returnTo); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to sign in."); } finally { setBusy(false); } };
  return <form onSubmit={submit}><label>Username<input autoComplete="username" required value={username} onChange={event => setUsername(event.target.value)} /></label><label>Password<input autoComplete="current-password" required type="password" value={password} onChange={event => setPassword(event.target.value)} /></label><button className="button button-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>{message && <p className="form-notice">{message}</p>}</form>;
}
