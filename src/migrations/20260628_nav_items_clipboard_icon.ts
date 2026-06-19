import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_nav_items_icon" ADD VALUE IF NOT EXISTS 'clipboardList';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "nav_items" SET "icon" = 'none' WHERE "icon" = 'clipboardList';
    UPDATE "_nav_items_v" SET "version_icon" = 'none' WHERE "version_icon" = 'clipboardList';
  `)
}
