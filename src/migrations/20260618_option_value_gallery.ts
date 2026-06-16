import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "variant_option_values_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    CREATE TABLE "_variant_option_values_v_version_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "_uuid" varchar
    );

    ALTER TABLE "variant_option_values_gallery"
      ADD CONSTRAINT "variant_option_values_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "variant_option_values_gallery"
      ADD CONSTRAINT "variant_option_values_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."variant_option_values"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_variant_option_values_v_version_gallery"
      ADD CONSTRAINT "_variant_option_values_v_version_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_variant_option_values_v_version_gallery"
      ADD CONSTRAINT "_variant_option_values_v_version_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_variant_option_values_v"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "variant_option_values_gallery_order_idx"
      ON "variant_option_values_gallery" USING btree ("_order");
    CREATE INDEX "variant_option_values_gallery_parent_id_idx"
      ON "variant_option_values_gallery" USING btree ("_parent_id");
    CREATE INDEX "variant_option_values_gallery_image_idx"
      ON "variant_option_values_gallery" USING btree ("image_id");

    CREATE INDEX "_variant_option_values_v_version_gallery_order_idx"
      ON "_variant_option_values_v_version_gallery" USING btree ("_order");
    CREATE INDEX "_variant_option_values_v_version_gallery_parent_id_idx"
      ON "_variant_option_values_v_version_gallery" USING btree ("_parent_id");
    CREATE INDEX "_variant_option_values_v_version_gallery_image_idx"
      ON "_variant_option_values_v_version_gallery" USING btree ("image_id");
  `)

  await db.execute(sql`
    INSERT INTO "variant_option_values_gallery" ("_order", "_parent_id", "id", "image_id")
    SELECT DISTINCT ON (gallery_owner.option_value_id, pvg."_order")
      pvg."_order",
      gallery_owner.option_value_id,
      pvg."id",
      pvg."image_id"
    FROM "product_variants_gallery" pvg
    INNER JOIN LATERAL (
      SELECT pvo."option_value_id"
      FROM "product_variants_options" pvo
      WHERE pvo."_parent_id" = pvg."_parent_id"
        AND pvo."option_value_id" IS NOT NULL
      ORDER BY pvo."_order"
      LIMIT 1
    ) AS gallery_owner ON true
    WHERE gallery_owner.option_value_id IS NOT NULL
      AND pvg."image_id" IS NOT NULL
    ORDER BY gallery_owner.option_value_id, pvg."_order";
  `)

  await db.execute(sql`
    DROP TABLE IF EXISTS "product_variants_gallery" CASCADE;
    DROP TABLE IF EXISTS "_product_variants_v_version_gallery" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "product_variants_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    CREATE TABLE "_product_variants_v_version_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "_uuid" varchar
    );

    ALTER TABLE "product_variants_gallery"
      ADD CONSTRAINT "product_variants_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "product_variants_gallery"
      ADD CONSTRAINT "product_variants_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_product_variants_v_version_gallery"
      ADD CONSTRAINT "_product_variants_v_version_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_product_variants_v_version_gallery"
      ADD CONSTRAINT "_product_variants_v_version_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_variants_v"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "product_variants_gallery_order_idx" ON "product_variants_gallery" USING btree ("_order");
    CREATE INDEX "product_variants_gallery_parent_id_idx" ON "product_variants_gallery" USING btree ("_parent_id");
    CREATE INDEX "product_variants_gallery_image_idx" ON "product_variants_gallery" USING btree ("image_id");
    CREATE INDEX "_product_variants_v_version_gallery_order_idx" ON "_product_variants_v_version_gallery" USING btree ("_order");
    CREATE INDEX "_product_variants_v_version_gallery_parent_id_idx" ON "_product_variants_v_version_gallery" USING btree ("_parent_id");
    CREATE INDEX "_product_variants_v_version_gallery_image_idx" ON "_product_variants_v_version_gallery" USING btree ("image_id");
  `)

  await db.execute(sql`
    DROP TABLE IF EXISTS "variant_option_values_gallery" CASCADE;
    DROP TABLE IF EXISTS "_variant_option_values_v_version_gallery" CASCADE;
  `)
}
