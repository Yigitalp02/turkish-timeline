################################################################################
# YAZIT — Multi-stage Dockerfile
#
# Stage 1  deps     Install all npm/pnpm dependencies (layer-cached).
# Stage 2  builder  Generate Payload types, run `next build` (standalone mode).
# Stage 3  runner   Minimal production image — only the standalone output.
#
# Build (from project root):
#   docker build -t yazit .
#
# The DATABASE_URL is NOT required at build time.  All generateStaticParams
# calls are wrapped in try/catch; pages are generated on-demand via ISR at
# runtime.  The DB only needs to be up when the container starts.
################################################################################

# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps

# Enable corepack so `pnpm` is available without a separate install step
RUN corepack enable

WORKDIR /app

# Copy manifest files only — changes to source code won't bust this layer
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (dev deps are needed for the build stage)
RUN pnpm install --frozen-lockfile

# ── Stage 2: Migration runner ────────────────────────────────────────────────
# Lightweight stage used by the `migrate` service in docker-compose.yml.
# Has pnpm + full source (needed by payload CLI) but skips the Next.js build.
FROM node:20-alpine AS migrator

RUN corepack enable

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NODE_ENV=development makes Payload's postgres adapter enable schema push/sync.
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["pnpm", "payload", "migrate:fresh", "--forceAcceptWarnings"]

# ── Stage 3: Build the application ───────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable

WORKDIR /app

# Inherit installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the full project source
COPY . .

# ── Build-time environment ────────────────────────────────────────────────────
# Disable Next.js anonymous telemetry in CI / Docker
ENV NEXT_TELEMETRY_DISABLED=1

# NODE_ENV must be production so `next build` produces an optimised output
ENV NODE_ENV=production

# Payload needs PAYLOAD_SECRET to be set (even if it's a placeholder) so the
# config can be imported without throwing.  The real secret is injected at
# runtime via docker-compose.yml.
ENV PAYLOAD_SECRET=build-time-placeholder-not-used-at-runtime

# DATABASE_URL placeholder keeps config validation happy.  No actual DB
# connection is made during the build (see safeStaticParams + force-dynamic).
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

# NEXT_PUBLIC_SERVER_URL defaults to localhost; override via --build-arg if
# you need absolute image URLs baked into the static HTML (optional).
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}

# payload-types.ts is pre-generated and committed to the repo.
# No need to regenerate it at build time (which requires tsx ESM resolution
# that conflicts with the bundler moduleResolution in tsconfig.json).

# Ensure public/ always exists (it may be empty if only public/media is present,
# which is excluded by .dockerignore — without this the runner COPY would fail)
RUN mkdir -p ./public

# ── Build Next.js in standalone mode ─────────────────────────────────────────
RUN pnpm build

# ── Stage 3: Minimal production runner ───────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone server reads these at startup
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user (security best practice)
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# ── Copy the standalone bundle ────────────────────────────────────────────────
# .next/standalone contains server.js + all required server-side packages.
# It does NOT include .next/static or public/ — those must be copied separately.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Static assets (JS chunks, CSS, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Public directory (favicon, fonts, OG images, robots.txt, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Ensure the media upload directory exists.
# At runtime it is bind-mounted from /home/bilgin/yazit/media via docker-compose.
RUN mkdir -p ./public/media && chown -R nextjs:nodejs ./public/media

USER nextjs

EXPOSE 3000

# server.js is the entrypoint produced by Next.js standalone output
CMD ["node", "server.js"]
