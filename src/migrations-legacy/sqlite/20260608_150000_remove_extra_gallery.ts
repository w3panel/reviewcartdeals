import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Remove duplicates: extraGallery rows whose media_id already exists on gallery for same product
  await db.run(sql`
    DELETE FROM \`products_rels\`
    WHERE \`path\` = 'extraGallery'
      AND EXISTS (
        SELECT 1 FROM \`products_rels\` AS g
        WHERE g.\`parent_id\` = \`products_rels\`.\`parent_id\`
          AND g.\`path\` = 'gallery'
          AND g.\`media_id\` = \`products_rels\`.\`media_id\`
      )
  `)

  // Merge remaining extraGallery rows into gallery
  await db.run(sql`
    UPDATE \`products_rels\`
    SET \`path\` = 'gallery'
    WHERE \`path\` = 'extraGallery'
  `)

  // Re-order gallery rows per product
  const parents = await db.all<{ parent_id: number }>(
    sql`SELECT DISTINCT parent_id FROM products_rels WHERE path = 'gallery' AND media_id IS NOT NULL`,
  )

  for (const { parent_id } of parents) {
    const rows = await db.all<{ id: number }>(
      sql`SELECT id FROM products_rels WHERE parent_id = ${parent_id} AND path = 'gallery' AND media_id IS NOT NULL ORDER BY "order" ASC, id ASC`,
    )
    for (let i = 0; i < rows.length; i++) {
      await db.run(sql`UPDATE products_rels SET "order" = ${i + 1} WHERE id = ${rows[i].id}`)
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Cannot reliably split merged gallery back into extraGallery — no-op
  void db
}
