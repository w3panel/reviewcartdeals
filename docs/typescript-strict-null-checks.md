# TypeScript strictNullChecks migration plan

The project currently has `strict: true` but `strictNullChecks: false` in [`tsconfig.json`](../tsconfig.json). Enabling strict null checks requires a dedicated migration — not a drive-by change in feature PRs.

## Why wait

Payload relationship fields (`Product['category']`, `brand`, media) are union types that become noisy under strict null checks. Cart display code also casts partial objects to full Payload types.

## Recommended steps

1. **Measure blast radius** — run on a branch:

   ```bash
   bunx tsgo --noEmit --strictNullChecks
   ```

   or temporarily set `"strictNullChecks": true` in `tsconfig.json`.

2. **Fix by domain**
   - `src/lib/**` — relationship helpers, filters, storage
   - `src/services/**` — data fetch return types
   - `src/components/**` — UI null guards
   - `src/context/**` — cart/liked display types

3. **Introduce narrow display types** — use `DisplayProduct` / `DisplayVariant` from [`clientStorage.ts`](../src/lib/clientStorage.ts) instead of casting to full `Product`.

4. **Add tests** for relationship edge cases before flipping the compiler flag.

5. **Enable the flag** only when error count is near zero and CI passes.

## Static generation limits

- `BUILD_STATIC_PRODUCT_LIMIT` (default 200) controls `generateStaticParams` prebuild slugs.
- Sitemap uses paginated queries via [`publishedSlugs.ts`](../src/lib/publishedSlugs.ts) and is not capped by the static build limit.
