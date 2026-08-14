"use client";

import { useState } from "react";

export function PortalAccessRequest({ accessType }: { accessType: "driver" | "hotel" }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const label = accessType === "driver" ? "driver" : "hotel partner";
  const requestAccess = async () => {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/operations/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ role: accessType }) });
      const data = await response.json() as { account?: { status: string }; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to send your request.");
      setMessage(data.account?.status === "active" ? "Your access is active. Open the portal again." : "Request received. A JournAway administrator must approve it before you can enter the portal.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to send your request."); }
    finally { setBusy(false); }
  };
  return <div className="portal-access-request"><button className="button button-primary" type="button" onClick={requestAccess} disabled={busy}>{busy ? "Sending request…" : `Request ${label} access`}</button>{message && <p>{message}</p>}</div>;
}
