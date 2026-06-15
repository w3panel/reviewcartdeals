import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function tableExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${name}`,
  )
  return rows.length > 0
}

async function columnExists(db: MigrateUpArgs['db'], column: string): Promise<boolean> {
  const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(products_variants)`)
  return columns.some((col) => col.name === column)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (!(await tableExists(db, 'products_variants'))) return
  if (!(await columnExists(db, 'title'))) return

  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  await db.run(sql`CREATE TABLE \`__new_products_variants\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)

  await db.run(sql`
    INSERT INTO \`__new_products_variants\` (\`_order\`, \`_parent_id\`, \`id\`)
    SELECT \`_order\`, \`_parent_id\`, \`id\` FROM \`products_variants\`
  `)

  await db.run(sql`DROP TABLE \`products_variants\`;`)
  await db.run(sql`ALTER TABLE \`__new_products_variants\` RENAME TO \`products_variants\`;`)

  await db.run(
    sql`CREATE INDEX \`products_variants_order_idx\` ON \`products_variants\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`products_variants_parent_id_idx\` ON \`products_variants\` (\`_parent_id\`);`,
  )

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  if (!(await tableExists(db, 'products_variants'))) return
  if (await columnExists(db, 'title')) return

  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  await db.run(sql`CREATE TABLE \`__new_products_variants\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)

  await db.run(sql`
    INSERT INTO \`__new_products_variants\` (\`_order\`, \`_parent_id\`, \`id\`, \`title\`)
    SELECT \`_order\`, \`_parent_id\`, \`id\`, 'Variant' FROM \`products_variants\`
  `)

  await db.run(sql`DROP TABLE \`products_variants\`;`)
  await db.run(sql`ALTER TABLE \`__new_products_variants\` RENAME TO \`products_variants\`;`)

  await db.run(
    sql`CREATE INDEX \`products_variants_order_idx\` ON \`products_variants\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`products_variants_parent_id_idx\` ON \`products_variants\` (\`_parent_id\`);`,
  )

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
