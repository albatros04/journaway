import { asc, eq } from "drizzle-orm";
import { operationsAccounts } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requiredText, requireApiActor } from "@/lib/operations-api";

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
    const [account] = await getOperationsDb().update(operationsAccounts).set({ status, updatedAt: new Date().toISOString() }).where(eq(operationsAccounts.id, id)).returning();
    if (!account) return Response.json({ error: "Access request not found." }, { status: 404 });
    return Response.json({ account });
  } catch (error) { return jsonError(error); }
}
