import { desc } from "drizzle-orm";
import { enquiries } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";

export async function GET() {
  const actor = await requireApiActor("admin"); if (isErrorResponse(actor)) return actor;
  try { return Response.json({ enquiries: await getOperationsDb().select().from(enquiries).orderBy(desc(enquiries.updatedAt)) }); }
  catch (error) { return jsonError(error); }
}
