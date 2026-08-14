"use client";

import { useState } from "react";

export function EmailAuthForm({ mode, returnTo }: { mode: "login" | "signup"; returnTo: string }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setMessage(""); try { const response = await fetch(`/api/auth/email/${mode === "signup" ? "register" : "login"}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(mode === "signup" ? { name, email, password } : { email, password }) }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "Unable to continue."); window.location.assign(returnTo); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to continue."); } finally { setBusy(false); } };
  return <form onSubmit={submit}>{mode === "signup" && <label>Full name<input required autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label>}<label>Email address<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label><label>Password<input required type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} /></label><button className="button button-primary" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}</button>{message && <p className="form-notice">{message}</p>}</form>;
}
