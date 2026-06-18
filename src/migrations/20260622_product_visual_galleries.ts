import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "products_variant_visual_galleries" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "option_value_id" integer
    );

    CREATE TABLE "products_variant_visual_galleries_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    CREATE TABLE "_products_v_version_variant_visual_galleries" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "option_value_id" integer,
      "_uuid" varchar
    );

    CREATE TABLE "_products_v_version_variant_visual_galleries_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "_uuid" varchar
    );

    ALTER TABLE "products_variant_visual_galleries"
      ADD CONSTRAINT "products_variant_visual_galleries_option_value_id_variant_option_values_id_fk"
      FOREIGN KEY ("option_value_id") REFERENCES "public"."variant_option_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "products_variant_visual_galleries"
      ADD CONSTRAINT "products_variant_visual_galleries_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "products_variant_visual_galleries_gallery"
      ADD CONSTRAINT "products_variant_visual_galleries_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "products_variant_visual_galleries_gallery"
      ADD CONSTRAINT "products_variant_visual_galleries_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."products_variant_visual_galleries"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_visual_galleries"
      ADD CONSTRAINT "_products_v_version_variant_visual_galleries_option_value_id_variant_option_values_id_fk"
      FOREIGN KEY ("option_value_id") REFERENCES "public"."variant_option_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_visual_galleries"
      ADD CONSTRAINT "_products_v_version_variant_visual_galleries_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_visual_galleries_gallery"
      ADD CONSTRAINT "_products_v_version_variant_visual_galleries_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_visual_galleries_gallery"
      ADD CONSTRAINT "_products_v_version_variant_visual_galleries_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_variant_visual_galleries"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "products_variant_visual_galleries_order_idx"
      ON "products_variant_visual_galleries" USING btree ("_order");
    CREATE INDEX "products_variant_visual_galleries_parent_id_idx"
      ON "products_variant_visual_galleries" USING btree ("_parent_id");
    CREATE INDEX "products_variant_visual_galleries_option_value_idx"
      ON "products_variant_visual_galleries" USING btree ("option_value_id");

    CREATE INDEX "products_variant_visual_galleries_gallery_order_idx"
      ON "products_variant_visual_galleries_gallery" USING btree ("_order");
    CREATE INDEX "products_variant_visual_galleries_gallery_parent_id_idx"
      ON "products_variant_visual_galleries_gallery" USING btree ("_parent_id");
    CREATE INDEX "products_variant_visual_galleries_gallery_image_idx"
      ON "products_variant_visual_galleries_gallery" USING btree ("image_id");

    CREATE INDEX "_products_v_version_variant_visual_galleries_order_idx"
      ON "_products_v_version_variant_visual_galleries" USING btree ("_order");
    CREATE INDEX "_products_v_version_variant_visual_galleries_parent_id_idx"
      ON "_products_v_version_variant_visual_galleries" USING btree ("_parent_id");
    CREATE INDEX "_products_v_version_variant_visual_galleries_option_value_idx"
      ON "_products_v_version_variant_visual_galleries" USING btree ("option_value_id");

    CREATE INDEX "_products_v_version_variant_visual_galleries_gallery_order_idx"
      ON "_products_v_version_variant_visual_galleries_gallery" USING btree ("_order");
    CREATE INDEX "_products_v_version_variant_visual_galleries_gallery_parent_id_idx"
      ON "_products_v_version_variant_visual_galleries_gallery" USING btree ("_parent_id");
    CREATE INDEX "_products_v_version_variant_visual_galleries_gallery_image_idx"
      ON "_products_v_version_variant_visual_galleries_gallery" USING btree ("image_id");
  `)

  await db.execute(sql`
    INSERT INTO "products_variant_visual_galleries" ("_order", "_parent_id", "id", "option_value_id")
    SELECT
      ROW_NUMBER() OVER (PARTITION BY pairs.product_id ORDER BY pairs.option_value_id) - 1 AS "_order",
      pairs.product_id AS "_parent_id",
      'pvg_' || pairs.product_id || '_' || pairs.option_value_id AS "id",
      pairs.option_value_id
    FROM (
      SELECT DISTINCT
        pv."product_id" AS product_id,
        pvo."option_value_id" AS option_value_id
      FROM "product_variants" pv
      INNER JOIN "product_variants_options" pvo ON pvo."_parent_id" = pv."id"
      WHERE pv."product_id" IS NOT NULL
        AND pvo."option_value_id" IS NOT NULL
    ) AS pairs;
  `)

  await db.execute(sql`
    INSERT INTO "products_variant_visual_galleries_gallery" ("_order", "_parent_id", "id", "image_id")
    SELECT
      vovg."_order",
      pvg."id",
      'pvgimg_' || pvg."id" || '_' || vovg."_order",
      vovg."image_id"
    FROM "products_variant_visual_galleries" pvg
    INNER JOIN "variant_option_values_gallery" vovg
      ON vovg."_parent_id" = pvg."option_value_id"
    WHERE vovg."image_id" IS NOT NULL;
  `)

  await db.execute(sql`
    DROP TABLE IF EXISTS "variant_option_values_gallery" CASCADE;
    DROP TABLE IF EXISTS "_variant_option_values_v_version_gallery" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
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
    SELECT DISTINCT ON (pvg."option_value_id", pvg_gallery."_order")
      pvg_gallery."_order",
      pvg."option_value_id",
      pvg_gallery."id",
      pvg_gallery."image_id"
    FROM "products_variant_visual_galleries_gallery" pvg_gallery
    INNER JOIN "products_variant_visual_galleries" pvg ON pvg."id" = pvg_gallery."_parent_id"
    WHERE pvg."option_value_id" IS NOT NULL
      AND pvg_gallery."image_id" IS NOT NULL
    ORDER BY pvg."option_value_id", pvg_gallery."_order", pvg."_parent_id";
  `)

  await db.execute(sql`
    DROP TABLE IF EXISTS "products_variant_visual_galleries_gallery" CASCADE;
    DROP TABLE IF EXISTS "products_variant_visual_galleries" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_variant_visual_galleries_gallery" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_variant_visual_galleries" CASCADE;
  `)
}
