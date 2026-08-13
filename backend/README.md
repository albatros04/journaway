# JournAway operations backend

The Cloudflare D1 schema is in `db/schema.ts`; its generated migration is in `drizzle/`.

## Setup

1. Install dependencies in both `frontend` and `backend`.
2. Keep `frontend/.openai/hosting.json` bound to D1 as `DB`.
3. Deploy the frontend build. The build packages `backend/drizzle` with the hosting metadata so the platform can apply the migration.
4. Set the production allowlists for admin, driver and hotel-partner emails before allowing anyone to use the portals.

Generate a new migration after a schema change:

```sh
cd backend
npm run db:generate
```

## Protected API ownership

- Drivers create/update only their own profile and read/update only trips assigned to it.
- Hotel partners create/manage only properties and rooms linked to their authenticated user ID, and see only bookings for those properties.
- Admin APIs create operational records, list profiles/properties, and can attach a hotel partner identity to a property.

No seed guest, booking, driver, room, or hotel data is included.
