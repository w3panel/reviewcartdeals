import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Promote published orphan versions (autosave never linked to a main row) into the live table.
  await db.execute(sql`
    WITH published_orphans AS (
      SELECT
        v.id AS version_id,
        v.version_variant_type_id,
        trim(v.version_value) AS value
      FROM "_variant_option_values_v" v
      WHERE v.parent_id IS NULL
        AND v.latest = true
        AND v.version__status = 'published'
        AND v.version_variant_type_id IS NOT NULL
        AND trim(coalesce(v.version_value, '')) <> ''
    ),
    inserted AS (
      INSERT INTO "variant_option_values" (
        "variant_type_id",
        "value",
        "_status",
        "created_at",
        "updated_at"
      )
      SELECT
        po.version_variant_type_id,
        po.value,
        'published',
        now(),
        now()
      FROM published_orphans po
      WHERE NOT EXISTS (
        SELECT 1
        FROM "variant_option_values" live
        WHERE live.variant_type_id = po.version_variant_type_id
          AND lower(live.value) = lower(po.value)
      )
      RETURNING id, variant_type_id, value
    ),
    linked AS (
      SELECT po.version_id, i.id AS parent_id
      FROM published_orphans po
      JOIN inserted i
        ON i.variant_type_id = po.version_variant_type_id
       AND lower(i.value) = lower(po.value)
      UNION ALL
      SELECT po.version_id, live.id AS parent_id
      FROM published_orphans po
      JOIN "variant_option_values" live
        ON live.variant_type_id = po.version_variant_type_id
       AND lower(live.value) = lower(po.value)
    )
    UPDATE "_variant_option_values_v" v
    SET parent_id = linked.parent_id
    FROM linked
    WHERE v.id = linked.version_id;
  `)

  // Drop any remaining orphan version rows (empty autosaves, stale drafts).
  await db.execute(sql`
    DELETE FROM "_variant_option_values_v"
    WHERE parent_id IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Data repair migration — no safe automatic rollback.
  await db.execute(sql`SELECT 1`)
}
