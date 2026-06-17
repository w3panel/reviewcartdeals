# Performance Baseline

Captured at the start of the optimisation pass. Re-run the commands below after each phase to compare.

## How to measure

```bash
# Bundle analysis
bun run analyze

# Production build time and memory
/usr/bin/time -l bun run build

# Project checks
bun run check
```

For Lighthouse, run against:

- `/`
- `/search`
- `/category/<slug>`
- `/product/<slug>`

Record: LCP, FCP, CLS, INP/TBT, transferred JS, transferred image bytes, TTFB.

## Pre-optimisation observations

| Area            | Finding                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| Images          | `images.unoptimized: true` in `next.config.ts` — full-size R2/media URLs |
| Catalog queries | `depth: 2` with `specifications` on list views                           |
| Product page    | `getProductBySlug` called in both `generateMetadata` and page render     |
| Homepage        | `FrontPageCatalog` refetches catalog on mount with empty filters         |
| Fonts           | Google Fonts loaded via blocking CSS `@import`                           |
| Build           | `prebuild` runs migrations + slug fetch; 8 GB heap; `cpus: 1`            |
| Caching         | ISR `revalidate = 60` only; no tagged cache invalidation                 |
| Search          | `LIKE` queries on title/description                                      |
| Review stats    | Fetches all review rows and aggregates in JS                             |
| Client state    | Cart/liked persist full `Product` objects in localStorage                |

## Highest-cost routes (expected)

1. `/product/[slug]` — multiple Payload reads (product, variants, reviews, related)
2. `/` — parallel category/product/brand/review-stats fetches + client catalog refetch
3. `/api/products/catalog` — catalog query + review stats batch per request

## Vercel / infra checklist

- [ ] Postgres region matches Vercel deployment region
- [ ] Runtime uses pooled `DATABASE_URI` (not direct connection for serverless)
- [ ] Migrations use direct `DATABASE_URL` / non-pooled URL
- [ ] R2 media served via CDN custom domain with cache headers

## Post-optimisation targets

- LCP < 2.5s on mobile (4G)
- Build heap ≤ 4 GB where stable
- Product page ≤ 5 DB round-trips per request
- Catalog list JSON < 50 KB per 12 products
- No redundant homepage catalog fetch on hydration
