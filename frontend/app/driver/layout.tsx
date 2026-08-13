import { requireDriver } from "@/app/chatgpt-auth";
import { DriverShell } from "@/components/driver-shell";

export default async function DriverLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireDriver("/driver");
  return <DriverShell user={user}>{children}</DriverShell>;
}
