import type { MigrateUpArgs } from '@payloadcms/db-d1-sqlite'
import { sql } from '@payloadcms/db-d1-sqlite'

export async function tableExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${name}`,
  )
  return rows.length > 0
}

type RebuildTableOptions = {
  name: string
  createNew: string
  columns: string
  indexes?: string[]
}

/**
 * Rebuild a table so its foreign keys reference current parent tables.
 * Used after parent tables were swapped via DROP+RENAME, which leaves stale FK metadata in SQLite.
 */
export async function rebuildTable(
  db: MigrateUpArgs['db'],
  { name, createNew, columns, indexes = [] }: RebuildTableOptions,
): Promise<void> {
  if (!(await tableExists(db, name))) return

  const newName = `__new_${name}`
  await db.run(sql.raw(`DROP TABLE IF EXISTS \`${newName}\`;`))
  await db.run(sql.raw(createNew))
  await db.run(
    sql.raw(`INSERT INTO \`${newName}\` (${columns}) SELECT ${columns} FROM \`${name}\`;`),
  )
  await db.run(sql.raw(`DROP TABLE \`${name}\`;`))
  await db.run(sql.raw(`ALTER TABLE \`${newName}\` RENAME TO \`${name}\`;`))

  for (const indexSql of indexes) {
    const match = indexSql.match(/CREATE INDEX IF NOT EXISTS `([^`]+)`/)
    const indexName = match?.[1]
    if (indexName) {
      await db.run(sql.raw(`DROP INDEX IF EXISTS \`${indexName}\`;`))
    }
    await db.run(sql.raw(indexSql.replace(' IF NOT EXISTS', '')))
  }
}
