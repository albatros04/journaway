import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getOperationsDb, jsonError } from "@/lib/operations-api";
import { operationsAccounts } from "../../../../../backend/db/schema";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in with Google before requesting portal access." }, { status: 401 });
  try {
    const body = await request.json() as { role?: unknown };
    if (body.role !== "driver" && body.role !== "hotel") return Response.json({ error: "Choose either driver or hotel partner access." }, { status: 400 });
    const db = getOperationsDb();
    const [existing] = await db.select().from(operationsAccounts).where(eq(operationsAccounts.userId, user.userId)).limit(1);
    if (existing) {
      if (existing.role !== body.role) return Response.json({ error: "This account already has a different portal request. Contact JournAway operations." }, { status: 409 });
      return Response.json({ account: existing, created: false });
    }
    const [account] = await db.insert(operationsAccounts).values({
      id: crypto.randomUUID(), userId: user.userId, email: user.email.toLowerCase(), displayName: user.displayName, role: body.role, status: "pending",
    }).returning();
    return Response.json({ account, created: true }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
