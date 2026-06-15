import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`_users_v_version_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`created_at\` text,
  	\`expires_at\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_users_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_users_v_version_sessions_order_idx\` ON \`_users_v_version_sessions\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_users_v_version_sessions_parent_id_idx\` ON \`_users_v_version_sessions\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_users_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_email\` text,
  	\`version_reset_password_token\` text,
  	\`version_reset_password_expiration\` text,
  	\`version_salt\` text,
  	\`version_hash\` text,
  	\`version_login_attempts\` numeric DEFAULT 0,
  	\`version_lock_until\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_users_v_parent_idx\` ON \`_users_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_users_v_version_version_updated_at_idx\` ON \`_users_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_users_v_version_version_created_at_idx\` ON \`_users_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_users_v_version_version__status_idx\` ON \`_users_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_users_v_version_version_email_idx\` ON \`_users_v\` (\`version_email\`);`,
  )
  await db.run(sql`CREATE INDEX \`_users_v_created_at_idx\` ON \`_users_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_users_v_updated_at_idx\` ON \`_users_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_users_v_latest_idx\` ON \`_users_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_users_v_autosave_idx\` ON \`_users_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_media_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_alt\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_url\` text,
  	\`version_thumbnail_u_r_l\` text,
  	\`version_filename\` text,
  	\`version_mime_type\` text,
  	\`version_filesize\` numeric,
  	\`version_width\` numeric,
  	\`version_height\` numeric,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_media_v_parent_idx\` ON \`_media_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_media_v_version_version_updated_at_idx\` ON \`_media_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_media_v_version_version_created_at_idx\` ON \`_media_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_media_v_version_version__status_idx\` ON \`_media_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_media_v_version_version_filename_idx\` ON \`_media_v\` (\`version_filename\`);`,
  )
  await db.run(sql`CREATE INDEX \`_media_v_created_at_idx\` ON \`_media_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_updated_at_idx\` ON \`_media_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_latest_idx\` ON \`_media_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_autosave_idx\` ON \`_media_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_categories_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_image_id\` integer,
  	\`version_icon_id\` integer,
  	\`version_description\` text,
  	\`version_featured\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_categories_v_parent_idx\` ON \`_categories_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_categories_v_version_version_slug_idx\` ON \`_categories_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_categories_v_version_version_image_idx\` ON \`_categories_v\` (\`version_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_categories_v_version_version_icon_idx\` ON \`_categories_v\` (\`version_icon_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_categories_v_version_version_featured_idx\` ON \`_categories_v\` (\`version_featured\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_categories_v_version_version_updated_at_idx\` ON \`_categories_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_categories_v_version_version_created_at_idx\` ON \`_categories_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_categories_v_version_version__status_idx\` ON \`_categories_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_categories_v_created_at_idx\` ON \`_categories_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_categories_v_updated_at_idx\` ON \`_categories_v\` (\`updated_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`_categories_v_latest_idx\` ON \`_categories_v\` (\`latest\`);`)
  await db.run(
    sql`CREATE INDEX \`_categories_v_autosave_idx\` ON \`_categories_v\` (\`autosave\`);`,
  )
  await db.run(sql`CREATE TABLE \`_brands_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_image_id\` integer,
  	\`version_description\` text,
  	\`version_verified\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_brands_v_parent_idx\` ON \`_brands_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_brands_v_version_version_title_idx\` ON \`_brands_v\` (\`version_title\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_brands_v_version_version_slug_idx\` ON \`_brands_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_brands_v_version_version_image_idx\` ON \`_brands_v\` (\`version_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_brands_v_version_version_updated_at_idx\` ON \`_brands_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_brands_v_version_version_created_at_idx\` ON \`_brands_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_brands_v_version_version__status_idx\` ON \`_brands_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_brands_v_created_at_idx\` ON \`_brands_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_brands_v_updated_at_idx\` ON \`_brands_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_brands_v_latest_idx\` ON \`_brands_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_brands_v_autosave_idx\` ON \`_brands_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_tags_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_tags_v_parent_idx\` ON \`_tags_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_tags_v_version_version_slug_idx\` ON \`_tags_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_tags_v_version_version_updated_at_idx\` ON \`_tags_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_tags_v_version_version_created_at_idx\` ON \`_tags_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_tags_v_version_version__status_idx\` ON \`_tags_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_tags_v_created_at_idx\` ON \`_tags_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_tags_v_updated_at_idx\` ON \`_tags_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_tags_v_latest_idx\` ON \`_tags_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_tags_v_autosave_idx\` ON \`_tags_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_products_v_version_gallery_order_idx\` ON \`_products_v_version_gallery\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_gallery_parent_id_idx\` ON \`_products_v_version_gallery\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_gallery_image_idx\` ON \`_products_v_version_gallery\` (\`image_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_products_v_version_variants_attributes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_products_v_version_variants_attributes_order_idx\` ON \`_products_v_version_variants_attributes\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_variants_attributes_parent_id_idx\` ON \`_products_v_version_variants_attributes\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_products_v_version_variants_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_products_v_version_variants_gallery_order_idx\` ON \`_products_v_version_variants_gallery\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_variants_gallery_parent_id_idx\` ON \`_products_v_version_variants_gallery\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_variants_gallery_image_idx\` ON \`_products_v_version_variants_gallery\` (\`image_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_products_v_version_variants\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_products_v_version_variants_order_idx\` ON \`_products_v_version_variants\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_variants_parent_id_idx\` ON \`_products_v_version_variants\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_products_v_version_specifications\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_products_v_version_specifications_order_idx\` ON \`_products_v_version_specifications\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_specifications_parent_id_idx\` ON \`_products_v_version_specifications\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_products_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_brand_id\` integer,
  	\`version_description\` text,
  	\`version_category_id\` integer,
  	\`version_featured\` integer DEFAULT false,
  	\`version_limited_edition\` integer DEFAULT false,
  	\`version_seo_title\` text,
  	\`version_seo_description\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_brand_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_parent_idx\` ON \`_products_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_products_v_version_version_slug_idx\` ON \`_products_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_version_brand_idx\` ON \`_products_v\` (\`version_brand_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_version_category_idx\` ON \`_products_v\` (\`version_category_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_version_featured_idx\` ON \`_products_v\` (\`version_featured\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_version_updated_at_idx\` ON \`_products_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_version_created_at_idx\` ON \`_products_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_version_version__status_idx\` ON \`_products_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_created_at_idx\` ON \`_products_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_updated_at_idx\` ON \`_products_v\` (\`updated_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`_products_v_latest_idx\` ON \`_products_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_autosave_idx\` ON \`_products_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_products_v_rels_order_idx\` ON \`_products_v_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_products_v_rels_parent_idx\` ON \`_products_v_rels\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`_products_v_rels_path_idx\` ON \`_products_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_products_v_rels_tags_id_idx\` ON \`_products_v_rels\` (\`tags_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_reviews_v_version_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_reviews_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_reviews_v_version_images_order_idx\` ON \`_reviews_v_version_images\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_reviews_v_version_images_parent_id_idx\` ON \`_reviews_v_version_images\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_reviews_v_version_images_image_idx\` ON \`_reviews_v_version_images\` (\`image_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_reviews_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_product_id\` integer,
  	\`version_reviewer_name\` text,
  	\`version_rating\` numeric DEFAULT 5,
  	\`version_comment\` text,
  	\`version_verified_purchase\` integer DEFAULT true,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`reviews\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_reviews_v_parent_idx\` ON \`_reviews_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_reviews_v_version_version_product_idx\` ON \`_reviews_v\` (\`version_product_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_reviews_v_version_version_updated_at_idx\` ON \`_reviews_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_reviews_v_version_version_created_at_idx\` ON \`_reviews_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_reviews_v_version_version__status_idx\` ON \`_reviews_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_reviews_v_created_at_idx\` ON \`_reviews_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_reviews_v_updated_at_idx\` ON \`_reviews_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_reviews_v_latest_idx\` ON \`_reviews_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_reviews_v_autosave_idx\` ON \`_reviews_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`ALTER TABLE \`categories\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`ALTER TABLE \`brands\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`ALTER TABLE \`tags\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`ALTER TABLE \`reviews\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`users\` SET \`_status\` = 'published';`)
  await db.run(sql`UPDATE \`media\` SET \`_status\` = 'published';`)
  await db.run(sql`UPDATE \`categories\` SET \`_status\` = 'published';`)
  await db.run(sql`UPDATE \`brands\` SET \`_status\` = 'published';`)
  await db.run(sql`UPDATE \`tags\` SET \`_status\` = 'published';`)
  await db.run(sql`UPDATE \`products\` SET \`_status\` = 'published';`)
  await db.run(sql`UPDATE \`reviews\` SET \`_status\` = 'published';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`_users_v_version_sessions\`;`)
  await db.run(sql`DROP TABLE \`_users_v\`;`)
  await db.run(sql`DROP TABLE \`_media_v\`;`)
  await db.run(sql`DROP TABLE \`_categories_v\`;`)
  await db.run(sql`DROP TABLE \`_brands_v\`;`)
  await db.run(sql`DROP TABLE \`_tags_v\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_gallery\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_variants_attributes\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_variants_gallery\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_variants\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_specifications\`;`)
  await db.run(sql`DROP TABLE \`_products_v\`;`)
  await db.run(sql`DROP TABLE \`_products_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_reviews_v_version_images\`;`)
  await db.run(sql`DROP TABLE \`_reviews_v\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`_status\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`_status\`;`)
  await db.run(sql`ALTER TABLE \`categories\` DROP COLUMN \`_status\`;`)
  await db.run(sql`ALTER TABLE \`brands\` DROP COLUMN \`_status\`;`)
  await db.run(sql`ALTER TABLE \`tags\` DROP COLUMN \`_status\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`_status\`;`)
  await db.run(sql`ALTER TABLE \`reviews\` DROP COLUMN \`_status\`;`)
}
