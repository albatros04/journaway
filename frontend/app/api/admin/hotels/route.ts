import { asc, eq } from "drizzle-orm";
import { hotelPartnerMemberships, hotelProperties, operationsAccounts } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requiredText, requireApiActor } from "@/lib/operations-api";

export async function GET() {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const properties = await getOperationsDb().select({ property: hotelProperties, member: hotelPartnerMemberships, account: operationsAccounts }).from(hotelProperties).leftJoin(hotelPartnerMemberships, eq(hotelProperties.id, hotelPartnerMemberships.propertyId)).leftJoin(operationsAccounts, eq(hotelPartnerMemberships.userId, operationsAccounts.userId)).orderBy(asc(hotelProperties.name));
    return Response.json({ properties });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = requiredText(body.name, "name");
    const destination = requiredText(body.destination, "destination");
    const city = requiredText(body.city, "city");
    if (isErrorResponse(name) || isErrorResponse(destination) || isErrorResponse(city)) return isErrorResponse(name) ? name : isErrorResponse(destination) ? destination : city;
    const [property] = await getOperationsDb().insert(hotelProperties).values({ id: crypto.randomUUID(), name, destination, city }).returning();
    return Response.json({ property }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
