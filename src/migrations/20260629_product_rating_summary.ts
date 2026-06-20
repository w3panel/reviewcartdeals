import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "average_rating" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "review_count" numeric DEFAULT 0;

    ALTER TABLE "_products_v"
      ADD COLUMN IF NOT EXISTS "version_average_rating" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "version_review_count" numeric DEFAULT 0;

    CREATE INDEX IF NOT EXISTS "products_average_rating_idx" ON "products" ("average_rating");
    CREATE INDEX IF NOT EXISTS "products_review_count_idx" ON "products" ("review_count");

    UPDATE "products" p
    SET
      "review_count" = COALESCE(sub.cnt, 0),
      "average_rating" = COALESCE(sub.avg, 0)
    FROM (
      SELECT
        "product_id" AS pid,
        COUNT(*)::numeric AS cnt,
        ROUND(AVG("rating")::numeric, 1) AS avg
      FROM "reviews"
      WHERE "_status" = 'published'
      GROUP BY "product_id"
    ) sub
    WHERE p."id" = sub.pid;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "products_review_count_idx";
    DROP INDEX IF EXISTS "products_average_rating_idx";

    ALTER TABLE "_products_v"
      DROP COLUMN IF EXISTS "version_review_count",
      DROP COLUMN IF EXISTS "version_average_rating";

    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "review_count",
      DROP COLUMN IF EXISTS "average_rating";
  `)
}
