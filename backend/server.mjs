import http from "node:http";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "127.0.0.1";
// In development this is the website server. In Docker it resolves to the
// frontend service. Keeping this hop explicit means clients only ever call the
// separately started backend on port 4000 for API traffic.
const upstream = new URL(process.env.FRONTEND_INTERNAL_URL ?? "http://127.0.0.1:3000");

const server = http.createServer((request, response) => {
  if (!request.url?.startsWith("/api/")) {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Backend routes are available under /api only." }));
    return;
  }

  const target = new URL(request.url, upstream);
  const headers = { ...request.headers, host: upstream.host, "x-forwarded-host": request.headers.host ?? "" };
  delete headers.connection;
  const proxy = http.request(target, { method: request.method, headers }, upstreamResponse => {
    response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
    upstreamResponse.pipe(response);
  });
  proxy.on("error", error => {
    console.error("Backend API gateway error", error);
    if (!response.headersSent) response.writeHead(502, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "The frontend API handler is unavailable." }));
  });
  request.pipe(proxy);
});

server.listen(port, host, () => console.log(`JournAway backend gateway listening at http://${host}:${port}`));
