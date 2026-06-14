import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'
import { tableExists } from '../lib/d1RebuildTable'

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
  if (!(await tableExists(db, 'variant_types'))) {
    await db.run(sql`CREATE TABLE \`variant_types\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`label\` text,
      \`name\` text,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`_status\` text DEFAULT 'draft'
    );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`variant_types_name_idx\` ON \`variant_types\` (\`name\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`variant_types_updated_at_idx\` ON \`variant_types\` (\`updated_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`variant_types_created_at_idx\` ON \`variant_types\` (\`created_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`variant_types__status_idx\` ON \`variant_types\` (\`_status\`);`,
    )
  }

  if (!(await tableExists(db, 'variant_types_options'))) {
    await db.run(sql`CREATE TABLE \`variant_types_options\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`value\` text,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`variant_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`variant_types_options_order_idx\` ON \`variant_types_options\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`variant_types_options_parent_id_idx\` ON \`variant_types_options\` (\`_parent_id\`);`,
    )
  }

  if (!(await tableExists(db, '_variant_types_v'))) {
    await db.run(sql`CREATE TABLE \`_variant_types_v\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`parent_id\` integer,
      \`version_label\` text,
      \`version_name\` text,
      \`version_updated_at\` text,
      \`version_created_at\` text,
      \`version__status\` text DEFAULT 'draft',
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`latest\` integer,
      \`autosave\` integer,
      FOREIGN KEY (\`parent_id\`) REFERENCES \`variant_types\`(\`id\`) ON UPDATE no action ON DELETE set null
    );`)
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_parent_idx\` ON \`_variant_types_v\` (\`parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_version_version_name_idx\` ON \`_variant_types_v\` (\`version_name\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_version_version_updated_at_idx\` ON \`_variant_types_v\` (\`version_updated_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_version_version_created_at_idx\` ON \`_variant_types_v\` (\`version_created_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_version_version__status_idx\` ON \`_variant_types_v\` (\`version__status\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_created_at_idx\` ON \`_variant_types_v\` (\`created_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_updated_at_idx\` ON \`_variant_types_v\` (\`updated_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_latest_idx\` ON \`_variant_types_v\` (\`latest\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_autosave_idx\` ON \`_variant_types_v\` (\`autosave\`);`,
    )
  }

  if (!(await tableExists(db, '_variant_types_v_version_options'))) {
    await db.run(sql`CREATE TABLE \`_variant_types_v_version_options\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`value\` text,
      \`_uuid\` text,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`_variant_types_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_version_options_order_idx\` ON \`_variant_types_v_version_options\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_variant_types_v_version_options_parent_id_idx\` ON \`_variant_types_v_version_options\` (\`_parent_id\`);`,
    )
  }

  if (!(await tableExists(db, 'product_variants'))) {
    await db.run(sql`CREATE TABLE \`product_variants\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`product_id\` integer,
      \`title\` text,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`_status\` text DEFAULT 'draft',
      FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
    );`)
    await db.run(
      sql`CREATE INDEX \`product_variants_product_idx\` ON \`product_variants\` (\`product_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`product_variants_updated_at_idx\` ON \`product_variants\` (\`updated_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`product_variants_created_at_idx\` ON \`product_variants\` (\`created_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`product_variants__status_idx\` ON \`product_variants\` (\`_status\`);`,
    )
  }

  if (!(await tableExists(db, 'product_variants_options'))) {
    await db.run(sql`CREATE TABLE \`product_variants_options\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`type_id\` integer,
      \`value\` text,
      FOREIGN KEY (\`type_id\`) REFERENCES \`variant_types\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`product_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`product_variants_options_order_idx\` ON \`product_variants_options\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`product_variants_options_parent_id_idx\` ON \`product_variants_options\` (\`_parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`product_variants_options_type_idx\` ON \`product_variants_options\` (\`type_id\`);`,
    )
  }

  if (!(await tableExists(db, 'product_variants_gallery'))) {
    await db.run(sql`CREATE TABLE \`product_variants_gallery\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`image_id\` integer,
      FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`product_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`product_variants_gallery_order_idx\` ON \`product_variants_gallery\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`product_variants_gallery_parent_id_idx\` ON \`product_variants_gallery\` (\`_parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`product_variants_gallery_image_idx\` ON \`product_variants_gallery\` (\`image_id\`);`,
    )
  }

  if (!(await tableExists(db, '_product_variants_v'))) {
    await db.run(sql`CREATE TABLE \`_product_variants_v\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`parent_id\` integer,
      \`version_product_id\` integer,
      \`version_title\` text,
      \`version_updated_at\` text,
      \`version_created_at\` text,
      \`version__status\` text DEFAULT 'draft',
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`latest\` integer,
      \`autosave\` integer,
      FOREIGN KEY (\`parent_id\`) REFERENCES \`product_variants\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`version_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
    );`)
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_parent_idx\` ON \`_product_variants_v\` (\`parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_version_product_idx\` ON \`_product_variants_v\` (\`version_product_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_version_updated_at_idx\` ON \`_product_variants_v\` (\`version_updated_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_version_created_at_idx\` ON \`_product_variants_v\` (\`version_created_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_version__status_idx\` ON \`_product_variants_v\` (\`version__status\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_created_at_idx\` ON \`_product_variants_v\` (\`created_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_updated_at_idx\` ON \`_product_variants_v\` (\`updated_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_latest_idx\` ON \`_product_variants_v\` (\`latest\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_autosave_idx\` ON \`_product_variants_v\` (\`autosave\`);`,
    )
  }

  if (!(await tableExists(db, '_product_variants_v_version_options'))) {
    await db.run(sql`CREATE TABLE \`_product_variants_v_version_options\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`type_id\` integer,
      \`value\` text,
      \`_uuid\` text,
      FOREIGN KEY (\`type_id\`) REFERENCES \`variant_types\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`_product_variants_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_options_order_idx\` ON \`_product_variants_v_version_options\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_options_parent_id_idx\` ON \`_product_variants_v_version_options\` (\`_parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_options_type_idx\` ON \`_product_variants_v_version_options\` (\`type_id\`);`,
    )
  }

  if (!(await tableExists(db, '_product_variants_v_version_gallery'))) {
    await db.run(sql`CREATE TABLE \`_product_variants_v_version_gallery\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`image_id\` integer,
      \`_uuid\` text,
      FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`_product_variants_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_gallery_order_idx\` ON \`_product_variants_v_version_gallery\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_gallery_parent_id_idx\` ON \`_product_variants_v_version_gallery\` (\`_parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_product_variants_v_version_gallery_image_idx\` ON \`_product_variants_v_version_gallery\` (\`image_id\`);`,
    )
  }

  if (!(await columnExists(db, 'products', 'enable_variants'))) {
    await db.run(sql`ALTER TABLE \`products\` ADD \`enable_variants\` integer DEFAULT false;`)
  }

  if (!(await columnExists(db, '_products_v', 'version_enable_variants'))) {
    await db.run(
      sql`ALTER TABLE \`_products_v\` ADD \`version_enable_variants\` integer DEFAULT false;`,
    )
  }

  if (!(await columnExists(db, 'products_rels', 'variant_types_id'))) {
    await db.run(
      sql`ALTER TABLE \`products_rels\` ADD \`variant_types_id\` integer REFERENCES variant_types(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`products_rels_variant_types_id_idx\` ON \`products_rels\` (\`variant_types_id\`);`,
    )
  }

  if (!(await columnExists(db, '_products_v_rels', 'variant_types_id'))) {
    await db.run(
      sql`ALTER TABLE \`_products_v_rels\` ADD \`variant_types_id\` integer REFERENCES variant_types(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`_products_v_rels_variant_types_id_idx\` ON \`_products_v_rels\` (\`variant_types_id\`);`,
    )
  }

  if (!(await columnExists(db, 'payload_locked_documents_rels', 'variant_types_id'))) {
    await db.run(
      sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`variant_types_id\` integer REFERENCES variant_types(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`payload_locked_documents_rels_variant_types_id_idx\` ON \`payload_locked_documents_rels\` (\`variant_types_id\`);`,
    )
  }

  if (!(await columnExists(db, 'payload_locked_documents_rels', 'product_variants_id'))) {
    await db.run(
      sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`product_variants_id\` integer REFERENCES product_variants(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`payload_locked_documents_rels_product_variants_id_idx\` ON \`payload_locked_documents_rels\` (\`product_variants_id\`);`,
    )
  }

  await db.run(sql`DROP TABLE IF EXISTS \`products_variants_attributes\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`products_variants_gallery\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`products_variants\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_products_v_version_variants_attributes\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_products_v_version_variants_gallery\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_products_v_version_variants\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`_product_variants_v_version_gallery\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_product_variants_v_version_options\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_product_variants_v\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`product_variants_gallery\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`product_variants_options\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`product_variants\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_variant_types_v_version_options\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_variant_types_v\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`variant_types_options\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`variant_types\`;`)
}
