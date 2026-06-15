import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function tableExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${name}`,
  )
  return rows.length > 0
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (await tableExists(db, 'products_variants')) {
    return
  }

  await db.run(sql`CREATE TABLE \`products_variants\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`sku\` text,
  	\`color\` text,
  	\`size\` text,
  	\`material\` text,
  	\`price\` numeric,
  	\`stock\` numeric DEFAULT 0,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)

  await db.run(
    sql`CREATE INDEX \`products_variants_order_idx\` ON \`products_variants\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`products_variants_parent_id_idx\` ON \`products_variants\` (\`_parent_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`products_variants\`;`)
}
