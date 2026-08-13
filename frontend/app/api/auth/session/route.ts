import { getCustomerUser } from "@/lib/customer-auth";
export async function GET() { return Response.json({ customer: await getCustomerUser() }); }
