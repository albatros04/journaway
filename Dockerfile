# Build the self-hosted Node.js application once, then run Vinext's standalone server.
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY backend/package.json backend/package-lock.json ./backend/
RUN npm ci --prefix frontend && npm ci --prefix backend

FROM dependencies AS build
WORKDIR /app
COPY . .
RUN npm run build --prefix frontend

# Migration image: it contains only the schema, generated PostgreSQL migrations,
# and Drizzle tooling needed at deploy time.
FROM dependencies AS migrate
WORKDIR /app
COPY backend ./backend
WORKDIR /app/backend
CMD ["npm", "run", "db:migrate"]

FROM node:22-alpine AS app
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
COPY --from=build /app/frontend/dist/standalone ./
EXPOSE 3000
CMD ["node", "server.js"]
