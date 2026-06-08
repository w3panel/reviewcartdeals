import type { MigrateUpArgs } from '@payloadcms/db-d1-sqlite'
import { sql } from '@payloadcms/db-d1-sqlite'

/**
 * Remote D1 migrations run each statement via a separate `wrangler d1 execute`
 * call, so PRAGMA foreign_keys does not persist across db.run invocations.
 * Batch the drop + rename in one command instead.
 */
export async function swapProductsTable(db: MigrateUpArgs['db']): Promise<void> {
  await db.run(
    sql.raw(
      'PRAGMA foreign_keys=OFF; DROP TABLE `products`; ALTER TABLE `__new_products` RENAME TO `products`; PRAGMA foreign_keys=ON;',
    ),
  )
}
