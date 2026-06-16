import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_variant_option_values_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum__variant_option_values_v_version_status" AS ENUM('draft', 'published');

    CREATE TABLE "variant_option_values" (
      "id" serial PRIMARY KEY NOT NULL,
      "variant_type_id" integer,
      "value" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_variant_option_values_status" DEFAULT 'draft'
    );

    CREATE TABLE "_variant_option_values_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_variant_type_id" integer,
      "version_value" varchar,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__variant_option_values_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean,
      "autosave" boolean
    );

    ALTER TABLE "product_variants_options" ADD COLUMN "option_value_id" integer;
    ALTER TABLE "_product_variants_v_version_options" ADD COLUMN "option_value_id" integer;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "variant_option_values_id" integer;

    ALTER TABLE "variant_option_values" ADD CONSTRAINT "variant_option_values_variant_type_id_variant_types_id_fk"
      FOREIGN KEY ("variant_type_id") REFERENCES "public"."variant_types"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_variant_option_values_v" ADD CONSTRAINT "_variant_option_values_v_parent_id_variant_option_values_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."variant_option_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "product_variants_options" ADD CONSTRAINT "product_variants_options_option_value_id_variant_option_values_id_fk"
      FOREIGN KEY ("option_value_id") REFERENCES "public"."variant_option_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_product_variants_v_version_options" ADD CONSTRAINT "_product_variants_v_version_options_option_value_id_variant_option_values_id_fk"
      FOREIGN KEY ("option_value_id") REFERENCES "public"."variant_option_values"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_variant_option_values_fk"
      FOREIGN KEY ("variant_option_values_id") REFERENCES "public"."variant_option_values"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "variant_option_values_variant_type_idx" ON "variant_option_values" USING btree ("variant_type_id");
    CREATE INDEX "variant_option_values_updated_at_idx" ON "variant_option_values" USING btree ("updated_at");
    CREATE INDEX "variant_option_values_created_at_idx" ON "variant_option_values" USING btree ("created_at");
    CREATE INDEX "variant_option_values__status_idx" ON "variant_option_values" USING btree ("_status");
    CREATE UNIQUE INDEX "variant_option_values_variant_type_value_idx"
      ON "variant_option_values" USING btree ("variant_type_id", lower(trim("value")));

    CREATE INDEX "_variant_option_values_v_parent_idx" ON "_variant_option_values_v" USING btree ("parent_id");
    CREATE INDEX "_variant_option_values_v_version_version_variant_type_idx" ON "_variant_option_values_v" USING btree ("version_variant_type_id");
    CREATE INDEX "_variant_option_values_v_version_version_updated_at_idx" ON "_variant_option_values_v" USING btree ("version_updated_at");
    CREATE INDEX "_variant_option_values_v_version_version_created_at_idx" ON "_variant_option_values_v" USING btree ("version_created_at");
    CREATE INDEX "_variant_option_values_v_version_version__status_idx" ON "_variant_option_values_v" USING btree ("version__status");
    CREATE INDEX "_variant_option_values_v_created_at_idx" ON "_variant_option_values_v" USING btree ("created_at");
    CREATE INDEX "_variant_option_values_v_updated_at_idx" ON "_variant_option_values_v" USING btree ("updated_at");
    CREATE INDEX "_variant_option_values_v_latest_idx" ON "_variant_option_values_v" USING btree ("latest");
    CREATE INDEX "_variant_option_values_v_autosave_idx" ON "_variant_option_values_v" USING btree ("autosave");

    CREATE INDEX "product_variants_options_option_value_idx" ON "product_variants_options" USING btree ("option_value_id");
    CREATE INDEX "_product_variants_v_version_options_option_value_idx" ON "_product_variants_v_version_options" USING btree ("option_value_id");
    CREATE INDEX "payload_locked_documents_rels_variant_option_values_id_idx" ON "payload_locked_documents_rels" USING btree ("variant_option_values_id");
  `)

  await db.execute(sql`
    INSERT INTO "variant_option_values" ("variant_type_id", "value", "updated_at", "created_at", "_status")
    SELECT DISTINCT ON ("variant_types_options"."_parent_id", lower(trim("variant_types_options"."value")))
      "variant_types_options"."_parent_id",
      trim("variant_types_options"."value"),
      now(),
      now(),
      COALESCE("variant_types"."_status"::text, 'published')::"enum_variant_option_values_status"
    FROM "variant_types_options"
    JOIN "variant_types" ON "variant_types"."id" = "variant_types_options"."_parent_id"
    WHERE "variant_types_options"."value" IS NOT NULL
      AND trim("variant_types_options"."value") <> '';
  `)

  await db.execute(sql`
    UPDATE "product_variants_options"
    SET "option_value_id" = "variant_option_values"."id"
    FROM "variant_option_values"
    WHERE "product_variants_options"."type_id" = "variant_option_values"."variant_type_id"
      AND "product_variants_options"."value" IS NOT NULL
      AND lower(trim("product_variants_options"."value")) = lower(trim("variant_option_values"."value"));
  `)

  await db.execute(sql`
    UPDATE "_product_variants_v_version_options"
    SET "option_value_id" = "variant_option_values"."id"
    FROM "variant_option_values"
    WHERE "_product_variants_v_version_options"."type_id" = "variant_option_values"."variant_type_id"
      AND "_product_variants_v_version_options"."value" IS NOT NULL
      AND lower(trim("_product_variants_v_version_options"."value")) = lower(trim("variant_option_values"."value"));
  `)

  await db.execute(sql`
    ALTER TABLE "product_variants_options" DROP COLUMN "value";
    ALTER TABLE "_product_variants_v_version_options" DROP COLUMN "value";
    DROP TABLE "variant_types_options" CASCADE;
    DROP TABLE "_variant_types_v_version_options" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "variant_types_options" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "value" varchar
    );

    CREATE TABLE "_variant_types_v_version_options" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "value" varchar,
      "_uuid" varchar
    );

    ALTER TABLE "product_variants_options" ADD COLUMN "value" varchar;
    ALTER TABLE "_product_variants_v_version_options" ADD COLUMN "value" varchar;

    INSERT INTO "variant_types_options" ("_order", "_parent_id", "id", "value")
    SELECT
      row_number() OVER (PARTITION BY "variant_type_id" ORDER BY "id") - 1,
      "variant_type_id",
      md5("variant_option_values"."id"::text || "variant_option_values"."value"),
      "value"
    FROM "variant_option_values"
    WHERE "variant_type_id" IS NOT NULL;

    UPDATE "product_variants_options"
    SET "value" = "variant_option_values"."value"
    FROM "variant_option_values"
    WHERE "product_variants_options"."option_value_id" = "variant_option_values"."id";

    UPDATE "_product_variants_v_version_options"
    SET "value" = "variant_option_values"."value"
    FROM "variant_option_values"
    WHERE "_product_variants_v_version_options"."option_value_id" = "variant_option_values"."id";

    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_variant_option_values_fk";
    ALTER TABLE "_product_variants_v_version_options" DROP CONSTRAINT IF EXISTS "_product_variants_v_version_options_option_value_id_variant_option_values_id_fk";
    ALTER TABLE "product_variants_options" DROP CONSTRAINT IF EXISTS "product_variants_options_option_value_id_variant_option_values_id_fk";
    ALTER TABLE "_variant_option_values_v" DROP CONSTRAINT IF EXISTS "_variant_option_values_v_parent_id_variant_option_values_id_fk";
    ALTER TABLE "variant_option_values" DROP CONSTRAINT IF EXISTS "variant_option_values_variant_type_id_variant_types_id_fk";

    ALTER TABLE "product_variants_options" DROP COLUMN "option_value_id";
    ALTER TABLE "_product_variants_v_version_options" DROP COLUMN "option_value_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "variant_option_values_id";

    DROP TABLE "_variant_option_values_v" CASCADE;
    DROP TABLE "variant_option_values" CASCADE;

    DROP TYPE "public"."enum__variant_option_values_v_version_status";
    DROP TYPE "public"."enum_variant_option_values_status";
  `)
}
