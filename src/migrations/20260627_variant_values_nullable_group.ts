import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Relationship drawers create variant-value drafts before group is selected.
 * Allow null group_id on drafts; publish validation still requires a group.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "variant_values" ALTER COLUMN "group_id" DROP NOT NULL;
    ALTER TABLE "_variant_values_v" ALTER COLUMN "version_group_id" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "variant_values" WHERE "group_id" IS NULL;
    DELETE FROM "_variant_values_v" WHERE "version_group_id" IS NULL;

    ALTER TABLE "variant_values" ALTER COLUMN "group_id" SET NOT NULL;
    ALTER TABLE "_variant_values_v" ALTER COLUMN "version_group_id" SET NOT NULL;
  `)
}
