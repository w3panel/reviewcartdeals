import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "products_product_attributes" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "type_id" integer,
      "option_value_id" integer
    );

    CREATE TABLE "_products_v_version_product_attributes" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "type_id" integer,
      "option_value_id" integer,
      "_uuid" varchar
    );

    ALTER TABLE "products_product_attributes" ADD CONSTRAINT "products_product_attributes_type_id_variant_types_id_fk"
      FOREIGN KEY ("type_id") REFERENCES "public"."variant_types"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "products_product_attributes" ADD CONSTRAINT "products_product_attributes_option_value_id_variant_option_values_id_fk"
      FOREIGN KEY ("option_value_id") REFERENCES "public"."variant_option_values"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "products_product_attributes" ADD CONSTRAINT "products_product_attributes_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_version_product_attributes" ADD CONSTRAINT "_products_v_version_product_attributes_type_id_variant_types_id_fk"
      FOREIGN KEY ("type_id") REFERENCES "public"."variant_types"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_products_v_version_product_attributes" ADD CONSTRAINT "_products_v_version_product_attributes_option_value_id_variant_option_values_id_fk"
      FOREIGN KEY ("option_value_id") REFERENCES "public"."variant_option_values"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_products_v_version_product_attributes" ADD CONSTRAINT "_products_v_version_product_attributes_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "products_product_attributes_order_idx" ON "products_product_attributes" USING btree ("_order");
    CREATE INDEX "products_product_attributes_parent_id_idx" ON "products_product_attributes" USING btree ("_parent_id");
    CREATE INDEX "products_product_attributes_type_idx" ON "products_product_attributes" USING btree ("type_id");
    CREATE INDEX "products_product_attributes_option_value_idx" ON "products_product_attributes" USING btree ("option_value_id");

    CREATE INDEX "_products_v_version_product_attributes_order_idx" ON "_products_v_version_product_attributes" USING btree ("_order");
    CREATE INDEX "_products_v_version_product_attributes_parent_id_idx" ON "_products_v_version_product_attributes" USING btree ("_parent_id");
    CREATE INDEX "_products_v_version_product_attributes_type_idx" ON "_products_v_version_product_attributes" USING btree ("type_id");
    CREATE INDEX "_products_v_version_product_attributes_option_value_idx" ON "_products_v_version_product_attributes" USING btree ("option_value_id");

    UPDATE "products_rels" SET "path" = 'variantOptionTypes' WHERE "path" = 'variantTypes';
    UPDATE "_products_v_rels" SET "path" = 'variantOptionTypes' WHERE "path" = 'variantTypes';

    ALTER TABLE "variant_types" DROP COLUMN IF EXISTS "shared_across_variants";
    ALTER TABLE "_variant_types_v" DROP COLUMN IF EXISTS "version_shared_across_variants";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "variant_types" ADD COLUMN "shared_across_variants" boolean DEFAULT false;
    ALTER TABLE "_variant_types_v" ADD COLUMN "version_shared_across_variants" boolean DEFAULT false;

    UPDATE "products_rels" SET "path" = 'variantTypes' WHERE "path" = 'variantOptionTypes';
    UPDATE "_products_v_rels" SET "path" = 'variantTypes' WHERE "path" = 'variantOptionTypes';

    DROP TABLE "_products_v_version_product_attributes" CASCADE;
    DROP TABLE "products_product_attributes" CASCADE;
  `)
}
