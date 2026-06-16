import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_rels"
      ADD COLUMN IF NOT EXISTS "variant_option_values_id" integer;

    ALTER TABLE "_products_v_rels"
      ADD COLUMN IF NOT EXISTS "variant_option_values_id" integer;

    ALTER TABLE "products_rels"
      DROP CONSTRAINT IF EXISTS "products_rels_variant_option_values_fk";
    ALTER TABLE "products_rels"
      ADD CONSTRAINT "products_rels_variant_option_values_fk"
      FOREIGN KEY ("variant_option_values_id")
      REFERENCES "public"."variant_option_values"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_rels"
      DROP CONSTRAINT IF EXISTS "_products_v_rels_variant_option_values_fk";
    ALTER TABLE "_products_v_rels"
      ADD CONSTRAINT "_products_v_rels_variant_option_values_fk"
      FOREIGN KEY ("variant_option_values_id")
      REFERENCES "public"."variant_option_values"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX IF NOT EXISTS "products_rels_variant_option_values_id_idx"
      ON "products_rels" USING btree ("variant_option_values_id");
    CREATE INDEX IF NOT EXISTS "_products_v_rels_variant_option_values_id_idx"
      ON "_products_v_rels" USING btree ("variant_option_values_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "_products_v_rels_variant_option_values_id_idx";
    DROP INDEX IF EXISTS "products_rels_variant_option_values_id_idx";

    ALTER TABLE "_products_v_rels"
      DROP CONSTRAINT IF EXISTS "_products_v_rels_variant_option_values_fk";
    ALTER TABLE "products_rels"
      DROP CONSTRAINT IF EXISTS "products_rels_variant_option_values_fk";

    ALTER TABLE "_products_v_rels" DROP COLUMN IF EXISTS "variant_option_values_id";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "variant_option_values_id";
  `)
}
