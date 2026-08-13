import { requireAdmin } from "@/app/chatgpt-auth";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin("/admin");
  return <AdminShell user={user} title="Operations overview" eyebrow="JournAway admin">{children}</AdminShell>;
}
