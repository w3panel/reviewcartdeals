import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Payload auto-generated migration superseded by manual migrations:
 * - 20260616_variant_option_values
 * - 20260617_fix_product_attributes_table_names
 * - 20260617_product_attributes_phase2
 * - 20260618_option_value_gallery
 * - 20260619_product_option_availability
 * - 20260621_fix_products_rels_option_values
 *
 * Only media image-size columns remain unique to this migration.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "focal_x" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "focal_y" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_url" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_width" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_height" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_mime_type" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_filesize" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_filename" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_url" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_width" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_height" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_mime_type" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_filesize" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_filename" varchar;

    CREATE INDEX IF NOT EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx"
      ON "media" USING btree ("sizes_thumbnail_filename");
    CREATE INDEX IF NOT EXISTS "media_sizes_card_sizes_card_filename_idx"
      ON "media" USING btree ("sizes_card_filename");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_sizes_card_sizes_card_filename_idx";
    DROP INDEX IF EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx";

    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_filename";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_filesize";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_mime_type";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_height";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_width";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_url";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_filename";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_filesize";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_mime_type";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_height";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_width";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_url";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "focal_y";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "focal_x";
  `)
}
