import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function columnExists(
  db: MigrateUpArgs['db'],
  table: string,
  column: string,
): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM pragma_table_info(${table}) WHERE name = ${column}`,
  )
  return rows.length > 0
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (!(await columnExists(db, 'variant_types', 'shared_across_variants'))) {
    await db.run(
      sql`ALTER TABLE \`variant_types\` ADD COLUMN \`shared_across_variants\` integer DEFAULT 0;`,
    )
  }

  if (!(await columnExists(db, '_variant_types_v', 'version_shared_across_variants'))) {
    await db.run(
      sql`ALTER TABLE \`_variant_types_v\` ADD COLUMN \`version_shared_across_variants\` integer;`,
    )
  }

  await db.run(
    sql`UPDATE \`variant_types\` SET \`shared_across_variants\` = 1 WHERE lower(\`name\`) = 'size';`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // SQLite cannot drop columns without a table rebuild; leave columns in place.
}
