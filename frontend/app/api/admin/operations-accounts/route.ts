import { asc, eq } from "drizzle-orm";
import { operationsAccounts } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requiredText, requireApiActor } from "@/lib/operations-api";
import { sendAccessApprovedEmail } from "@/lib/email-service";

export async function GET() {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const accounts = await getOperationsDb().select().from(operationsAccounts).orderBy(asc(operationsAccounts.status), asc(operationsAccounts.role), asc(operationsAccounts.displayName));
    return Response.json({ accounts });
  } catch (error) { return jsonError(error); }
}

export async function PATCH(request: Request) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = requiredText(body.id, "id", 80);
    const status = body.status;
    if (isErrorResponse(id)) return id;
    if (status !== "active" && status !== "suspended") return Response.json({ error: "Status must be active or suspended." }, { status: 400 });
    const db = getOperationsDb();
    const [previous] = await db.select().from(operationsAccounts).where(eq(operationsAccounts.id, id)).limit(1);
    if (!previous) return Response.json({ error: "Access request not found." }, { status: 404 });
    const [account] = await db.update(operationsAccounts).set({ status, updatedAt: new Date().toISOString() }).where(eq(operationsAccounts.id, id)).returning();
    if (!account) return Response.json({ error: "Access request not found." }, { status: 404 });
    if (previous.status !== "active" && account.status === "active") { try { await sendAccessApprovedEmail(account); } catch (error) { console.error("Portal access was approved but approval email could not be queued", error); } }
    return Response.json({ account });
  } catch (error) { return jsonError(error); }
}
