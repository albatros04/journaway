import { requireHotelPartner } from "@/app/chatgpt-auth";
import { HotelPartnerShell } from "@/components/hotel-partner-shell";

export default async function HotelPartnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireHotelPartner("/hotel");
  return <HotelPartnerShell user={user}>{children}</HotelPartnerShell>;
}
