import { asc } from "drizzle-orm";
import { driverProfiles } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";

export async function GET() {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const drivers = await getOperationsDb().select().from(driverProfiles).orderBy(asc(driverProfiles.displayName));
    return Response.json({ drivers });
  } catch (error) { return jsonError(error); }
}
