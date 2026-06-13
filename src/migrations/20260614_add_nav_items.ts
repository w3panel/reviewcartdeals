import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function tableExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${name}`,
  )
  return rows.length > 0
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (await tableExists(db, 'nav_items')) {
    return
  }

  await db.run(sql`CREATE TABLE \`nav_items\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	\`placement\` text DEFAULT 'header' NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`sort_order\` numeric DEFAULT 0 NOT NULL,
  	\`open_in_new_tab\` integer DEFAULT false,
  	\`icon\` text DEFAULT 'none',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)

  await db.run(sql`CREATE INDEX \`nav_items_sort_order_idx\` ON \`nav_items\` (\`sort_order\`);`)
  await db.run(sql`CREATE INDEX \`nav_items_placement_idx\` ON \`nav_items\` (\`placement\`);`)
  await db.run(sql`CREATE INDEX \`nav_items_enabled_idx\` ON \`nav_items\` (\`enabled\`);`)
  await db.run(sql`CREATE INDEX \`nav_items_updated_at_idx\` ON \`nav_items\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`nav_items_created_at_idx\` ON \`nav_items\` (\`created_at\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`nav_items\`;`)
}
