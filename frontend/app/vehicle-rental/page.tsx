import { CabExperience } from "@/components/cab-experience";

export default async function RentalPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] : "";
  return <CabExperience initialTrip={{ pickup: value("pickup"), drop: value("drop"), date: value("date") }} />;
}
