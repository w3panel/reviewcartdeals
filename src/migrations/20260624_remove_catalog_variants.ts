import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Removes the catalog-driven variant system: collections, product variant fields,
 * and all related junction/version tables.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Product variant nested tables (availability, attributes, visual galleries)
    DROP TABLE IF EXISTS "_products_v_version_variant_visual_galleries_gallery" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_variant_visual_galleries" CASCADE;
    DROP TABLE IF EXISTS "products_variant_visual_galleries_gallery" CASCADE;
    DROP TABLE IF EXISTS "products_variant_visual_galleries" CASCADE;

    DROP TABLE IF EXISTS "_products_v_version_variant_option_availability_rels" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_variant_option_availability" CASCADE;
    DROP TABLE IF EXISTS "products_variant_option_availability_rels" CASCADE;
    DROP TABLE IF EXISTS "products_variant_option_availability" CASCADE;

    DROP TABLE IF EXISTS "_products_v_version_product_attributes" CASCADE;
    DROP TABLE IF EXISTS "products_product_attributes" CASCADE;

    -- Product variant combinations
    DROP TABLE IF EXISTS "_product_variants_v_version_gallery" CASCADE;
    DROP TABLE IF EXISTS "_product_variants_v_version_options" CASCADE;
    DROP TABLE IF EXISTS "_product_variants_v" CASCADE;
    DROP TABLE IF EXISTS "product_variants_gallery" CASCADE;
    DROP TABLE IF EXISTS "product_variants_options" CASCADE;
    DROP TABLE IF EXISTS "product_variants" CASCADE;

    -- Catalog option values
    DROP TABLE IF EXISTS "_variant_option_values_v_version_gallery" CASCADE;
    DROP TABLE IF EXISTS "_variant_option_values_v" CASCADE;
    DROP TABLE IF EXISTS "variant_option_values_gallery" CASCADE;
    DROP TABLE IF EXISTS "variant_option_values" CASCADE;

    -- Catalog variant types
    DROP TABLE IF EXISTS "_variant_types_v_version_options" CASCADE;
    DROP TABLE IF EXISTS "_variant_types_v" CASCADE;
    DROP TABLE IF EXISTS "variant_types_options" CASCADE;
    DROP TABLE IF EXISTS "variant_types" CASCADE;

    -- Product columns
    ALTER TABLE "products" DROP COLUMN IF EXISTS "enable_variants";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_enable_variants";

    -- Relationship columns on products
    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_variant_types_fk";
    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_variant_option_values_fk";
    DROP INDEX IF EXISTS "products_rels_variant_types_id_idx";
    DROP INDEX IF EXISTS "products_rels_variant_option_values_id_idx";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "variant_types_id";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "variant_option_values_id";

    ALTER TABLE "_products_v_rels" DROP CONSTRAINT IF EXISTS "_products_v_rels_variant_types_fk";
    ALTER TABLE "_products_v_rels" DROP CONSTRAINT IF EXISTS "_products_v_rels_variant_option_values_fk";
    DROP INDEX IF EXISTS "_products_v_rels_variant_types_id_idx";
    DROP INDEX IF EXISTS "_products_v_rels_variant_option_values_id_idx";
    ALTER TABLE "_products_v_rels" DROP COLUMN IF EXISTS "variant_types_id";
    ALTER TABLE "_products_v_rels" DROP COLUMN IF EXISTS "variant_option_values_id";

    -- Locked documents relationship columns
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_variant_types_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_product_variants_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_variant_option_values_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_variant_types_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_product_variants_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_variant_option_values_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "variant_types_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "product_variants_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "variant_option_values_id";

    -- Enum types (if unused after table drops)
    DROP TYPE IF EXISTS "public"."enum_variant_option_values_status";
    DROP TYPE IF EXISTS "public"."enum__variant_option_values_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_variant_types_status";
    DROP TYPE IF EXISTS "public"."enum__variant_types_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_product_variants_status";
    DROP TYPE IF EXISTS "public"."enum__product_variants_v_version_status";
  `)
}

export async function down({ db: _db }: MigrateDownArgs): Promise<void> {
  // Irreversible: variant schema was removed intentionally.
}
