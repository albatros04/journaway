import { PDFDocument, PageSizes, rgb, degrees, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import assets from "./trip-pdf-assets.json";
import { dateAt, tripNights, type TripPdfInput } from "./trip-document";

const ink = rgb(.09, .13, .2), blue = rgb(.12, .26, .7), pale = rgb(.77, .86, 1), muted = rgb(.34, .39, .46);
const W = 595.28, H = 841.89, M = 26, CW = W - M * 2, BOTTOM = 54;
export const pdfFilename = (id: string) => `JournAway-trip-${id.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 60)}.pdf`;
export async function generateTripPdf(input: TripPdfInput): Promise<Buffer> {
  const { trip, details: d, customerName, confirmed } = input;
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(Buffer.from(assets.regular, "base64"), { subset: true });
  const bold = await pdf.embedFont(Buffer.from(assets.bold, "base64"), { subset: true });
  pdf.setTitle(`${trip.name} - JournAway ${confirmed ? "confirmation" : "preview"}`); pdf.setAuthor("JournAway");
  let page!: PDFPage; let y = 0;
  const cache = new Map<string, Awaited<ReturnType<typeof pdf.embedJpg>>>();
  function newPage() {
    page = pdf.addPage(PageSizes.A4); y = H - 42;
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(.975, .978, .984) });
    for (let yy = 130; yy < H; yy += 190) page.drawText("JournAway  •  Find your next adventure", { x: 22, y: yy, size: 21, font: regular, color: rgb(.93, .94, .95), rotate: degrees(24) });
  }
  function room(height: number) { if (y - height < BOTTOM) newPage(); }
  function lines(value: string, font: PDFFont, size: number, width: number): string[] {
    const result: string[] = [];
    for (const paragraph of value.replace(/\r/g, "").replace(/[\u2010-\u2015]/g, "-").split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        if (!word) continue;
        if (font.widthOfTextAtSize(line ? `${line} ${word}` : word, size) <= width) { line = line ? `${line} ${word}` : word; continue; }
        if (line) { result.push(line); line = ""; }
        for (const char of word) { if (font.widthOfTextAtSize(line + char, size) > width) { result.push(line); line = ""; } line += char; }
      }
      result.push(line);
    }
    return result;
  }
  function text(value: string, size = 10, font = regular, color = ink, x = M, width = CW, gap = 6) {
    for (const line of lines(value, font, size, width)) { room(size * 1.6); page.drawText(line, { x, y: y - size, size, font, color }); y -= size * 1.6; }
    y -= gap;
  }
  function heading(title: string) {
    room(70); page.drawRectangle({ x: M, y: y - 34, width: CW, height: 34, color: pale });
    page.drawRectangle({ x: M, y: y - 34, width: 5, height: 34, color: blue });
    page.drawText(title, { x: M + 19, y: y - 23, size: 15, font: bold, color: blue }); y -= 51;
  }
  async function picture(key: string, x: number, top: number, width: number, height: number) {
    if (!key) return;
    let image = cache.get(key);
    if (!image) {
      const bytes = Buffer.from(key === "pangong" ? assets.pangong : key === "logo" ? assets.logo : key.split(",")[1], "base64");
      image = (key === "logo" || key.startsWith("data:image/png")) ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      cache.set(key, image);
    }
    // Crop centrally to preserve image proportions inside the intended frame.
    const scale = Math.max(width / image.width, height / image.height);
    const { pushGraphicsState, popGraphicsState, rectangle, clip, endPath } = await import("pdf-lib");
    page.pushOperators(pushGraphicsState(), rectangle(x, top - height, width, height), clip(), endPath());
    page.drawImage(image, { x: x + (width - image.width * scale) / 2, y: top - height + (height - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
    page.pushOperators(popGraphicsState());
  }
  function tableRow(label: string, value: string) {
    const leftLines = lines(label, bold, 10, 130), rightLines = lines(value, regular, 10, CW - 160);
    const height = Math.max(leftLines.length, rightLines.length) * 16 + 16; room(height);
    page.drawRectangle({ x: M, y: y - height, width: CW, height, color: rgb(1, 1, 1), borderWidth: .5, borderColor: rgb(.83, .85, .89) });
    leftLines.forEach((line, i) => page.drawText(line, { x: M + 10, y: y - 18 - i * 16, font: bold, size: 10, color: ink }));
    rightLines.forEach((line, i) => page.drawText(line, { x: M + 153, y: y - 18 - i * 16, font: regular, size: 10, color: ink })); y -= height;
  }
  const friendly = (date: string) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
  newPage();
  if (d.coverPhoto) await picture(d.coverPhoto, 0, H, W, 235);
  page.drawRectangle({ x: 15, y: H - 98, width: 146, height: 85, color: rgb(1, 1, 1), opacity: .94 });
  // Contain the logo so its lettering never gets cropped.
  const logo = await pdf.embedPng(Buffer.from(assets.logo, "base64")); const logoSize = logo.scaleToFit(134, 76);
  page.drawImage(logo, { x: 21 + (134 - logoSize.width) / 2, y: H - 92 + (76 - logoSize.height) / 2, ...logoSize });
  page.drawRectangle({ x: 0, y: H - 264, width: W, height: 29, color: rgb(.09, .22, .18) });
  page.drawText([d.phone, d.email, d.website].filter(Boolean).join("    |    ").slice(0, 115), { x: M, y: H - 253, size: 8, font: regular, color: rgb(1, 1, 1) });
  y = H - 290;
  text(`Dear ${customerName},`, 11, bold); text(confirmed ? "Your journey is confirmed. Please find your approved trip details below." : "DRAFT PREVIEW - This itinerary has not been confirmed or emailed.", 10);
  text(trip.name, 20, bold, blue);
  const facts = [["DESTINATION", trip.destinationSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())], ["START DATE", friendly(trip.travelStartDate)], ["DURATION", `${tripNights(trip)} Nights / ${tripNights(trip) + 1} Days`], ["TRAVELLERS", `${trip.adults} adults, ${trip.children} children`], ["TRIP REFERENCE", trip.id], ["PACKAGE", trip.sourcePackageSlug ? "Selected journey" : "Custom journey"]];
  room(130); const factsTop = y;
  facts.forEach(([label, value], i) => { const x = M + (i % 3) * (CW / 3); const top = factsTop - Math.floor(i / 3) * 63; page.drawText(label, { x, y: top - 10, size: 8, font: bold, color: muted }); lines(value, bold, 10, CW / 3 - 16).slice(0, 3).forEach((line, n) => page.drawText(line, { x, y: top - 30 - n * 14, size: 10, font: bold, color: ink })); }); y -= 126;
  y -= 10; heading(confirmed ? "Confirmed Package Price" : "Quote Price");
  tableRow("Total (INR)", new Intl.NumberFormat("en-IN").format(d.totalInr)); y -= 8; text(d.taxNote || "Tax details pending", 9);
  newPage(); heading("Hotels / Accommodations");
  if (!d.hotels.length) text("No accommodation included. Refer to the agreed inclusions below.");
  for (const hotel of d.hotels) {
    const description = `${hotel.nights} night${hotel.nights > 1 ? "s" : ""} at ${hotel.location}\nCheck-in: ${friendly(hotel.checkIn)}\n${hotel.category}\nRooms: ${hotel.rooms}\nMeal plan: ${hotel.meals}`;
    const width = hotel.photo ? CW - 211 : CW - 28;
    const height = Math.max(160, lines(hotel.name, bold, 13, width).length * 20 + lines(description, regular, 10, width).length * 16 + 40);
    room(height + 16); const top = y;
    page.drawRectangle({ x: M, y: top - height, width: CW, height, color: rgb(1, 1, 1), borderWidth: .5, borderColor: rgb(.83, .85, .89) });
    y -= 14; text(hotel.name, 13, bold, blue, M + 14, width); text(description, 10, regular, ink, M + 14, width);
    if (hotel.photo) await picture(hotel.photo, W - M - 183, top - 14, 169, 123);
    y = top - height - 15;
  }
  heading("Transportation"); text(d.vehicle || "No transport included.", 11, bold);
  for (const [i, day] of d.days.entries()) if (day.transport) tableRow(`Day ${i + 1} | ${dateAt(trip.travelStartDate, i)}`, day.transport);
  if (d.specialInclusions) { y -= 24; heading("Other Special Inclusions"); text(d.specialInclusions); }
  newPage(); heading("Day Wise Itinerary");
  for (const [i, day] of d.days.entries()) {
    room(day.photo ? 335 : 130); text(`Day ${i + 1}  |  ${friendly(dateAt(trip.travelStartDate, i))}`, 10, bold);
    text(day.title || "Itinerary pending", 16, bold, blue, M + 20, CW - 20);
    if (day.photo) { room(232); await picture(day.photo, M + 20, y, CW - 20, 216); y -= 229; }
    text(day.description || "Details pending.", 10, regular, ink, M + 20, CW - 20, 22);
  }
  newPage(); heading("Inclusions / Exclusions"); text("Inclusions", 12, bold, rgb(.05, .5, .22)); text(d.inclusions || "Pending");
  y -= 12; text("Exclusions", 12, bold, rgb(.72, .17, .14)); text(d.exclusions || "Pending");
  y -= 16; heading("Terms and Conditions"); text(d.terms || "Pending");
  y -= 15; heading("Payment Terms for Booking"); text(d.paymentTerms || "Pending");
  if (d.paymentDetails) { text("Payment details", 12, bold); text(d.paymentDetails); }
  y -= 15; heading("Cancellation Policy"); text(d.cancellationPolicy || "Pending");
  room(160); y -= 25; heading("Your Holiday Consultant"); text(d.consultant || "JournAway team", 14, bold);
  text([d.phone, d.email, d.address, d.website].filter(Boolean).join("\n")); text("Thank you for choosing JournAway. Find your next adventure.", 10, bold);
  if ([d.coverPhoto, ...d.hotels.map(h => h.photo), ...d.days.map(day => day.photo)].includes("pangong")) {
    y -= 12; text("Photo credit: Pangong Lake, Ladakh, India 02 - Geet Arts / Wikimedia Commons. Cropped to fit. CC BY-SA 4.0 (photo).", 7, regular, muted);
    text("https://commons.wikimedia.org/wiki/File:Pangong_Lake,_Ladakh,_India_02.jpg\nhttps://creativecommons.org/licenses/by-sa/4.0/", 7, regular, muted);
  }
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 37 }, end: { x: W - M, y: 37 }, color: pale, thickness: .8 });
    p.drawText(`JOURNAWAY  |  ${confirmed ? "Confirmed itinerary" : "Draft - not confirmed"}`, { x: M, y: 23, size: 8, font: regular, color: muted });
    p.drawText(`${i + 1} / ${pages.length}`, { x: W - M - 35, y: 23, size: 8, font: regular, color: muted });
  });
  const bytes = await pdf.save();
  if (bytes.length > 4_000_000) throw new Error("The PDF exceeds 4 MB. Reduce the number or size of itinerary photos.");
  return Buffer.from(bytes);
}
