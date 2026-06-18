import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the simplified variant system v2: variant-groups, variant-values,
 * product variant configuration fields, and product-variants combinations.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_variant_groups_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum__variant_groups_v_version_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum_variant_values_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum__variant_values_v_version_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum_product_variants_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum__product_variants_v_version_status" AS ENUM('draft', 'published');

    CREATE TABLE "variant_groups" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "name" varchar NOT NULL,
      "is_visual" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_variant_groups_status" DEFAULT 'draft'
    );

    CREATE TABLE "_variant_groups_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_label" varchar,
      "version_name" varchar,
      "version_is_visual" boolean DEFAULT false,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__variant_groups_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean,
      "autosave" boolean
    );

    CREATE TABLE "variant_values" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "group_id" integer NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_variant_values_status" DEFAULT 'draft'
    );

    CREATE TABLE "_variant_values_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_label" varchar,
      "version_group_id" integer,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__variant_values_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean,
      "autosave" boolean
    );

    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "enable_variants" boolean DEFAULT false;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_enable_variants" boolean DEFAULT false;

    CREATE TABLE "products_variant_group_settings" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "group_id" integer
    );

    CREATE TABLE "products_variant_group_settings_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" varchar NOT NULL,
      "path" varchar NOT NULL,
      "variant_values_id" integer
    );

    CREATE TABLE "_products_v_version_variant_group_settings" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "group_id" integer,
      "_uuid" varchar
    );

    CREATE TABLE "_products_v_version_variant_group_settings_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "variant_values_id" integer
    );

    CREATE TABLE "products_value_galleries" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "value_id" integer
    );

    CREATE TABLE "products_value_galleries_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    CREATE TABLE "_products_v_version_value_galleries" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "value_id" integer,
      "_uuid" varchar
    );

    CREATE TABLE "_products_v_version_value_galleries_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "_uuid" varchar
    );

    CREATE TABLE "product_variants" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "product_id" integer NOT NULL,
      "active" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_product_variants_status" DEFAULT 'draft'
    );

    CREATE TABLE "product_variants_options" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "group_id" integer,
      "value_id" integer
    );

    CREATE TABLE "_product_variants_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_title" varchar,
      "version_product_id" integer,
      "version_active" boolean DEFAULT true,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__product_variants_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean,
      "autosave" boolean
    );

    CREATE TABLE "_product_variants_v_version_options" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "group_id" integer,
      "value_id" integer,
      "_uuid" varchar
    );

    ALTER TABLE "variant_groups" ADD CONSTRAINT "variant_groups_name_unique" UNIQUE("name");

    ALTER TABLE "_variant_groups_v" ADD CONSTRAINT "_variant_groups_v_parent_id_variant_groups_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."variant_groups"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "variant_values" ADD CONSTRAINT "variant_values_group_id_variant_groups_id_fk"
      FOREIGN KEY ("group_id") REFERENCES "public"."variant_groups"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_variant_values_v" ADD CONSTRAINT "_variant_values_v_parent_id_variant_values_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."variant_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "products_variant_group_settings" ADD CONSTRAINT "products_variant_group_settings_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "products_variant_group_settings" ADD CONSTRAINT "products_variant_group_settings_group_id_variant_groups_id_fk"
      FOREIGN KEY ("group_id") REFERENCES "public"."variant_groups"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "products_variant_group_settings_rels" ADD CONSTRAINT "products_variant_group_settings_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."products_variant_group_settings"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "products_variant_group_settings_rels" ADD CONSTRAINT "products_variant_group_settings_rels_values_fk"
      FOREIGN KEY ("variant_values_id") REFERENCES "public"."variant_values"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_group_settings" ADD CONSTRAINT "_products_v_version_variant_group_settings_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_group_settings" ADD CONSTRAINT "_products_v_version_variant_group_settings_group_id_fk"
      FOREIGN KEY ("group_id") REFERENCES "public"."variant_groups"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_group_settings_rels" ADD CONSTRAINT "_products_v_version_variant_group_settings_rels_values_fk"
      FOREIGN KEY ("variant_values_id") REFERENCES "public"."variant_values"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "products_value_galleries" ADD CONSTRAINT "products_value_galleries_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "products_value_galleries" ADD CONSTRAINT "products_value_galleries_value_id_variant_values_id_fk"
      FOREIGN KEY ("value_id") REFERENCES "public"."variant_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "products_value_galleries_gallery" ADD CONSTRAINT "products_value_galleries_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."products_value_galleries"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "products_value_galleries_gallery" ADD CONSTRAINT "products_value_galleries_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_products_v_version_value_galleries" ADD CONSTRAINT "_products_v_version_value_galleries_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_version_value_galleries" ADD CONSTRAINT "_products_v_version_value_galleries_value_id_fk"
      FOREIGN KEY ("value_id") REFERENCES "public"."variant_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_products_v_version_value_galleries_gallery" ADD CONSTRAINT "_products_v_version_value_galleries_gallery_image_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk"
      FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "product_variants_options" ADD CONSTRAINT "product_variants_options_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "product_variants_options" ADD CONSTRAINT "product_variants_options_group_id_variant_groups_id_fk"
      FOREIGN KEY ("group_id") REFERENCES "public"."variant_groups"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "product_variants_options" ADD CONSTRAINT "product_variants_options_value_id_variant_values_id_fk"
      FOREIGN KEY ("value_id") REFERENCES "public"."variant_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_product_variants_v" ADD CONSTRAINT "_product_variants_v_parent_id_product_variants_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_product_variants_v_version_options" ADD CONSTRAINT "_product_variants_v_version_options_group_id_fk"
      FOREIGN KEY ("group_id") REFERENCES "public"."variant_groups"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_product_variants_v_version_options" ADD CONSTRAINT "_product_variants_v_version_options_value_id_fk"
      FOREIGN KEY ("value_id") REFERENCES "public"."variant_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "variant_groups_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "variant_values_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "product_variants_id" integer;

    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_variant_groups_fk"
      FOREIGN KEY ("variant_groups_id") REFERENCES "public"."variant_groups"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_variant_values_fk"
      FOREIGN KEY ("variant_values_id") REFERENCES "public"."variant_values"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_variants_fk"
      FOREIGN KEY ("product_variants_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "variant_groups_updated_at_idx" ON "variant_groups" USING btree ("updated_at");
    CREATE INDEX "variant_groups_created_at_idx" ON "variant_groups" USING btree ("created_at");
    CREATE INDEX "variant_groups__status_idx" ON "variant_groups" USING btree ("_status");

    CREATE INDEX "variant_values_group_idx" ON "variant_values" USING btree ("group_id");
    CREATE INDEX "variant_values_updated_at_idx" ON "variant_values" USING btree ("updated_at");
    CREATE INDEX "variant_values_created_at_idx" ON "variant_values" USING btree ("created_at");
    CREATE INDEX "variant_values__status_idx" ON "variant_values" USING btree ("_status");

    CREATE INDEX "products_variant_group_settings_order_idx" ON "products_variant_group_settings" USING btree ("_order");
    CREATE INDEX "products_variant_group_settings_parent_id_idx" ON "products_variant_group_settings" USING btree ("_parent_id");
    CREATE INDEX "products_variant_group_settings_group_idx" ON "products_variant_group_settings" USING btree ("group_id");

    CREATE INDEX "products_value_galleries_order_idx" ON "products_value_galleries" USING btree ("_order");
    CREATE INDEX "products_value_galleries_parent_id_idx" ON "products_value_galleries" USING btree ("_parent_id");
    CREATE INDEX "products_value_galleries_value_idx" ON "products_value_galleries" USING btree ("value_id");

    CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");
    CREATE INDEX "product_variants_updated_at_idx" ON "product_variants" USING btree ("updated_at");
    CREATE INDEX "product_variants_created_at_idx" ON "product_variants" USING btree ("created_at");
    CREATE INDEX "product_variants__status_idx" ON "product_variants" USING btree ("_status");

    CREATE INDEX "payload_locked_documents_rels_variant_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("variant_groups_id");
    CREATE INDEX "payload_locked_documents_rels_variant_values_id_idx" ON "payload_locked_documents_rels" USING btree ("variant_values_id");
    CREATE INDEX "payload_locked_documents_rels_product_variants_id_idx" ON "payload_locked_documents_rels" USING btree ("product_variants_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_product_variants_v_version_options" CASCADE;
    DROP TABLE IF EXISTS "_product_variants_v" CASCADE;
    DROP TABLE IF EXISTS "product_variants_options" CASCADE;
    DROP TABLE IF EXISTS "product_variants" CASCADE;

    DROP TABLE IF EXISTS "_products_v_version_value_galleries_gallery" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_value_galleries" CASCADE;
    DROP TABLE IF EXISTS "products_value_galleries_gallery" CASCADE;
    DROP TABLE IF EXISTS "products_value_galleries" CASCADE;

    DROP TABLE IF EXISTS "_products_v_version_variant_group_settings_rels" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_variant_group_settings" CASCADE;
    DROP TABLE IF EXISTS "products_variant_group_settings_rels" CASCADE;
    DROP TABLE IF EXISTS "products_variant_group_settings" CASCADE;

    DROP TABLE IF EXISTS "_variant_values_v" CASCADE;
    DROP TABLE IF EXISTS "variant_values" CASCADE;
    DROP TABLE IF EXISTS "_variant_groups_v" CASCADE;
    DROP TABLE IF EXISTS "variant_groups" CASCADE;

    ALTER TABLE "products" DROP COLUMN IF EXISTS "enable_variants";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_enable_variants";

    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_variant_groups_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_variant_values_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_product_variants_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "variant_groups_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "variant_values_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "product_variants_id";

    DROP TYPE IF EXISTS "public"."enum_variant_groups_status";
    DROP TYPE IF EXISTS "public"."enum__variant_groups_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_variant_values_status";
    DROP TYPE IF EXISTS "public"."enum__variant_values_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_product_variants_status";
    DROP TYPE IF EXISTS "public"."enum__product_variants_v_version_status";
  `)
}
