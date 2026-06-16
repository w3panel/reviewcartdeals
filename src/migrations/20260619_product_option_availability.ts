import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "variant_types"
      ADD COLUMN IF NOT EXISTS "is_primary_visual_type" boolean DEFAULT false;

    ALTER TABLE "_variant_types_v"
      ADD COLUMN IF NOT EXISTS "version_is_primary_visual_type" boolean DEFAULT false;

    CREATE TABLE IF NOT EXISTS "products_variant_option_availability" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "type_id" integer
    );

    CREATE TABLE IF NOT EXISTS "products_variant_option_availability_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" varchar NOT NULL,
      "path" varchar NOT NULL,
      "variant_option_values_id" integer
    );

    CREATE TABLE IF NOT EXISTS "_products_v_version_variant_option_availability" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "type_id" integer,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_products_v_version_variant_option_availability_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "variant_option_values_id" integer
    );

    ALTER TABLE "products_variant_option_availability"
      ADD CONSTRAINT "products_variant_option_availability_type_id_variant_types_id_fk"
      FOREIGN KEY ("type_id") REFERENCES "public"."variant_types"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "products_variant_option_availability"
      ADD CONSTRAINT "products_variant_option_availability_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "products_variant_option_availability_rels"
      ADD CONSTRAINT "products_variant_option_availability_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."products_variant_option_availability"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "products_variant_option_availability_rels"
      ADD CONSTRAINT "products_variant_option_availability_rels_option_values_fk"
      FOREIGN KEY ("variant_option_values_id") REFERENCES "public"."variant_option_values"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_option_availability"
      ADD CONSTRAINT "_products_v_version_variant_option_availability_type_id_variant_types_id_fk"
      FOREIGN KEY ("type_id") REFERENCES "public"."variant_types"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_option_availability"
      ADD CONSTRAINT "_products_v_version_variant_option_availability_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_option_availability_rels"
      ADD CONSTRAINT "_products_v_version_variant_option_availability_rels_option_values_fk"
      FOREIGN KEY ("variant_option_values_id") REFERENCES "public"."variant_option_values"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_version_variant_option_availability_rels"
      ADD CONSTRAINT "_products_v_version_variant_option_availability_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v_version_variant_option_availability"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX IF NOT EXISTS "products_variant_option_availability_order_idx"
      ON "products_variant_option_availability" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "products_variant_option_availability_parent_id_idx"
      ON "products_variant_option_availability" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "products_variant_option_availability_type_idx"
      ON "products_variant_option_availability" USING btree ("type_id");

    CREATE INDEX IF NOT EXISTS "products_variant_option_availability_rels_order_idx"
      ON "products_variant_option_availability_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "products_variant_option_availability_rels_parent_idx"
      ON "products_variant_option_availability_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "products_variant_option_availability_rels_path_idx"
      ON "products_variant_option_availability_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "products_variant_option_availability_rels_option_values_id_idx"
      ON "products_variant_option_availability_rels" USING btree ("variant_option_values_id");

    CREATE INDEX IF NOT EXISTS "_products_v_version_variant_option_availability_order_idx"
      ON "_products_v_version_variant_option_availability" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_products_v_version_variant_option_availability_parent_id_idx"
      ON "_products_v_version_variant_option_availability" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_products_v_version_variant_option_availability_type_idx"
      ON "_products_v_version_variant_option_availability" USING btree ("type_id");

    CREATE INDEX IF NOT EXISTS "_products_v_version_variant_option_availability_rels_order_idx"
      ON "_products_v_version_variant_option_availability_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "_products_v_version_variant_option_availability_rels_parent_idx"
      ON "_products_v_version_variant_option_availability_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_products_v_version_variant_option_availability_rels_path_idx"
      ON "_products_v_version_variant_option_availability_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "_products_v_version_variant_option_availability_rels_option_values_id_idx"
      ON "_products_v_version_variant_option_availability_rels" USING btree ("variant_option_values_id");
  `)

  await db.execute(sql`
    UPDATE "variant_types"
    SET "is_primary_visual_type" = true
    WHERE lower("name") = 'color' OR lower("label") = 'color';
  `)

  await db.execute(sql`
  INSERT INTO "products_variant_option_availability" ("_order", "_parent_id", "id", "type_id")
  SELECT
    ROW_NUMBER() OVER (PARTITION BY grouped.product_id ORDER BY grouped.type_id) - 1 AS "_order",
    grouped.product_id,
    'p' || grouped.product_id || 't' || grouped.type_id AS "id",
    grouped.type_id
  FROM (
    SELECT DISTINCT pv.product_id, pvo.type_id
    FROM "product_variants" pv
    INNER JOIN "product_variants_options" pvo ON pvo."_parent_id" = pv.id
    INNER JOIN "products" p ON p.id = pv.product_id
    WHERE p.enable_variants = true
      AND pvo.type_id IS NOT NULL
  ) AS grouped
  ON CONFLICT ("id") DO NOTHING;
  `)

  await db.execute(sql`
  INSERT INTO "products_variant_option_availability_rels" ("order", "parent_id", "path", "variant_option_values_id")
  SELECT DISTINCT
    ROW_NUMBER() OVER (
      PARTITION BY avail.id
      ORDER BY pvo.option_value_id
    ) - 1 AS "order",
    avail.id AS "parent_id",
    'optionValues' AS "path",
    pvo.option_value_id
  FROM "products_variant_option_availability" avail
  INNER JOIN "product_variants" pv ON pv.product_id = avail."_parent_id"
  INNER JOIN "product_variants_options" pvo
    ON pvo."_parent_id" = pv.id
    AND pvo.type_id = avail.type_id
  WHERE pvo.option_value_id IS NOT NULL
  ON CONFLICT DO NOTHING;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_products_v_version_variant_option_availability_rels" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_variant_option_availability" CASCADE;
    DROP TABLE IF EXISTS "products_variant_option_availability_rels" CASCADE;
    DROP TABLE IF EXISTS "products_variant_option_availability" CASCADE;

    ALTER TABLE "variant_types" DROP COLUMN IF EXISTS "is_primary_visual_type";
    ALTER TABLE "_variant_types_v" DROP COLUMN IF EXISTS "version_is_primary_visual_type";
  `)
}
