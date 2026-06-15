import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'
import { swapProductsTable } from '../lib/d1SwapProductsTable'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`__new_categories\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`image_id\` integer,
  	\`icon_id\` integer,
  	\`description\` text,
  	\`featured\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_categories\`("id", "title", "slug", "image_id", "icon_id", "description", "featured", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "image_id", "icon_id", "description", "featured", "updated_at", "created_at", "_status" FROM \`categories\`;`,
  )
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`ALTER TABLE \`__new_categories\` RENAME TO \`categories\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`DROP INDEX IF EXISTS \`categories_slug_idx\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_slug_idx\` ON \`categories\` (\`slug\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`categories_image_idx\`;`)
  await db.run(sql`CREATE INDEX \`categories_image_idx\` ON \`categories\` (\`image_id\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`categories_icon_idx\`;`)
  await db.run(sql`CREATE INDEX \`categories_icon_idx\` ON \`categories\` (\`icon_id\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`categories_featured_idx\`;`)
  await db.run(sql`CREATE INDEX \`categories_featured_idx\` ON \`categories\` (\`featured\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`categories_updated_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`categories_created_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`categories__status_idx\`;`)
  await db.run(sql`CREATE INDEX \`categories__status_idx\` ON \`categories\` (\`_status\`);`)
  await db.run(sql`DROP TABLE IF EXISTS \`__new_brands\`;`)
  await db.run(sql`CREATE TABLE \`__new_brands\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`image_id\` integer,
  	\`description\` text,
  	\`verified\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_brands\`("id", "title", "slug", "image_id", "description", "verified", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "image_id", "description", "verified", "updated_at", "created_at", "_status" FROM \`brands\`;`,
  )
  await db.run(sql`DROP TABLE \`brands\`;`)
  await db.run(sql`ALTER TABLE \`__new_brands\` RENAME TO \`brands\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`brands_title_idx\`;`)
  await db.run(sql`CREATE INDEX \`brands_title_idx\` ON \`brands\` (\`title\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`brands_slug_idx\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`brands_slug_idx\` ON \`brands\` (\`slug\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`brands_image_idx\`;`)
  await db.run(sql`CREATE INDEX \`brands_image_idx\` ON \`brands\` (\`image_id\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`brands_updated_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`brands_updated_at_idx\` ON \`brands\` (\`updated_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`brands_created_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`brands_created_at_idx\` ON \`brands\` (\`created_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`brands__status_idx\`;`)
  await db.run(sql`CREATE INDEX \`brands__status_idx\` ON \`brands\` (\`_status\`);`)
  await db.run(sql`DROP TABLE IF EXISTS \`__new_tags\`;`)
  await db.run(sql`CREATE TABLE \`__new_tags\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_tags\`("id", "title", "slug", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "updated_at", "created_at", "_status" FROM \`tags\`;`,
  )
  await db.run(sql`DROP TABLE \`tags\`;`)
  await db.run(sql`ALTER TABLE \`__new_tags\` RENAME TO \`tags\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`tags_slug_idx\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`tags_slug_idx\` ON \`tags\` (\`slug\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`tags_updated_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`tags_updated_at_idx\` ON \`tags\` (\`updated_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`tags_created_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`tags_created_at_idx\` ON \`tags\` (\`created_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`tags__status_idx\`;`)
  await db.run(sql`CREATE INDEX \`tags__status_idx\` ON \`tags\` (\`_status\`);`)
  await db.run(sql`DROP TABLE IF EXISTS \`__new_products\`;`)
  await db.run(sql`CREATE TABLE \`__new_products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`brand_id\` integer,
  	\`description\` text,
  	\`category_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`limited_edition\` integer DEFAULT false,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`brand_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_products\`("id", "title", "slug", "brand_id", "description", "category_id", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "brand_id", "description", "category_id", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at", "_status" FROM \`products\`;`,
  )
  await swapProductsTable(db)
  await db.run(sql`DROP INDEX IF EXISTS \`products_slug_idx\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`products_brand_idx\`;`)
  await db.run(sql`CREATE INDEX \`products_brand_idx\` ON \`products\` (\`brand_id\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`products_category_idx\`;`)
  await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`products_featured_idx\`;`)
  await db.run(sql`CREATE INDEX \`products_featured_idx\` ON \`products\` (\`featured\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`products_updated_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`products_created_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`products__status_idx\`;`)
  await db.run(sql`CREATE INDEX \`products__status_idx\` ON \`products\` (\`_status\`);`)
  await db.run(sql`DROP TABLE IF EXISTS \`__new_reviews\`;`)
  await db.run(sql`CREATE TABLE \`__new_reviews\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`product_id\` integer,
  	\`reviewer_name\` text,
  	\`rating\` numeric DEFAULT 5,
  	\`comment\` text,
  	\`verified_purchase\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_reviews\`("id", "product_id", "reviewer_name", "rating", "comment", "verified_purchase", "updated_at", "created_at", "_status") SELECT "id", "product_id", "reviewer_name", "rating", "comment", "verified_purchase", "updated_at", "created_at", "_status" FROM \`reviews\`;`,
  )
  await db.run(sql`DROP TABLE \`reviews\`;`)
  await db.run(sql`ALTER TABLE \`__new_reviews\` RENAME TO \`reviews\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`reviews_product_idx\`;`)
  await db.run(sql`CREATE INDEX \`reviews_product_idx\` ON \`reviews\` (\`product_id\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`reviews_updated_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`reviews_updated_at_idx\` ON \`reviews\` (\`updated_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`reviews_created_at_idx\`;`)
  await db.run(sql`CREATE INDEX \`reviews_created_at_idx\` ON \`reviews\` (\`created_at\`);`)
  await db.run(sql`DROP INDEX IF EXISTS \`reviews__status_idx\`;`)
  await db.run(sql`CREATE INDEX \`reviews__status_idx\` ON \`reviews\` (\`_status\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`icon_id\` integer NOT NULL,
  	\`description\` text NOT NULL,
  	\`featured\` integer DEFAULT false NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft' NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_categories\`("id", "title", "slug", "image_id", "icon_id", "description", "featured", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "image_id", "icon_id", "description", "featured", "updated_at", "created_at", "_status" FROM \`categories\`;`,
  )
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`ALTER TABLE \`__new_categories\` RENAME TO \`categories\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_slug_idx\` ON \`categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`categories_image_idx\` ON \`categories\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_icon_idx\` ON \`categories\` (\`icon_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_featured_idx\` ON \`categories\` (\`featured\`);`)
  await db.run(sql`CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`categories__status_idx\` ON \`categories\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new_brands\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`description\` text NOT NULL,
  	\`verified\` integer DEFAULT false NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft' NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_brands\`("id", "title", "slug", "image_id", "description", "verified", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "image_id", "description", "verified", "updated_at", "created_at", "_status" FROM \`brands\`;`,
  )
  await db.run(sql`DROP TABLE \`brands\`;`)
  await db.run(sql`ALTER TABLE \`__new_brands\` RENAME TO \`brands\`;`)
  await db.run(sql`CREATE INDEX \`brands_title_idx\` ON \`brands\` (\`title\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`brands_slug_idx\` ON \`brands\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`brands_image_idx\` ON \`brands\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`brands_updated_at_idx\` ON \`brands\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`brands_created_at_idx\` ON \`brands\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`brands__status_idx\` ON \`brands\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new_tags\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft' NOT NULL
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_tags\`("id", "title", "slug", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "updated_at", "created_at", "_status" FROM \`tags\`;`,
  )
  await db.run(sql`DROP TABLE \`tags\`;`)
  await db.run(sql`ALTER TABLE \`__new_tags\` RENAME TO \`tags\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`tags_slug_idx\` ON \`tags\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`tags_updated_at_idx\` ON \`tags\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`tags_created_at_idx\` ON \`tags\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`tags__status_idx\` ON \`tags\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new_products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`brand_id\` integer NOT NULL,
  	\`description\` text NOT NULL,
  	\`category_id\` integer NOT NULL,
  	\`featured\` integer DEFAULT false NOT NULL,
  	\`limited_edition\` integer DEFAULT false NOT NULL,
  	\`seo_title\` text NOT NULL,
  	\`seo_description\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft' NOT NULL,
  	FOREIGN KEY (\`brand_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_products\`("id", "title", "slug", "brand_id", "description", "category_id", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "brand_id", "description", "category_id", "featured", "limited_edition", "seo_title", "seo_description", "updated_at", "created_at", "_status" FROM \`products\`;`,
  )
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`ALTER TABLE \`__new_products\` RENAME TO \`products\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_brand_idx\` ON \`products\` (\`brand_id\`);`)
  await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`products_featured_idx\` ON \`products\` (\`featured\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`products__status_idx\` ON \`products\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new_reviews\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`product_id\` integer NOT NULL,
  	\`reviewer_name\` text NOT NULL,
  	\`rating\` numeric DEFAULT 5 NOT NULL,
  	\`comment\` text NOT NULL,
  	\`verified_purchase\` integer DEFAULT true NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft' NOT NULL,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_reviews\`("id", "product_id", "reviewer_name", "rating", "comment", "verified_purchase", "updated_at", "created_at", "_status") SELECT "id", "product_id", "reviewer_name", "rating", "comment", "verified_purchase", "updated_at", "created_at", "_status" FROM \`reviews\`;`,
  )
  await db.run(sql`DROP TABLE \`reviews\`;`)
  await db.run(sql`ALTER TABLE \`__new_reviews\` RENAME TO \`reviews\`;`)
  await db.run(sql`CREATE INDEX \`reviews_product_idx\` ON \`reviews\` (\`product_id\`);`)
  await db.run(sql`CREATE INDEX \`reviews_updated_at_idx\` ON \`reviews\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`reviews_created_at_idx\` ON \`reviews\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`reviews__status_idx\` ON \`reviews\` (\`_status\`);`)
}
