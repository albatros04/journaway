import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the JournAway travel homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>JournAway \| Travel India, your way<\/title>/i);
  assert.match(html, /India, <em>your way\.<\/em>/i);
  assert.match(html, /Explore packages/);
  assert.match(html, /Leh Ladakh Explorer/);
  assert.match(html, /Travel &amp; Tour Planning/);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("keeps the travel system centralized and route-aware", async () => {
  const [styles, header, footer, data, routes] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../components/site-chrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/site-chrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/site-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/services/[service]/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(styles, /--bg:#f7f5f0/);
  assert.match(styles, /--forest:#1f4032/);
  assert.match(styles, /--terracotta:#d66a3a/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
  assert.match(styles, /@media \(max-width:720px\)/);
  assert.match(header, /aria-label="Main navigation"/);
  assert.match(footer, /Contact & location/);
  assert.match(data, /vehicle-rental/);
  assert.match(data, /group-travel/);
  assert.match(routes, /generateStaticParams/);
});
