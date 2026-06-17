# Performance environment variables

Use these in production (Vercel) and local `.env` as needed.

## Database

| Variable              | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `DATABASE_URI`        | **Runtime** pooled Postgres URL for app traffic (e.g. Neon pooler) |
| `DATABASE_URL`        | Fallback if `DATABASE_URI` is unset                                |
| `DATABASE_URL_DIRECT` | **Migrations** non-pooled URL (used by Payload CLI)                |
| `DATABASE_POOL_MAX`   | Max pool connections per serverless instance (default: `1`)        |

Keep Postgres in the same region as your Vercel deployment.

## Images

| Variable                     | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_IMAGE_CDN_HOST` | Cloudflare zone hostname for Image Resizing loader (optional) |

When unset, Next.js default image optimization is used for allowed remote patterns.

## Build

| Variable                      | Purpose                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `BUILD_STATIC_PRODUCT_LIMIT`  | Max product pages pre-rendered at build (default: `200`)  |
| `BUILD_STATIC_CATEGORY_LIMIT` | Max category pages pre-rendered at build (default: `200`) |
| `BUILD_CPUS`                  | Next.js build CPU limit (default: `1`)                    |
| `BUILD_STATIC_CONCURRENCY`    | Static generation concurrency (default: `1`)              |

## Observability

| Variable        | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `SLOW_QUERY_MS` | Log Payload reads slower than this threshold (default: `500`) |

## Deploy commands

- **Vercel production build:** `bun run prebuild:with-migrate && bun run build` (migrations + slugs + build)
- **Local preview build:** `bun run prebuild && bun run build` (slugs only, no migrations)
- **Production migration only:** `bun run migrate:production`
