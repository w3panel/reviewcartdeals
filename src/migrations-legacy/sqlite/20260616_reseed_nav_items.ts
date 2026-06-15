import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'
import { seedDefaultNavItems } from './shared/seedDefaultNavItems'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const existing = await db.all<{ count: number }>(sql`SELECT COUNT(*) as count FROM \`nav_items\``)
  const count = existing[0]?.count ?? 0

  if (count === 0) {
    await seedDefaultNavItems(db)
  }
}

export async function down(): Promise<void> {
  // Data-only seed; no schema changes to revert.
}
