import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'
import { rebuildTable, tableExists } from '../lib/d1RebuildTable'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  await rebuildTable(db, {
    name: 'products_variants',
    createNew: `CREATE TABLE \`__new_products_variants\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    columns: '"_order", "_parent_id", "id"',
    indexes: [
      'CREATE INDEX IF NOT EXISTS `products_variants_order_idx` ON `products_variants` (`_order`);',
      'CREATE INDEX IF NOT EXISTS `products_variants_parent_id_idx` ON `products_variants` (`_parent_id`);',
    ],
  })

  await rebuildTable(db, {
    name: 'products_variants_attributes',
    createNew: `CREATE TABLE \`__new_products_variants_attributes\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` text NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`key\` text,
      \`value\` text,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    columns: '"_order", "_parent_id", "id", "key", "value"',
    indexes: [
      'CREATE INDEX IF NOT EXISTS `products_variants_attributes_order_idx` ON `products_variants_attributes` (`_order`);',
      'CREATE INDEX IF NOT EXISTS `products_variants_attributes_parent_id_idx` ON `products_variants_attributes` (`_parent_id`);',
    ],
  })

  await rebuildTable(db, {
    name: 'products_variants_gallery',
    createNew: `CREATE TABLE \`__new_products_variants_gallery\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` text NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`image_id\` integer,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
    );`,
    columns: '"_order", "_parent_id", "id", "image_id"',
    indexes: [
      'CREATE INDEX IF NOT EXISTS `products_variants_gallery_order_idx` ON `products_variants_gallery` (`_order`);',
      'CREATE INDEX IF NOT EXISTS `products_variants_gallery_parent_id_idx` ON `products_variants_gallery` (`_parent_id`);',
      'CREATE INDEX IF NOT EXISTS `products_variants_gallery_image_idx` ON `products_variants_gallery` (`image_id`);',
    ],
  })

  await rebuildTable(db, {
    name: 'products_gallery',
    createNew: `CREATE TABLE \`__new_products_gallery\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`image_id\` integer,
      FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    columns: '"_order", "_parent_id", "id", "image_id"',
    indexes: [
      'CREATE INDEX IF NOT EXISTS `products_gallery_order_idx` ON `products_gallery` (`_order`);',
      'CREATE INDEX IF NOT EXISTS `products_gallery_parent_id_idx` ON `products_gallery` (`_parent_id`);',
      'CREATE INDEX IF NOT EXISTS `products_gallery_image_idx` ON `products_gallery` (`image_id`);',
    ],
  })

  await rebuildTable(db, {
    name: 'products_specifications',
    createNew: `CREATE TABLE \`__new_products_specifications\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`key\` text,
      \`value\` text,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    columns: '"_order", "_parent_id", "id", "key", "value"',
    indexes: [
      'CREATE INDEX IF NOT EXISTS `products_specifications_order_idx` ON `products_specifications` (`_order`);',
      'CREATE INDEX IF NOT EXISTS `products_specifications_parent_id_idx` ON `products_specifications` (`_parent_id`);',
    ],
  })

  await rebuildTable(db, {
    name: 'products_rels',
    createNew: `CREATE TABLE \`__new_products_rels\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`order\` integer,
      \`parent_id\` integer NOT NULL,
      \`path\` text NOT NULL,
      \`tags_id\` integer,
      FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    columns: '"id", "order", "parent_id", "path", "tags_id"',
    indexes: [
      'CREATE INDEX IF NOT EXISTS `products_rels_order_idx` ON `products_rels` (`order`);',
      'CREATE INDEX IF NOT EXISTS `products_rels_parent_idx` ON `products_rels` (`parent_id`);',
      'CREATE INDEX IF NOT EXISTS `products_rels_path_idx` ON `products_rels` (`path`);',
      'CREATE INDEX IF NOT EXISTS `products_rels_tags_id_idx` ON `products_rels` (`tags_id`);',
    ],
  })

  await rebuildTable(db, {
    name: 'reviews_images',
    createNew: `CREATE TABLE \`__new_reviews_images\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`image_id\` integer NOT NULL,
      FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`reviews\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    columns: '"_order", "_parent_id", "id", "image_id"',
    indexes: [
      'CREATE INDEX IF NOT EXISTS `reviews_images_order_idx` ON `reviews_images` (`_order`);',
      'CREATE INDEX IF NOT EXISTS `reviews_images_parent_id_idx` ON `reviews_images` (`_parent_id`);',
      'CREATE INDEX IF NOT EXISTS `reviews_images_image_idx` ON `reviews_images` (`image_id`);',
    ],
  })

  await rebuildTable(db, {
    name: 'payload_locked_documents_rels',
    createNew: `CREATE TABLE \`__new_payload_locked_documents_rels\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`order\` integer,
      \`parent_id\` integer NOT NULL,
      \`path\` text NOT NULL,
      \`users_id\` integer,
      \`media_id\` integer,
      \`categories_id\` integer,
      \`brands_id\` integer,
      \`tags_id\` integer,
      \`products_id\` integer,
      \`reviews_id\` integer,
      FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`brands_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`reviews_id\`) REFERENCES \`reviews\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    columns:
      '"id", "order", "parent_id", "path", "users_id", "media_id", "categories_id", "brands_id", "tags_id", "products_id", "reviews_id"',
    indexes: [
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_order_idx` ON `payload_locked_documents_rels` (`order`);',
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_parent_idx` ON `payload_locked_documents_rels` (`parent_id`);',
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_path_idx` ON `payload_locked_documents_rels` (`path`);',
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_users_id_idx` ON `payload_locked_documents_rels` (`users_id`);',
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_media_id_idx` ON `payload_locked_documents_rels` (`media_id`);',
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_categories_id_idx` ON `payload_locked_documents_rels` (`categories_id`);',
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_brands_id_idx` ON `payload_locked_documents_rels` (`brands_id`);',
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_tags_id_idx` ON `payload_locked_documents_rels` (`tags_id`);',
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_products_id_idx` ON `payload_locked_documents_rels` (`products_id`);',
      'CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_reviews_id_idx` ON `payload_locked_documents_rels` (`reviews_id`);',
    ],
  })

  if (await tableExists(db, '__products_swap_old')) {
    await db.run(sql`DROP TABLE \`__products_swap_old\`;`)
  }

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Repair migration — no down.
}
