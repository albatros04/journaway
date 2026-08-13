import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/customer-auth";

export default async function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) { const customer = await getCustomerUser(); if (!customer) redirect("/login?return_to=/account"); return <>{children}</>; }
