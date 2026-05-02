# Kronos — Turkish History Timeline

An interactive, documentary-style historical timeline web application covering approximately 150 years of modern Turkish history. Built as a hybrid between Wikipedia's relational depth and a seamless continuous-scroll reading experience.

## Live

| URL | Purpose |
|-----|---------|
| `ybilgin.com` | Public-facing timeline site |
| `admin.ybilgin.com` | Payload CMS admin panel |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, `@tailwindcss/typography`, Framer Motion |
| CMS | Payload CMS v3 (embedded in Next.js) |
| Rich Text | Lexical editor with custom blocks and inline nodes |
| Database | PostgreSQL 16 |
| DevOps | Docker, Docker Compose, Nginx Proxy Manager |
| Deployment | Self-hosted Ubuntu Server (`ybilgin.com`) |

---

## Project Structure

```
kronos/
├── src/
│   ├── app/
│   │   ├── (frontend)/          # Public-facing pages
│   │   │   ├── page.tsx         # Hub — Era grid homepage
│   │   │   ├── donemler/
│   │   │   │   └── [era_slug]/  # Timeline Experience (3-column scroll)
│   │   │   └── kisiler/
│   │   │       └── [person_slug]/ # Person Wiki Profile
│   │   └── (payload)/           # Payload CMS admin & API routes
│   │       ├── admin/           # Auto-generated admin UI
│   │       └── api/             # REST & GraphQL endpoints
│   ├── collections/             # Payload CMS collection definitions
│   │   ├── Media.ts
│   │   ├── Users.ts
│   │   ├── Donemler.ts          # Eras (e.g. Tanzimat, WWI, Early Republic)
│   │   ├── Kisiler.ts           # Historical persons / encyclopedia entries
│   │   └── Olaylar.ts           # Events on the timeline
│   ├── blocks/                  # Custom Lexical block definitions
│   │   ├── QuoteBlock.ts
│   │   ├── ArchiveDocumentBlock.ts
│   │   ├── MapBlock.ts
│   │   ├── FootnoteBlock.ts
│   │   └── TimelineCalloutBlock.ts
│   ├── features/                # Custom Lexical inline node features
│   │   └── InlinePersonMentionFeature.ts
│   ├── components/              # Shared React components
│   │   ├── RichTextRenderer/    # Recursive Lexical AST renderer
│   │   └── PersonTooltip/       # Framer Motion hover popover
│   ├── lib/                     # Data fetching via Payload Local API
│   │   ├── payload.ts           # Payload singleton
│   │   └── data/
│   │       ├── eras.ts
│   │       ├── persons.ts
│   │       └── events.ts
│   ├── payload.config.ts        # Payload CMS configuration
│   └── payload-types.ts         # Auto-generated TypeScript types
├── docker-compose.yml           # Production deployment
├── docker-compose.dev.yml       # Local development (DB only)
├── Dockerfile                   # Multi-stage production build
└── .env.example                 # Environment variable reference
```

---

## Core Data Model

Three main entities with many-to-many relationships managed by Payload CMS:

```
Donemler (Eras)          Kisiler (Persons)         Olaylar (Events)
─────────────────        ──────────────────        ─────────────────
title                    full_name                 title
slug                     slug                      slug
start_year               birth_year                exact_date
end_year                 death_year                display_year
short_description        role (Select)             sort_order
cover_image ──────┐      title                     era ──────────── → Donemler
accent_color      │      portrait ─────────────┐   participants ─── → Kisiler[]
key_figures ──────┼──── → Kisiler[]            │   tags (Select[])
                  │                             │   content (Lexical)
                  └── Media ◄──────────────────┘
```

**Custom Lexical Blocks** (inside event/biography content):
- `QuoteBlock` — Historical quotes with person attribution
- `ArchiveDocumentBlock` — Scanned documents with transcriptions
- `MapBlock` — Location images and coordinates
- `FootnoteBlock` — Inline citations with generated bibliography
- `TimelineCalloutBlock` — Highlighted callout boxes
- `InlinePersonMention` — Inline person tags that trigger hover popovers

---

## UI Architecture

### The Three Views

**1. Hub (Home Page)**
A visual grid of Era cards with cover images, accent colors, and year ranges.

**2. Timeline Experience (Era Page)**
A 3-column layout:
- **Left** — Year Radar: fixed sidebar, highlights active year on scroll via IntersectionObserver
- **Center** — The Flow: events stacked chronologically with Sticky Year Headers
- **Right** — Era Actors: fixed panel of key historical figures with role badges

Events contain rich content rendered by the `RichTextRenderer` component. When an `InlinePersonMention` is encountered, a Framer Motion popover appears on hover — showing portrait, excerpt, and a "View Full Profile" link — without breaking the reading flow.

**3. Person Profile (Wiki Page)**
Portrait, life dates, role badge, full biography, and a chronological list of all events the person participated in.

---

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker Desktop

### 1. Clone and install

```bash
git clone https://github.com/Yigitalp02/turkish-timeline.git
cd turkish-timeline
pnpm install
```

### 2. Set up environment

```bash
cp .env.example .env
# .env is pre-configured for local Docker DB — no changes needed for dev
```

### 3. Start the database

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 4. Start the dev server

```bash
pnpm dev
```

- Frontend: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`

On first run, visit the admin URL and create your admin account. Payload will automatically run database migrations.

---

## Environment Variables

See `.env.example` for the full reference. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Secret key for Payload CMS (min 32 chars) |
| `NEXT_PUBLIC_SERVER_URL` | Public URL of the app (`http://localhost:3000` in dev) |

---

## Useful Commands

```bash
# Development
pnpm dev                          # Start dev server
pnpm build                        # Production build
pnpm start                        # Start production server

# Payload CMS
pnpm generate:types               # Regenerate TypeScript types from schema
pnpm generate:importmap           # Regenerate Payload import map

# Database (local dev)
docker compose -f docker-compose.dev.yml up -d    # Start DB
docker compose -f docker-compose.dev.yml down     # Stop DB
docker compose -f docker-compose.dev.yml down -v  # Stop DB + wipe data

# Linting
pnpm lint
```

---

## Production Deployment

Deployed on a self-hosted Ubuntu Server via Docker Compose and Nginx Proxy Manager.

### Server layout

```
/home/bilgin/kronos/
├── .env                  # Production environment variables
├── postgres/             # PostgreSQL data volume (bind mount)
└── media/                # Uploaded media files (bind mount)
```

### Deploy

```bash
# First time
git clone https://github.com/Yigitalp02/turkish-timeline.git /home/bilgin/kronos
cd /home/bilgin/kronos
cp .env.example .env     # Fill in production values
docker compose up -d

# Subsequent deploys
git pull origin main
docker compose build app
docker compose up -d --no-deps app
```

### Nginx Proxy Manager routing

| Domain | Target |
|--------|--------|
| `ybilgin.com` | `kronos_app:3000` |
| `admin.ybilgin.com` | `kronos_app:3000` (path rewrite to `/admin`) |

Both domains use Let's Encrypt SSL certificates managed by NPM.

---

## Nightly Backups

A cron job on the server dumps the database nightly at 2am:

```bash
0 2 * * * docker exec kronos_db pg_dump -U kronos_user kronos_db | gzip > /home/bilgin/backups/kronos/$(date +\%Y-\%m-\%d).sql.gz
```

---

## Roadmap

- [x] Phase 1 — Project scaffold (Payload v3 + Next.js + PostgreSQL)
- [ ] Phase 2 — Payload collections (Donemler, Kisiler, Olaylar, Media)
- [ ] Phase 3 — SEO and Search plugins
- [ ] Phase 4 — Custom Lexical blocks and InlinePersonMention feature
- [ ] Phase 5 — ISR revalidation hooks
- [ ] Phase 6 — Data fetching layer (Payload Local API)
- [ ] Phase 7 — Global layout and design system
- [ ] Phase 8 — Hub page (Era grid)
- [ ] Phase 9 — RichTextRenderer component
- [ ] Phase 10 — PersonTooltip popover
- [ ] Phase 11 — Timeline page (3-column Era view)
- [ ] Phase 12 — Person profile and index pages
- [ ] Phase 13 — Docker production build
- [ ] Phase 14 — CI/CD and server deployment scripts
- [ ] Phase 15 — SEO, performance, and polish
