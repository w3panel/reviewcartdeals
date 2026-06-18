import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "products_variant_visual_galleries_gallery"
    WHERE "image_id" IS NULL;

    DELETE FROM "_products_v_version_variant_visual_galleries_gallery"
    WHERE "image_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // No-op: removed rows cannot be restored.
  void db
}
