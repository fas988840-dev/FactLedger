# FactLedger API - multi-stage build.
# Works as-is on Railway, Render, Fly.io, or any Docker host: they all
# build this image from the repo root and run it, no extra config needed
# beyond the environment variables in .env.example.

FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
# Pin npm to the version that generated package-lock.json. npm 10, bundled with
# older Node images, rejects that lockfile ("Missing: utf-8-validate@5.0.10 from lock
# file") and fails the build. The same pin is used in .github/workflows/ci.yml.
RUN npm install -g npm@11 --no-audit --no-fund && npm ci --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Same npm pin as the build stage, for the production-only install.
RUN npm install -g npm@11 --no-audit --no-fund && npm ci --omit=dev --no-audit --no-fund
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
