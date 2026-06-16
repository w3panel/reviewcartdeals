import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "products_attributes" RENAME TO "products_product_attributes";
    ALTER TABLE IF EXISTS "_products_v_version_attributes" RENAME TO "_products_v_version_product_attributes";

    ALTER INDEX IF EXISTS "products_attributes_pkey" RENAME TO "products_product_attributes_pkey";
    ALTER INDEX IF EXISTS "products_attributes_order_idx" RENAME TO "products_product_attributes_order_idx";
    ALTER INDEX IF EXISTS "products_attributes_parent_id_idx" RENAME TO "products_product_attributes_parent_id_idx";
    ALTER INDEX IF EXISTS "products_attributes_type_idx" RENAME TO "products_product_attributes_type_idx";
    ALTER INDEX IF EXISTS "products_attributes_option_value_idx" RENAME TO "products_product_attributes_option_value_idx";

    ALTER INDEX IF EXISTS "_products_v_version_attributes_order_idx" RENAME TO "_products_v_version_product_attributes_order_idx";
    ALTER INDEX IF EXISTS "_products_v_version_attributes_parent_id_idx" RENAME TO "_products_v_version_product_attributes_parent_id_idx";
    ALTER INDEX IF EXISTS "_products_v_version_attributes_type_idx" RENAME TO "_products_v_version_product_attributes_type_idx";
    ALTER INDEX IF EXISTS "_products_v_version_attributes_option_value_idx" RENAME TO "_products_v_version_product_attributes_option_value_idx";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "products_product_attributes" RENAME TO "products_attributes";
    ALTER TABLE IF EXISTS "_products_v_version_product_attributes" RENAME TO "_products_v_version_attributes";

    ALTER INDEX IF EXISTS "products_product_attributes_pkey" RENAME TO "products_attributes_pkey";
    ALTER INDEX IF EXISTS "products_product_attributes_order_idx" RENAME TO "products_attributes_order_idx";
    ALTER INDEX IF EXISTS "products_product_attributes_parent_id_idx" RENAME TO "products_attributes_parent_id_idx";
    ALTER INDEX IF EXISTS "products_product_attributes_type_idx" RENAME TO "products_attributes_type_idx";
    ALTER INDEX IF EXISTS "products_product_attributes_option_value_idx" RENAME TO "products_attributes_option_value_idx";

    ALTER INDEX IF EXISTS "_products_v_version_product_attributes_order_idx" RENAME TO "_products_v_version_attributes_order_idx";
    ALTER INDEX IF EXISTS "_products_v_version_product_attributes_parent_id_idx" RENAME TO "_products_v_version_attributes_parent_id_idx";
    ALTER INDEX IF EXISTS "_products_v_version_product_attributes_type_idx" RENAME TO "_products_v_version_attributes_type_idx";
    ALTER INDEX IF EXISTS "_products_v_version_product_attributes_option_value_idx" RENAME TO "_products_v_version_attributes_option_value_idx";
  `)
}
