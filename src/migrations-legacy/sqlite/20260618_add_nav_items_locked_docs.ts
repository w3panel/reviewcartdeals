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
  if (!(await columnExists(db, 'payload_locked_documents_rels', 'nav_items_id'))) {
    await db.run(
      sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`nav_items_id\` integer REFERENCES nav_items(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`payload_locked_documents_rels_nav_items_id_idx\` ON \`payload_locked_documents_rels\` (\`nav_items_id\`);`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_nav_items_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`nav_items_id\`;`)
}
