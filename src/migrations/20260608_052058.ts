import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'
import { swapProductsTable } from '../lib/d1SwapProductsTable'

async function productsHasColumn(db: MigrateUpArgs['db'], column: string): Promise<boolean> {
  const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(products)`)
  return columns.some((col) => col.name === column)
}

async function tableExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${name}`,
  )
  return rows.length > 0
}

async function indexExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'index' AND name = ${name}`,
  )
  return rows.length > 0
}

async function ensureProductsIndexes(db: MigrateUpArgs['db']): Promise<void> {
  if (!(await indexExists(db, 'products_slug_idx'))) {
    await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  }
  if (!(await indexExists(db, 'products_brand_idx'))) {
    await db.run(sql`CREATE INDEX \`products_brand_idx\` ON \`products\` (\`brand_id\`);`)
  }
  if (!(await indexExists(db, 'products_category_idx'))) {
    await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  }
  if (!(await indexExists(db, 'products_main_image_idx'))) {
    await db.run(sql`CREATE INDEX \`products_main_image_idx\` ON \`products\` (\`main_image_id\`);`)
  }
  if (!(await indexExists(db, 'products_updated_at_idx'))) {
    await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  }
  if (!(await indexExists(db, 'products_created_at_idx'))) {
    await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  }
}

async function ensureProductsVariantsTable(db: MigrateUpArgs['db']): Promise<void> {
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
  );
  `)
  await db.run(sql`CREATE INDEX \`products_variants_order_idx\` ON \`products_variants\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_variants_parent_id_idx\` ON \`products_variants\` (\`_parent_id\`);`)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Clean up leftovers from a failed prior attempt on remote D1.
  await db.run(sql`DROP TABLE IF EXISTS \`__new_products\``)

  if (!(await productsHasColumn(db, 'main_image_id'))) {
    await db.run(sql`CREATE TABLE \`__new_products\` (
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`title\` text NOT NULL,
    	\`slug\` text NOT NULL,
    	\`brand_id\` integer NOT NULL,
    	\`category_id\` integer NOT NULL,
    	\`short_description\` text NOT NULL,
    	\`full_description\` text NOT NULL,
    	\`main_image_id\` integer,
    	\`featured\` integer DEFAULT false,
    	\`limited_edition\` integer DEFAULT false,
    	\`seo_title\` text,
    	\`seo_description\` text,
    	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    	FOREIGN KEY (\`brand_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`main_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
    );
    `)
    // Source schema (20260605_040917) uses image_id, not main_image_id, and has no limited_edition.
    await db.run(sql`INSERT INTO \`__new_products\`("id", "title", "slug", "brand_id", "category_id", "short_description", "full_description", "main_image_id", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at") SELECT "id", "title", "slug", "brand_id", "category_id", "short_description", "full_description", "image_id", "featured", 0, "seo_title", "seo_description", "updated_at", "created_at" FROM \`products\`;`)
    await swapProductsTable(db)
  }

  await ensureProductsIndexes(db)
  await ensureProductsVariantsTable(db)
  const categoryColumns = await db.all<{ name: string }>(sql`PRAGMA table_info(categories)`)
  if (!categoryColumns.some((col) => col.name === 'icon_id')) {
    await db.run(sql`ALTER TABLE \`categories\` ADD \`icon_id\` integer REFERENCES media(id);`)
    await db.run(sql`CREATE INDEX \`categories_icon_idx\` ON \`categories\` (\`icon_id\`);`)
  }

  const relsColumns = await db.all<{ name: string }>(sql`PRAGMA table_info(products_rels)`)
  if (!relsColumns.some((col) => col.name === 'media_id')) {
    await db.run(sql`ALTER TABLE \`products_rels\` ADD \`media_id\` integer REFERENCES media(id);`)
    await db.run(sql`CREATE INDEX \`products_rels_media_id_idx\` ON \`products_rels\` (\`media_id\`);`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`products_variants\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`brand_id\` integer NOT NULL,
  	\`short_description\` text NOT NULL,
  	\`full_description\` text NOT NULL,
  	\`image_id\` integer,
  	\`category_id\` integer NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`brand_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_products\`("id", "title", "slug", "brand_id", "short_description", "full_description", "image_id", "category_id", "featured", "seo_title", "seo_description", "updated_at", "created_at") SELECT "id", "title", "slug", "brand_id", "short_description", "full_description", "image_id", "category_id", "featured", "seo_title", "seo_description", "updated_at", "created_at" FROM \`products\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`ALTER TABLE \`__new_products\` RENAME TO \`products\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_brand_idx\` ON \`products\` (\`brand_id\`);`)
  await db.run(sql`CREATE INDEX \`products_image_idx\` ON \`products\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`description\` text,
  	\`featured\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_categories\`("id", "title", "slug", "image_id", "description", "featured", "updated_at", "created_at") SELECT "id", "title", "slug", "image_id", "description", "featured", "updated_at", "created_at" FROM \`categories\`;`)
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`ALTER TABLE \`__new_categories\` RENAME TO \`categories\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_slug_idx\` ON \`categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`categories_image_idx\` ON \`categories\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_products_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_products_rels\`("id", "order", "parent_id", "path", "tags_id") SELECT "id", "order", "parent_id", "path", "tags_id" FROM \`products_rels\`;`)
  await db.run(sql`DROP TABLE \`products_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_products_rels\` RENAME TO \`products_rels\`;`)
  await db.run(sql`CREATE INDEX \`products_rels_order_idx\` ON \`products_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_parent_idx\` ON \`products_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_path_idx\` ON \`products_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_tags_id_idx\` ON \`products_rels\` (\`tags_id\`);`)
}
