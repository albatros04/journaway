# JournAway

JournAway is a React/Vinext travel platform with a Node.js server, PostgreSQL database, Google sign-in, customer custom-trip requests, and protected admin, driver, and hotel-partner portals.

## Local development

```bash
npm run dev
```

The former local Cloudflare D1 state is not used by the self-hosted deployment. The Docker stack below is the authoritative local-production setup.

## Docker deployment

Prerequisites: Docker Engine with Docker Compose, and ports `80` and `443` available on the server.

```bash
cp .env.example .env
# Edit .env with real credentials and allowed portal emails.
docker compose up -d --build
```

Docker starts PostgreSQL, applies the generated PostgreSQL migration, starts the Node application, and places Caddy in front for automatic HTTPS. PostgreSQL data is stored in the named `postgres_data` Docker volume.

For a staging server, set `JOURNAWAY_DOMAIN=staging.journaway.in` in `.env`; for production set it to `journaway.in`. Point that DNS hostname to the server before starting Caddy so it can issue HTTPS certificates.

## Production checklist

- Use a long unique `POSTGRES_PASSWORD` and keep `.env` private.
- Add the deployed HTTPS URL to Google OAuth Authorized JavaScript origins.
- Verify `journaway.in` in Resend and set a verified `EMAIL_FROM` sender.
- Set actual admin, driver, and hotel partner emails in the portal allowlists.
- Back up the `postgres_data` volume before upgrades.
