import { randomUUID } from 'crypto'
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`products_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(sql`CREATE INDEX \`products_gallery_order_idx\` ON \`products_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_gallery_parent_id_idx\` ON \`products_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_gallery_image_idx\` ON \`products_gallery\` (\`image_id\`);`)

  const products = await db.all<{ id: number; main_image_id: number | null }>(
    sql`SELECT id, main_image_id FROM products`,
  )

  for (const product of products) {
    let order = 1
    const seen = new Set<number>()

    if (product.main_image_id) {
      await db.run(sql`
        INSERT INTO \`products_gallery\` (\`_order\`, \`_parent_id\`, \`id\`, \`image_id\`)
        VALUES (${order}, ${product.id}, ${randomUUID()}, ${product.main_image_id})
      `)
      seen.add(product.main_image_id)
      order++
    }

    const rels = await db.all<{ media_id: number }>(
      sql`SELECT media_id FROM products_rels WHERE parent_id = ${product.id} AND path = 'gallery' AND media_id IS NOT NULL ORDER BY "order" ASC, id ASC`,
    )

    for (const rel of rels) {
      if (seen.has(rel.media_id)) continue
      await db.run(sql`
        INSERT INTO \`products_gallery\` (\`_order\`, \`_parent_id\`, \`id\`, \`image_id\`)
        VALUES (${order}, ${product.id}, ${randomUUID()}, ${rel.media_id})
      `)
      seen.add(rel.media_id)
      order++
    }
  }

  await db.run(sql`DELETE FROM products_rels WHERE path = 'gallery'`)

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`brand_id\` integer NOT NULL,
  	\`category_id\` integer NOT NULL,
  	\`description\` text NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`limited_edition\` integer DEFAULT false,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`brand_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(sql`INSERT INTO \`__new_products\`("id", "title", "slug", "brand_id", "category_id", "description", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at") SELECT "id", "title", "slug", "brand_id", "category_id", "description", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at" FROM \`products\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`ALTER TABLE \`__new_products\` RENAME TO \`products\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_brand_idx\` ON \`products\` (\`brand_id\`);`)
  await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`products_gallery\`;`)
  void db
}
