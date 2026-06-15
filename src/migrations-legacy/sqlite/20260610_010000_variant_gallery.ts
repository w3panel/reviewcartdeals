import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function tableExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${name}`,
  )
  return rows.length > 0
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (await tableExists(db, 'products_variants_gallery')) {
    return
  }

  await db.run(sql`CREATE TABLE \`products_variants_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)

  await db.run(
    sql`CREATE INDEX \`products_variants_gallery_order_idx\` ON \`products_variants_gallery\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`products_variants_gallery_parent_id_idx\` ON \`products_variants_gallery\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`products_variants_gallery_image_idx\` ON \`products_variants_gallery\` (\`image_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`products_variants_gallery\`;`)
}
