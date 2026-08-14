# JournAway

JournAway is a React/Vinext travel platform with a Node.js server, PostgreSQL database, Google sign-in, customer custom-trip requests, and protected admin, driver, and hotel-partner portals.

## Local development

Start these in two separate terminals:

```bash
npm run dev:backend   # API service: http://localhost:4000
npm run dev:frontend  # Website:     http://localhost:3000
```

Alternatively, from the `backend/` directory, run `npm run dev` to start the
backend service. The backend process owns the client-facing API gateway on
port 4000; the current App Router API handlers remain behind that gateway
during this transition. Do not run `npm run dev:backend` from inside
`backend/`.

The former local Cloudflare D1 state is not used by the self-hosted deployment. The Docker stack below is the authoritative local-production setup.

## Netlify deployment

The frontend is configured to build as Netlify server functions, including the
App Router API routes. In Netlify, import the repository and keep the build
settings from `netlify.toml` (base directory `frontend`; the configured build
installs the sibling backend dependencies before running `npm run build:netlify`).

Before the first deploy, create a managed PostgreSQL database and add its
connection string and the values from
`frontend/.env.netlify.example` to Netlify's environment variables. The local
Docker database, `localhost`, and the Compose hostname `db` cannot be used by
Netlify. Apply the Drizzle migrations to that cloud database before enabling
customer, admin, driver, or hotel-partner logins. Run the migration once from
a terminal with the cloud `DATABASE_URL` set:

```bash
npm --prefix backend run db:migrate
```

After Netlify gives the site a URL, add it to Google OAuth's authorised
JavaScript origins. Add `https://journaway.in` as well after the custom domain
is connected, then verify `journaway.in` in Resend before using the production
sender address.

## Docker deployment

Prerequisites: Docker Engine with Docker Compose, and ports `80` and `443` available on the server.

```bash
cp .env.example .env
# Edit .env with real credentials and allowed portal emails.
docker compose up -d db
docker compose run --rm migrate
docker compose up -d --build backend
docker compose up -d --build frontend caddy
```

Docker runs frontend and backend as independent Node services. Caddy sends website traffic to `frontend:3000` and `/api/*` traffic to `backend:4000`; either service can be restarted independently. PostgreSQL data is stored in the named `postgres_data` Docker volume.

For a staging server, set `JOURNAWAY_DOMAIN=staging.journaway.in` in `.env`; for production set it to `journaway.in`. Point that DNS hostname to the server before starting Caddy so it can issue HTTPS certificates.

## Production checklist

- Use a long unique `POSTGRES_PASSWORD` and keep `.env` private.
- Add the deployed HTTPS URL to Google OAuth Authorized JavaScript origins.
- Verify `journaway.in` in Resend and set a verified `EMAIL_FROM` sender.
- Set `JOURNAWAY_ENQUIRY_EMAILS` to the comma-separated email address(es) that should receive new custom-trip enquiries.
- Approve driver and hotel-partner access requests from the admin portal.
- Back up the `postgres_data` volume before upgrades.
