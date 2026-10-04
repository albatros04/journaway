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
is connected. Configure a verified SMTP mailbox for the production sender
address before enabling live enquiry emails.

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
- Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and
  `SMTP_PASSWORD` for the mailbox that will send JournAway emails.
- Set `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`, and
  `ADMIN_NOTIFICATION_EMAIL`. The admin address receives every new enquiry
  and driver or hotel-partner access request.
- Set `PUBLIC_SITE_URL` to the deployed HTTPS address. Optionally set
  `DRIVER_PORTAL_URL` and `HOTEL_PARTNER_PORTAL_URL` when the portals use
  custom URLs.
- Set `FORM_RATE_LIMIT_SECRET` to a separate random value (at least 32 characters) to protect the public enquiry forms.
- Approve driver and hotel-partner access requests from the admin portal.
- Back up the `postgres_data` volume before upgrades.

## Trip confirmation PDFs

Both selected tours (`/request-package/[slug]`) and custom trips enter
**Admin → Trip requests & PDFs** (`/admin/custom-packages`). Customers must
sign in before submitting. The selected package name is read from the database.

1. Open **Edit itinerary / PDF** on a request.
2. Enter the final total and tax note, hotels/rooms/meals, transport, daily
   itinerary, inclusions/exclusions, JournAway policies and consultant contacts.
   Upload real hotel / Ladakh / Kashmir photos as needed. JPG/PNG uploads are
   compressed in the browser. The bundled destination photo is Pangong Lake.
3. Save, preview the PDF, tick the review checkbox, then **Confirm trip & email PDF**.
4. The customer receives the PDF attachment through the configured SMTP mailbox
   and can download it from **My trip requests** in their account.

The approved PDF and itinerary are saved in PostgreSQL and locked after
confirmation. A unique notification record prevents duplicate sends. If SMTP
fails, the admin can retry without regenerating or losing the approved PDF.
"Sent" means the SMTP server accepted it; it does not prove inbox delivery.
For an uncertain/pending delivery, check SMTP logs before manually resending.
Cancellation preserves the historical PDF but blocks new confirmation emails.

Before deploying this feature, apply migration `0006_thankful_absorbing_man`
to the same PostgreSQL database used by Netlify. With that database's
`DATABASE_URL` already set in your terminal, run from the repository root:

```bash
npm --prefix backend run db:migrate
```

No additional email environment variables are required. Keep the existing
SMTP credentials in Netlify Functions environment variables. The sample PDF
uses clearly marked demonstration pricing and policies; replace all such
details with the agreed real information in the admin editor.

Verification (isolated in-memory PostgreSQL, intercepted SMTP, no real emails):

```bash
npm --prefix frontend run test:trip-pdf
npm --prefix frontend run lint
```

The PDF test creates `output/pdf/journaway-itinerary-sample.pdf`. PDF rendering
uses bundled fonts, logo and photo data, so Netlify needs no Chromium binary,
Python service, remote image fetch or writable persistent filesystem. Asset
licenses and photo attribution are in `frontend/lib/trip-pdf-asset-credits.md`.
