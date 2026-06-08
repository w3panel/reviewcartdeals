import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'
import { lexicalToPlainText } from '@/lib/lexicalToPlainText'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const rows = await db.all<{ id: number; full_description: string }>(
    sql`SELECT id, full_description FROM products`,
  )

  for (const row of rows) {
    const current = row.full_description

    if (typeof current === 'string' && !current.trim().startsWith('{')) {
      continue
    }

    const plainText = lexicalToPlainText(current)

    if (plainText === current) {
      continue
    }

    await db.run(
      sql`UPDATE products SET full_description = ${plainText} WHERE id = ${row.id}`,
    )
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Lexical JSON cannot be reconstructed from plain text.
}
