import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function productsHasColumn(db: MigrateUpArgs['db'], column: string): Promise<boolean> {
  const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(products)`)
  return columns.some((col) => col.name === column)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if ((await productsHasColumn(db, 'description')) && !(await productsHasColumn(db, 'short_description'))) {
    return
  }

  await db.run(sql`DROP TABLE IF EXISTS \`__new_products\``)

  if (!(await productsHasColumn(db, 'description'))) {
    await db.run(sql`ALTER TABLE \`products\` ADD \`description\` text;`)
    await db.run(sql`
      UPDATE \`products\`
      SET \`description\` = CASE
        WHEN \`full_description\` IS NOT NULL AND trim(\`full_description\`) != '' THEN \`full_description\`
        ELSE \`short_description\`
      END
    `)
  }

  if (!(await productsHasColumn(db, 'short_description'))) {
    return
  }

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`brand_id\` integer NOT NULL,
  	\`category_id\` integer NOT NULL,
  	\`description\` text NOT NULL,
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
  );`)
  await db.run(sql`INSERT INTO \`__new_products\`("id", "title", "slug", "brand_id", "category_id", "description", "main_image_id", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at") SELECT "id", "title", "slug", "brand_id", "category_id", COALESCE("description", ''), "main_image_id", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at" FROM \`products\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`ALTER TABLE \`__new_products\` RENAME TO \`products\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_brand_idx\` ON \`products\` (\`brand_id\`);`)
  await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`products_main_image_idx\` ON \`products\` (\`main_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
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
  );`)
  await db.run(sql`INSERT INTO \`__new_products\`("id", "title", "slug", "brand_id", "category_id", "short_description", "full_description", "main_image_id", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at") SELECT "id", "title", "slug", "brand_id", "category_id", substr("description", 1, 200), "description", "main_image_id", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at" FROM \`products\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`ALTER TABLE \`__new_products\` RENAME TO \`products\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_brand_idx\` ON \`products\` (\`brand_id\`);`)
  await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`products_main_image_idx\` ON \`products\` (\`main_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
}
