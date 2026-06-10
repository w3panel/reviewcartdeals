import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function columnExists(db: MigrateUpArgs['db'], column: string): Promise<boolean> {
  const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(products_variants)`)
  return columns.some((col) => col.name === column)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (await columnExists(db, 'original_price')) {
    return
  }

  await db.run(sql`ALTER TABLE \`products_variants\` ADD COLUMN \`original_price\` numeric;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  void db
}
