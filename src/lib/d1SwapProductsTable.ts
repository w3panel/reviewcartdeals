import 'server-only'

import type { MigrateUpArgs } from '@payloadcms/db-d1-sqlite'
import { sql } from '@payloadcms/db-d1-sqlite'

async function tableExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${name}`,
  )
  return rows.length > 0
}

/**
 * Remote D1 migrations run each statement via a separate `wrangler d1 execute`
 * call, so PRAGMA foreign_keys does not persist and DROP TABLE `products` fails
 * when child tables reference it. Rename the old table aside, then promote
 * __new_products in one batched command.
 */
export async function swapProductsTable(db: MigrateUpArgs['db']): Promise<void> {
  if (await tableExists(db, '__products_swap_old')) {
    await db.run(
      sql.raw(
        `ALTER TABLE \`__products_swap_old\` RENAME TO \`__products_swap_archive_${Date.now()}\`;`,
      ),
    )
  }

  await db.run(
    sql.raw(
      'ALTER TABLE `products` RENAME TO `__products_swap_old`; ALTER TABLE `__new_products` RENAME TO `products`;',
    ),
  )
}
