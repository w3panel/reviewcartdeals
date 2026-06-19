# Performance environment variables

Use these in production (Vercel) and local `.env` as needed.

## Database

| Variable                                                        | Purpose                                                               |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| `DATABASE_URI`                                                  | **Runtime** pooled Postgres URL for app traffic (e.g. Neon pooler)    |
| `DATABASE_URI_POSTGRES_URL`                                     | Alias used by electrofit-style setups                                 |
| `POSTGRES_URL`                                                  | Neon Vercel integration pooled URL (auto-provisioned)                 |
| `DATABASE_URL`                                                  | Fallback if none of the above are set                                 |
| `DATABASE_URL_DIRECT`                                           | **Migrations** non-pooled URL (used by Payload CLI)                   |
| `POSTGRES_URL_NON_POOLING`                                      | Neon Vercel integration direct URL for migrations                     |
| `PG_POOL_MAX` / `DATABASE_POOL_MAX`                             | Max pool connections per serverless instance (default: `3` on Vercel) |
| `PG_POOL_CONNECTION_TIMEOUT_MS` / `DATABASE_CONNECT_TIMEOUT_MS` | TCP connect timeout in ms (default: `20000` on Vercel)                |

Keep Postgres in the same region as your Vercel deployment (your Neon host is `ap-southeast-1` — set Vercel Functions region to **Singapore / sin1**). Use Neon’s **pooled** URL (`-pooler` host) for runtime and the **direct** URL for `DATABASE_URL_DIRECT`. Do not add `channel_binding=require` — it breaks node-pg on serverless.

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
