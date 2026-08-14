import { and, eq } from "drizzle-orm";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "../../backend/db";
import { operationsAccounts } from "../../backend/db/schema";

export type ManagedOperationsRole = "driver" | "hotel";

export async function hasActiveOperationsRole(user: Pick<ChatGPTUser, "userId" | "email">, role: ManagedOperationsRole): Promise<boolean> {
  const [account] = await getDb().select({ id: operationsAccounts.id }).from(operationsAccounts)
    .where(and(eq(operationsAccounts.userId, user.userId), eq(operationsAccounts.role, role), eq(operationsAccounts.status, "active"))).limit(1);
  return Boolean(account);
}
