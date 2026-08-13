import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

async function render(path = "/") {
  const port = 3100 + (process.pid % 400);
  const serverPath = new URL("../dist/standalone/server.js", import.meta.url);
  const child = spawn(process.execPath, [fileURLToPath(serverPath)], { env: { ...process.env, HOST: "127.0.0.1", NODE_ENV: "production", PORT: String(port) }, stdio: "ignore" });
  try {
    let lastError;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try { return await fetch(`http://127.0.0.1:${port}${path}`, { headers: { accept: "text/html" } }); }
      catch (error) { lastError = error; await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    throw lastError;
  } finally { child.kill(); }
}

test("server-renders the JournAway travel homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>JournAway \| Travel India, your way<\/title>/i);
  assert.match(html, /Find your next/i);
  assert.match(html, /Explore tours/);
  assert.match(html, /journaway-logo-transparent\.png/);
  assert.match(html, /Leh Ladakh Explorer/);
  assert.match(html, /Need a ride for the journey/);
  assert.match(html, /Travel service/);
  assert.match(html, /Hotels/);
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
  assert.match(styles, /--bg:#f6f4ec/);
  assert.match(styles, /--forest:#163a2b/);
  assert.match(styles, /--terracotta:#d66a3a/);
  assert.match(styles, /--green:#2f6b4f/);
  assert.match(styles, /--sage:#91a98d/);
  assert.match(styles, /--mint:#dde9df/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
  assert.match(styles, /@media \(max-width:720px\)/);
  assert.match(header, /aria-label="Main navigation"/);
  assert.match(footer, /Contact & location/);
  assert.match(data, /vehicle-rental/);
  assert.match(data, /group-travel/);
  assert.match(routes, /generateStaticParams/);
  assert.match(data, /\/hotels/);
});
