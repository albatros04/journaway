import { eq } from "drizzle-orm";
import { emailNotifications } from "../../backend/db/schema";
import { getOperationsDb } from "@/lib/operations-api";

type CustomPackageEmailInput = {
  id: string; customerId: string; name: string; destination: string; travelStartDate: string; travelEndDate: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
}

function customPackageHtml(input: CustomPackageEmailInput, status: string, heading: string) {
  return `<main style="max-width:600px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#19221d;background:#f6f4ec"><div style="padding:28px;background:#163a2b;color:#fff;border-radius:14px 14px 0 0"><strong style="letter-spacing:1px">JOURNAWAY</strong><h1 style="margin:18px 0 0;font-size:28px">${escapeHtml(heading)}</h1></div><div style="padding:28px;background:#fff;border-radius:0 0 14px 14px"><p>Hi,</p><p>Your request for <strong>${escapeHtml(input.name)}</strong> is now <strong>${escapeHtml(status)}</strong>. Our travel team will be in touch with the next steps.</p><table style="width:100%;border-collapse:collapse;margin:22px 0"><tr><td style="padding:10px 0;border-bottom:1px solid #e3e7e1">Destination</td><td style="padding:10px 0;border-bottom:1px solid #e3e7e1;text-align:right"><strong>${escapeHtml(input.destination)}</strong></td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #e3e7e1">Travel dates</td><td style="padding:10px 0;border-bottom:1px solid #e3e7e1;text-align:right"><strong>${escapeHtml(input.travelStartDate)} to ${escapeHtml(input.travelEndDate)}</strong></td></tr><tr><td style="padding:10px 0">Status</td><td style="padding:10px 0;text-align:right"><strong>${escapeHtml(status)}</strong></td></tr></table></div></main>`;
}

async function sendCustomPackageEmail(input: CustomPackageEmailInput, recipientEmail: string, event: "submitted" | "confirmed"): Promise<void> {
  const eventKey = `custom-package:${input.id}:${event}`;
  const isConfirmed = event === "confirmed";
  const subject = isConfirmed ? "Your JournAway custom trip is confirmed" : "JournAway received your custom trip request";
  const status = isConfirmed ? "Confirmed" : "Submitted for review";
  const heading = isConfirmed ? "Your custom trip is confirmed." : "Your custom trip request is received.";
  const db = getOperationsDb();
  const [notification] = await db.insert(emailNotifications).values({ id: crypto.randomUUID(), eventKey, customerId: input.customerId, recipientEmail, subject }).onConflictDoNothing().returning();
  if (!notification) return;
  try {
    // Resend is JournAway's supported production provider. Keeping it as the
    // default avoids requiring a non-secret provider-name variable in hosts
    // that scan all environment values for accidental disclosure.
    if ((process.env.EMAIL_PROVIDER ?? "resend").toLowerCase() !== "resend") throw new Error("No supported email provider is configured.");
    const apiKey = process.env.RESEND_API_KEY?.trim(); const from = process.env.EMAIL_FROM?.trim();
    if (!apiKey || !from) throw new Error("Resend email configuration is incomplete.");
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ from, to: [recipientEmail], subject, html: customPackageHtml(input, status, heading), text: `${heading} ${input.name}. Destination: ${input.destination}. Travel dates: ${input.travelStartDate} to ${input.travelEndDate}. Status: ${status}.` }) });
    if (!response.ok) throw new Error("Email provider rejected the request.");
    const provider = await response.json() as { id?: string };
    await db.update(emailNotifications).set({ status: "sent", providerMessageId: provider.id ?? null, sentAt: new Date().toISOString() }).where(eq(emailNotifications.id, notification.id));
  } catch (error) {
    console.error("Custom package notification failed", error);
    await db.update(emailNotifications).set({ status: "failed" }).where(eq(emailNotifications.id, notification.id));
  }
}

export async function sendCustomPackageReceivedEmail(input: CustomPackageEmailInput, recipientEmail: string): Promise<void> {
  await sendCustomPackageEmail(input, recipientEmail, "submitted");
}

export async function sendCustomPackageConfirmedEmail(input: CustomPackageEmailInput, recipientEmail: string): Promise<void> {
  await sendCustomPackageEmail(input, recipientEmail, "confirmed");
}
