import { randomUUID } from 'crypto'
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

async function tableExists(db: MigrateUpArgs['db'], name: string): Promise<boolean> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${name}`,
  )
  return rows.length > 0
}

type LegacyVariantRow = {
  id: string
  sku: string | null
  color: string | null
  size: string | null
  material: string | null
  price: number | null
  original_price: number | null
  stock: number | null
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (!(await tableExists(db, 'products_variants_attributes'))) {
    await db.run(sql`CREATE TABLE \`products_variants_attributes\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` text NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`key\` text NOT NULL,
    	\`value\` text NOT NULL,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)

    await db.run(
      sql`CREATE INDEX \`products_variants_attributes_order_idx\` ON \`products_variants_attributes\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`products_variants_attributes_parent_id_idx\` ON \`products_variants_attributes\` (\`_parent_id\`);`,
    )
  }

  const legacyVariants = await db.all<LegacyVariantRow>(
    sql`SELECT id, sku, color, size, material, price, original_price, stock FROM products_variants`,
  )

  for (const variant of legacyVariants) {
    const existing = await db.all<{ id: string }>(
      sql`SELECT id FROM products_variants_attributes WHERE _parent_id = ${variant.id} LIMIT 1`,
    )
    if (existing.length > 0) continue

    const legacyAttributes: Array<{ key: string; value: string }> = []
    if (variant.sku) legacyAttributes.push({ key: 'SKU', value: variant.sku })
    if (variant.color) legacyAttributes.push({ key: 'Color', value: variant.color })
    if (variant.size) legacyAttributes.push({ key: 'Size', value: variant.size })
    if (variant.material) legacyAttributes.push({ key: 'Material', value: variant.material })
    if (variant.price != null) legacyAttributes.push({ key: 'Price', value: String(variant.price) })
    if (variant.original_price != null) {
      legacyAttributes.push({ key: 'Original Price', value: String(variant.original_price) })
    }
    if (variant.stock != null) legacyAttributes.push({ key: 'Stock', value: String(variant.stock) })

    for (let i = 0; i < legacyAttributes.length; i++) {
      const attribute = legacyAttributes[i]
      await db.run(sql`
        INSERT INTO \`products_variants_attributes\` (\`_order\`, \`_parent_id\`, \`id\`, \`key\`, \`value\`)
        VALUES (${i + 1}, ${variant.id}, ${randomUUID()}, ${attribute.key}, ${attribute.value})
      `)
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`products_variants_attributes\`;`)
}
