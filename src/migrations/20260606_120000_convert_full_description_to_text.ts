import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-d1-sqlite'
import { lexicalToPlainText } from '@/lib/lexicalToPlainText'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({
    collection: 'products',
    limit: 1000,
    depth: 0,
    pagination: false,
  })

  for (const product of docs) {
    const current = product.fullDescription as unknown

    if (typeof current === 'string' && !current.trim().startsWith('{')) {
      continue
    }

    const plainText = lexicalToPlainText(current)

    if (plainText === current) {
      continue
    }

    await payload.update({
      collection: 'products',
      id: product.id,
      data: {
        fullDescription: plainText,
      },
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Lexical JSON cannot be reconstructed from plain text.
}
