export type TripPhoto = "pangong" | "";
export type HotelStay = { name: string; location: string; checkIn: string; nights: number; category: string; rooms: string; meals: string; photo: string };
export type TripDay = { title: string; description: string; transport: string; photo: string };
export type TripDocumentDetails = {
  totalInr: number; taxNote: string; coverPhoto: string; hotels: HotelStay[]; vehicle: string;
  days: TripDay[]; specialInclusions: string; inclusions: string; exclusions: string;
  terms: string; paymentTerms: string; paymentDetails: string; cancellationPolicy: string;
  consultant: string; phone: string; email: string; address: string; website: string;
};
export type TripSummary = {
  id: string; name: string; destinationSlug: string; travelStartDate: string; travelEndDate: string;
  adults: number; children: number; sourcePackageSlug?: string | null;
};
export type TripPdfInput = { trip: TripSummary; customerName: string; details: TripDocumentDetails; confirmed: boolean };
export const MAX_DOCUMENT_BYTES = 3_000_000;

export function dateAt(start: string, day: number): string {
  return new Date(Date.parse(`${start}T00:00:00Z`) + day * 86400000).toISOString().slice(0, 10);
}
export function tripNights(trip: TripSummary): number {
  return Math.round((Date.parse(trip.travelEndDate) - Date.parse(trip.travelStartDate)) / 86400000);
}
export function emptyTripDocument(trip: TripSummary): TripDocumentDetails {
  return { totalInr: 0, taxNote: "", coverPhoto: "pangong", hotels: [], vehicle: "",
    days: Array.from({ length: Math.min(31, Math.max(1, tripNights(trip) + 1)) }, () => ({ title: "", description: "", transport: "", photo: "" })),
    specialInclusions: "", inclusions: "", exclusions: "", terms: "", paymentTerms: "", paymentDetails: "", cancellationPolicy: "",
    consultant: "", phone: "", email: "", address: "", website: "https://journaway.in" };
}

// Uploads are JPEG/PNG data only. No remote URLs or server filesystem paths are accepted.
function photo(value: unknown): string {
  if (value === "" || value === "pangong") return value;
  if (typeof value !== "string" || value.length > 400_000 || !/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new Error("Use a JPG/PNG photo under 300 KB.");
  return value;
}
function text(value: unknown, label: string, max = 3000): string {
  if (typeof value !== "string" || value.length > max) throw new Error(`${label} must be text up to ${max} characters.`);
  return value.trim();
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid itinerary details.");
  return value as Record<string, unknown>;
}
export function parseTripDocument(value: unknown): TripDocumentDetails {
  if (JSON.stringify(value).length > MAX_DOCUMENT_BYTES) throw new Error("The itinerary photos are too large. Use fewer or smaller photos.");
  const v = object(value);
  if (typeof v.totalInr !== "number" || !Number.isSafeInteger(v.totalInr) || v.totalInr < 0 || v.totalInr > 100_000_000) throw new Error("Enter a valid total price in whole INR.");
  if (!Array.isArray(v.hotels) || v.hotels.length > 31 || !Array.isArray(v.days) || v.days.length < 1 || v.days.length > 31) throw new Error("An itinerary needs 1–31 days and no more than 31 hotel stays.");
  const hotels = v.hotels.map(raw => {
    const h = object(raw); const checkIn = text(h.checkIn, "Check-in", 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || new Date(checkIn).toISOString().slice(0, 10) !== checkIn) throw new Error("Choose a valid hotel check-in date.");
    if (!Number.isInteger(h.nights) || Number(h.nights) < 1 || Number(h.nights) > 30) throw new Error("Hotel nights must be 1–30.");
    return { name: text(h.name, "Hotel", 160), location: text(h.location, "Location", 120), checkIn, nights: Number(h.nights),
      category: text(h.category, "Category", 60), rooms: text(h.rooms, "Rooms", 200), meals: text(h.meals, "Meals", 160), photo: photo(h.photo) };
  });
  const days = v.days.map(raw => { const d = object(raw); return { title: text(d.title, "Day title", 180), description: text(d.description, "Day description"), transport: text(d.transport, "Transport", 300), photo: photo(d.photo) }; });
  const result: TripDocumentDetails = { totalInr: v.totalInr, coverPhoto: photo(v.coverPhoto), hotels, days,
    taxNote: text(v.taxNote, "Tax note", 200), vehicle: text(v.vehicle, "Vehicle", 200),
    specialInclusions: text(v.specialInclusions, "Special inclusions"), inclusions: text(v.inclusions, "Inclusions"), exclusions: text(v.exclusions, "Exclusions"),
    terms: text(v.terms, "Terms", 10000), paymentTerms: text(v.paymentTerms, "Payment terms"), paymentDetails: text(v.paymentDetails, "Payment details"), cancellationPolicy: text(v.cancellationPolicy, "Cancellation policy"),
    consultant: text(v.consultant, "Consultant", 120), phone: text(v.phone, "Phone", 80), email: text(v.email, "Email", 180), address: text(v.address, "Address", 300), website: text(v.website, "Website", 180) };
  if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) throw new Error("Enter a valid consultant email.");
  if (result.website && !/^https:\/\/[^\s]+$/.test(result.website)) throw new Error("Website must start with https://.");
  return result;
}
export function confirmationErrors(details: TripDocumentDetails, trip: TripSummary): string[] {
  const errors: string[] = [];
  if (details.totalInr <= 0) errors.push("Set the final total price.");
  if (!details.taxNote) errors.push("Explain whether the total includes taxes.");
  if (!details.coverPhoto) errors.push("Choose a cover photo.");
  if (details.days.length !== tripNights(trip) + 1) errors.push("Include one itinerary day for every travel date.");
  if (details.days.some(day => !day.title || !day.description)) errors.push("Complete every day's title and description.");
  if (details.hotels.some(h => !h.name || !h.rooms || !h.meals || !h.location || h.checkIn < trip.travelStartDate || dateAt(h.checkIn, h.nights) > trip.travelEndDate)) errors.push("Complete each hotel and keep its dates within the trip.");
  for (const key of ["inclusions", "exclusions", "terms", "paymentTerms", "cancellationPolicy"] as const) if (!details[key]) errors.push(`Complete ${key.replace(/([A-Z])/g, " $1").toLowerCase()}.`);
  if (!details.consultant || !details.email || !details.phone) errors.push("Enter the JournAway consultant's name, email and phone.");
  return errors;
}
