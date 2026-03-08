# Litter Pick

**Spot. Join. Clean.**

A community-powered web app that helps people report litter, identify hotspot areas through aggregated reports, and organise local volunteer cleanups. Built as a progressive web app (PWA) for Oxfordshire, UK — designed to scale nationally.

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Geospatial**: PostGIS for proximity queries and hotspot clustering
- **Maps**: MapLibre GL JS with MapTiler tiles
- **PWA**: Service worker + web manifest for installability
- **Email**: Resend (for notifications)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project (free tier works)
- A [MapTiler](https://www.maptiler.com) account (free tier provides enough for development)
- (Optional) A [Resend](https://resend.com) account for email notifications

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_MAPTILER_KEY` | MapTiler API key |
| `RESEND_API_KEY` | Resend API key (optional for MVP) |
| `NEXT_PUBLIC_APP_URL` | Your app URL (default: http://localhost:3000) |

### 3. Set up the database

1. Go to your Supabase dashboard → SQL Editor
2. Run the contents of `supabase/schema.sql`
3. This creates all tables, indexes, PostGIS functions, and RLS policies

### 4. Set up storage

In your Supabase dashboard:

1. Go to Storage → Create a new bucket called `photos`
2. Set it to **public**
3. Add a storage policy allowing public uploads (or use the commented SQL in schema.sql)

### 5. Generate PWA icons

The app includes an SVG icon at `public/icons/icon.svg`. To generate PNG icons:

```bash
# Using any image converter, create:
# public/icons/icon-192.png (192x192)
# public/icons/icon-512.png (512x512)
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── reports/       # Report submission + listing
│   │   ├── hotspots/      # Hotspot listing + detail
│   │   ├── volunteers/    # Signup + interest expression
│   │   ├── cleanups/      # Cleanup detail + completion
│   │   └── auth/          # Profile endpoint
│   ├── map/               # Heatmap view
│   ├── report/            # Litter report flow
│   ├── hotspot/[id]/      # Hotspot detail
│   ├── volunteer/         # Volunteer signup
│   ├── cleanup/[id]/      # Cleanup completion flow
│   ├── profile/           # User profile
│   ├── login/             # Login page
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI: Button, Card, Input, etc.
│   ├── map/               # HeatMap component (MapLibre GL)
│   ├── report/            # PhotoCapture, SeverityPicker
│   ├── hotspot/           # HotspotCard, VolunteerInterestButton
│   └── layout/            # Header, Footer
├── lib/
│   ├── supabase/          # Client, server, middleware helpers
│   ├── constants.ts       # App-wide constants
│   ├── utils.ts           # Utility functions
│   └── image.ts           # Image compression + geolocation
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types
```

## Features

### Implemented in MVP

1. **Public landing page** — explains the app, clear CTAs
2. **Heatmap view** — MapLibre heatmap layer showing litter density
3. **Anonymous litter reporting** — photo + location + severity in ~15 seconds
4. **Automatic hotspot generation** — PostGIS proximity clustering
5. **Hotspot detail pages** — stats, before/after photos, status
6. **Volunteer signup** — lightweight auth with Supabase
7. **Volunteer interest** — express interest in cleaning specific hotspots
8. **Cleanup formation** — auto-triggers when volunteer threshold is met
9. **Cleanup completion** — after photos, bag count, status updates
10. **User profile** — stats on cleanups joined/completed

### Hotspot Logic

Hotspots are automatically derived from reports using PostGIS:

- Reports within 300m of each other are grouped
- Score is calculated from severity weights (low=1, medium=2, bad=3)
- Minimum 2 reports needed to form a hotspot
- When 3+ volunteers express interest, status changes to "cleanup forming"
- After cleanup, status updates to "recently improved" or "cleaned"

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Other platforms

The app is a standard Next.js application and can be deployed anywhere that supports Node.js:
- Railway
- Fly.io
- AWS Amplify
- Self-hosted with `npm run build && npm start`

## License

MIT
