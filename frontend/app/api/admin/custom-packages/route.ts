import { desc, eq } from "drizzle-orm";
import { customPackages, customers } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";

export async function GET() { const actor = await requireApiActor("admin"); if (isErrorResponse(actor)) return actor; try { const packages = await getOperationsDb().select({ customPackage: customPackages, customer: customers }).from(customPackages).innerJoin(customers, eq(customPackages.customerId, customers.id)).orderBy(desc(customPackages.updatedAt)); return Response.json({ packages }); } catch (error) { return jsonError(error); } }
