import vinext from "vinext";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  // Nitro creates Netlify Functions for SSR and App Router API routes during
  // a Netlify build, while local development continues to use Vinext directly.
  plugins: [
    vinext(),
    ...(process.env.NITRO_PRESET === "netlify" ? [nitro()] : []),
  ],
  // `frontend` is intentionally a distinct mode so it can be run independently
  // from the port-4000 backend gateway. API route compatibility remains local
  // to the App Router in development; Caddy owns `/api` routing in Docker.
  server: mode === "frontend" ? {} : undefined,
}));
