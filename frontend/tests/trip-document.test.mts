import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import nodemailer from "nodemailer";
import { PDFDocument } from "pdf-lib";
import { pg, db, identity } from "./trip-test-context.js";
import { customers, customPackages, emailNotifications, tourPackages } from "../../backend/db/schema.js";
import { emptyTripDocument, parseTripDocument, confirmationErrors } from "../lib/trip-document.js";
import { generateTripPdf } from "../lib/trip-pdf.js";

const trip = { id: "sample-trip", name: "Ladakh lakes and valleys", destinationSlug: "ladakh", travelStartDate: "2027-06-10", travelEndDate: "2027-06-16", adults: 2, children: 1 };
const details = { ...emptyTripDocument(trip), totalInr: 54000, taxNote: "Sample price only - taxes included", consultant: "Sample travel consultant", phone: "+91 00000 00000", email: "sample@example.test", address: "Sample office address - replace before use", inclusions: "Accommodation and meals as listed.\nPrivate transfers as agreed.", exclusions: "Flights and personal expenses.", terms: "SAMPLE TERMS - The admin must enter JournAway's approved terms before confirming a real trip.", paymentTerms: "SAMPLE PAYMENT TERMS - replace with your agreed schedule.", cancellationPolicy: "SAMPLE CANCELLATION POLICY - replace before use.", vehicle: "Sample private vehicle", specialInclusions: "Guided lake visit (sample)", hotels: [{ name: "Sample Ladakh Hotel", location: "Leh", checkIn: "2027-06-10", nights: 6, category: "Sample category", rooms: "1 room, 2 adults and 1 child", meals: "Breakfast + dinner", photo: "" }], days: Array.from({ length: 7 }, (_, i) => ({ title: ["Arrival in Leh", "Leh sightseeing", "Journey to Nubra", "Explore Nubra Valley", "Pangong Lake", "Return to Leh", "Departure"][i], description: "Sample itinerary for layout review. The JournAway team will replace this text with the agreed activities, travel times and practical details for the customer's trip.", transport: `Sample route for day ${i + 1}`, photo: i === 4 ? "pangong" : "" })) };

test("PDF validation and multipage rendering", async () => {
  assert.deepEqual(confirmationErrors(parseTripDocument(details), trip), []);
  assert.ok(confirmationErrors({ ...details, totalInr: 0 }, trip).length);
  assert.ok(confirmationErrors({ ...details, days: details.days.slice(1) }, trip).length);
  assert.throws(() => parseTripDocument({ ...details, coverPhoto: "http://127.0.0.1/secrets" }));
  assert.throws(() => parseTripDocument({ ...details, totalInr: -1 }));
  const bytes = await generateTripPdf({ trip, customerName: "Sample Traveller", details, confirmed: false });
  const pdf = await PDFDocument.load(bytes); assert.ok(pdf.getPageCount() >= 4); assert.ok(bytes.length < 4_000_000);
  await mkdir(resolve("../output/pdf"), { recursive: true }); await writeFile(resolve("../output/pdf/journaway-itinerary-sample.pdf"), bytes);
  const long = { ...details, terms: "Long policy sentence to test pagination and readable wrapping. ".repeat(120) };
  const longPdf = await PDFDocument.load(await generateTripPdf({ trip, customerName: "Zoë Khan", details: long, confirmed: true }));
  assert.ok(longPdf.getPageCount() > pdf.getPageCount());
});

test("Actual API workflow with isolated PostgreSQL and captured SMTP", async t => {
  const migrationDir = resolve("../backend/drizzle-postgres");
  for (const file of (await readdir(migrationDir)).filter(x => x.endsWith(".sql")).sort()) await pg.exec((await readFile(resolve(migrationDir, file), "utf8")).replaceAll("--> statement-breakpoint", ""));
  await db.insert(customers).values([{ id: "customer-one", email: "one@example.test", displayName: "Customer One" }, { id: "customer-two", email: "two@example.test", displayName: "Customer Two" }]);
  await db.insert(customPackages).values({ ...trip, customerId: "customer-one", status: "submitted" });
  const captured: { to?: unknown; attachments?: { content?: unknown }[] }[] = []; let smtpFailure = false;
  nodemailer.createTransport = (() => ({ sendMail: async (mail: typeof captured[number]) => { if (smtpFailure) throw Object.assign(new Error("Test authentication failure"), { code: "EAUTH" }); captured.push(mail); return { messageId: "test-message" }; } })) as unknown as typeof nodemailer.createTransport;
  Object.assign(process.env, { MAIL_FROM_ADDRESS: "sender@example.test", SMTP_HOST: "smtp.example.test", SMTP_USER: "test-user", SMTP_PASSWORD: "test-password", ADMIN_NOTIFICATION_EMAIL: "admin@example.test" });
  const contextUrl = pathToFileURL(resolve("tests/trip-test-context.ts")).href;
  async function route(entry: string, name: string) {
    const output = resolve(`.test-artifacts/${name}.mjs`);
    await build({ entryPoints: [entry], outfile: output, bundle: true, platform: "node", format: "esm", packages: "external", tsconfig: "tsconfig.json", plugins: [{ name: "isolated-database-and-identity", setup(b) {
      b.onResolve({ filter: /^(?:@\/lib\/|\.\/)(operations-api|customer-auth)$/ }, args => ({ path: args.path, namespace: "test-adapter" }));
      b.onResolve({ filter: /^file:/ }, args => ({ path: args.path, external: true }));
      b.onLoad({ filter: /.*/, namespace: "test-adapter" }, async args => {
        if (args.path.endsWith("customer-auth")) return { contents: `export {getCustomerUser} from ${JSON.stringify(contextUrl)};`, loader: "ts" };
        const source = await readFile("lib/operations-api.ts", "utf8");
        const helpers = source.slice(source.indexOf("export function isErrorResponse"), source.indexOf("export function getOperationsDb"));
        return { contents: `export {getOperationsDb, requireApiActor} from ${JSON.stringify(contextUrl)};\n${helpers}`, loader: "ts" };
      });
    } }] });
    return import(pathToFileURL(output).href);
  }
  const admin = await route("app/api/admin/custom-packages/[packageId]/document/route.ts", "admin-document");
  const download = await route("app/api/custom-packages/[packageId]/document/route.ts", "customer-document");
  const legacy = await route("app/api/admin/custom-packages/[packageId]/route.ts", "legacy-status");
  const ctx = { params: Promise.resolve({ packageId: trip.id }) };
  const req = (method = "GET", body?: unknown, suffix = "") => new Request(`http://localhost/api/admin/custom-packages/${trip.id}/document${suffix}`, { method, ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}) });
  await t.test("admin routes require authentication", async () => { identity.admin = false; assert.equal((await admin.GET(req(), ctx)).status, 401); assert.equal((await admin.PUT(req("PUT", {}), ctx)).status, 401); assert.equal((await admin.POST(req("POST", {}), ctx)).status, 401); identity.admin = true; });
  let revision = 1;
  await t.test("incomplete and stale drafts cannot be confirmed", async () => { await admin.GET(req(), ctx); assert.equal((await admin.POST(req("POST", { action: "confirm", revision }), ctx)).status, 400); const saved = await admin.PUT(req("PUT", { revision, details }), ctx); assert.equal(saved.status, 200); revision = (await saved.json()).document.revision; assert.equal((await admin.PUT(req("PUT", { revision: 1, details }), ctx)).status, 409); assert.equal((await legacy.PATCH(req("PATCH", { status: "confirmed" }), ctx)).status, 400); assert.equal(captured.length, 0); });
  await t.test("preview returns PDF without sending email", async () => { const r = await admin.GET(req("GET", undefined, "?pdf=1"), ctx); assert.equal(r.status, 200); assert.equal(r.headers.get("content-type"), "application/pdf"); assert.ok((await r.arrayBuffer()).byteLength > 1000); assert.equal(captured.length, 0); });
  await t.test("concurrent confirmations attach the PDF once", async () => { const replies = await Promise.all([admin.POST(req("POST", { action: "confirm", revision }), ctx), admin.POST(req("POST", { action: "confirm", revision }), ctx)]); assert.ok(replies.some(r => r.status === 200)); assert.equal(captured.length, 1); assert.equal(captured[0].to, "one@example.test"); assert.ok(Buffer.isBuffer(captured[0].attachments?.[0].content)); const result = await admin.POST(req("POST", { action: "retry" }), ctx); assert.equal((await result.json()).delivery, "sent"); assert.equal(captured.length, 1); });
  await t.test("snapshot is immutable and downloadable only by its owner", async () => { assert.equal((await admin.PUT(req("PUT", { revision, details }), ctx)).status, 409); identity.customerId = "customer-two"; assert.equal((await download.GET(req(), ctx)).status, 404); identity.customerId = null; assert.equal((await download.GET(req(), ctx)).status, 401); identity.customerId = "customer-one"; const r = await download.GET(req(), ctx); assert.equal(r.status, 200); assert.deepEqual(Buffer.from(await r.arrayBuffer()), captured[0].attachments?.[0].content); });
  await t.test("SMTP failure preserves the confirmed PDF and retry succeeds once", async () => {
    const other = { ...trip, id: "retry-trip" }; await db.insert(customPackages).values({ ...other, customerId: "customer-one", status: "submitted" }); const c = { params: Promise.resolve({ packageId: other.id }) }; await admin.GET(req(), c); await admin.PUT(req("PUT", { revision: 1, details }), c); smtpFailure = true;
    const failure = await admin.POST(req("POST", { action: "confirm", revision: 2 }), c); const failed = await failure.json(); assert.equal(failed.confirmed, true); assert.equal(failed.delivery, "failed"); assert.equal((await download.GET(req(), c)).status, 200); smtpFailure = false;
    await Promise.all([admin.POST(req("POST", { action: "retry" }), c), admin.POST(req("POST", { action: "retry" }), c)]); assert.equal(captured.length, 2);
    const ledger = await db.select().from(emailNotifications); assert.equal(ledger.filter(n => n.status === "sent").length, 2);
  });
  await t.test("selected packages and custom requests enter the same private trip queue", async () => {
    const requests = await route("app/api/custom-packages/route.ts", "trip-request");
    const body = { travelStartDate: trip.travelStartDate, travelEndDate: trip.travelEndDate, adults: 2, children: 0, experiences: [], destinationSlug: "ladakh", name: "Custom holiday" };
    identity.customerId = null; assert.equal((await requests.POST(req("POST", body))).status, 401); identity.customerId = "customer-one";
    await db.insert(tourPackages).values({ id: "published-tour", slug: "selected-ladakh", name: "Published Ladakh package", destination: "Ladakh", duration: "7D / 6N", priceInr: 42000, description: "A published package", imageKey: "pangong-lake", status: "published", createdByUserId: "admin", updatedByUserId: "admin" });
    const selected = await requests.POST(req("POST", { ...body, sourcePackageSlug: "selected-ladakh", name: "Forged title", customerId: "customer-two" })); assert.equal(selected.status, 201); const result = await selected.json(); assert.equal(result.package.sourcePackageSlug, "selected-ladakh"); assert.equal(result.package.name, "Published Ladakh package"); assert.equal(result.package.customerId, "customer-one");
    const custom = await requests.POST(req("POST", body)); assert.equal(custom.status, 201); assert.equal((await custom.json()).package.sourcePackageSlug, null);
    const mine = await (await requests.GET()).json(); assert.equal(mine.packages.find((p: { id: string }) => p.id === trip.id).hasPdf, true); assert.equal(mine.packages.find((p: { id: string }) => p.id === result.package.id).hasPdf, false);
    assert.equal((await requests.POST(req("POST", { ...body, sourcePackageSlug: "not-published" }))).status, 404);
  });
  await t.test("cancelled trips cannot be confirmed or resent", async () => { assert.equal((await legacy.PATCH(req("PATCH", { status: "cancelled" }), ctx)).status, 200); assert.equal((await admin.POST(req("POST", { action: "retry" }), ctx)).status, 409); });
  await pg.close();
});
