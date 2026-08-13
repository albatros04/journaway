# JournAway

The project is organized by responsibility:

- `frontend/` — the JournAway website: pages, reusable UI components, styling, public images, and frontend tests.
- `backend/` — the Cloudflare Worker entry point, D1/Drizzle database code, migrations, and backend examples.

## Common commands

Run these from the project root:

```bash
npm run dev
npm run build
npm test
npm run db:generate
```

For frontend-only work, open `frontend/`. For database or worker work, open `backend/`.
