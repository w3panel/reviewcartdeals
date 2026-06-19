# ReviewCartDeals

Luxury product showcase and WhatsApp enquiry storefront built with **Next.js 16**, **Payload CMS 3**, **PostgreSQL**, and **Cloudflare R2** media storage. Deployed on **Vercel**.

## Stack

- **Frontend:** Next.js App Router, React 19, Tailwind CSS 4
- **CMS:** Payload 3 with draft/publish workflow
- **Database:** PostgreSQL (local Docker or Neon on Vercel)
- **Media:** R2 via `@payloadcms/storage-s3`
- **Enquiry flow:** Client-side cart → WhatsApp message (no checkout)

## Quick start

### 1. Prerequisites

- Node.js 22+
- [Bun](https://bun.sh)
- Docker (for local Postgres)

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` with your database URL, `PAYLOAD_SECRET`, and optional R2 credentials.

### 3. Database

```bash
bun run db:up
```

Or use the SQL helper as a superuser:

```bash
psql -U postgres -f scripts/setup-postgres.sql
```

### 4. Install & run

```bash
bun install
bun run dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

`predev` runs Payload migrations automatically.

## Scripts

| Command                     | Description                         |
| --------------------------- | ----------------------------------- |
| `bun run dev`               | Migrate + start dev server          |
| `bun run build`             | Prebuild slugs + production build   |
| `bun run check`             | Format, lint, typecheck, unit tests |
| `bun run test:e2e`          | Playwright E2E tests                |
| `bun run migrate`           | Run Payload migrations              |
| `bun run seed`              | Seed sample data                    |
| `bun run db:up` / `db:down` | Start/stop local Postgres           |

## Deployment (Vercel)

1. Connect the repo to Vercel
2. Set environment variables from `.env.example`
3. Use a **pooled** Postgres URL for `DATABASE_URI` and a **direct** URL for `DATABASE_URL_DIRECT`
4. Configure R2 credentials for media uploads
5. Deploy — `vercel.json` runs migrations before build

## Catalog & filters

Filtered and sorted catalog views live at `/search`. Query params:

- `q` — full-text search
- `category` — category slug
- `brand` — brand title (comma-separated for multiple)
- `sort` — `popular` | `newest` | `rating`
- `page` — pagination

Home page filters navigate to `/search` with the selected params.

## Collections

- Users, Media, Categories, Brands, Tags
- Products, Product Variants, Reviews
- Variant Groups, Variant Values, Nav Items

See [docs/variants.md](docs/variants.md) for the variant system overview.

## Testing

```bash
bun run check          # unit + lint + typecheck
bun run test:e2e       # Playwright (requires running app or CI setup)
```

## License

MIT
