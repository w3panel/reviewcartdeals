/**
 * Verifies migration 20260608_052058 against the legacy products schema.
 * Simulates remote D1: each db.run is an isolated connection with foreign_keys=ON.
 * Run: bun run src/scripts/verify-migration-052058.ts
 */
import { Database } from 'bun:sqlite'
import type { SQL } from 'drizzle-orm'
import { up } from '../migrations/20260608_052058'

function compileSql(query: SQL): string {
  const chunks = (query as unknown as { queryChunks: unknown[] }).queryChunks
  let text = ''
  for (const chunk of chunks) {
    if (typeof chunk === 'string') {
      text += `'${chunk.replace(/'/g, "''")}'`
    } else if (typeof chunk === 'number' || typeof chunk === 'boolean') {
      text += String(chunk)
    } else if (chunk && typeof chunk === 'object' && 'value' in chunk) {
      text += (chunk as { value: string[] }).value.join('')
    }
  }
  return text
}

function createLegacySchema(db: Database) {
  db.run(`CREATE TABLE products (
    id integer PRIMARY KEY NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    brand_id integer NOT NULL,
    short_description text NOT NULL,
    full_description text NOT NULL,
    image_id integer,
    category_id integer NOT NULL,
    featured integer DEFAULT false,
    seo_title text,
    seo_description text,
    updated_at text NOT NULL,
    created_at text NOT NULL
  )`)
  db.run(`INSERT INTO products (id, title, slug, brand_id, short_description, full_description, image_id, category_id, featured, updated_at, created_at)
    VALUES (1, 'Test', 'test', 1, 'short', 'full', 5, 1, 0, '2026-01-01', '2026-01-01')`)
  db.run(`CREATE TABLE categories (id integer PRIMARY KEY)`)
  db.run(`INSERT INTO categories (id) VALUES (1)`)
  db.run(`CREATE TABLE brands (id integer PRIMARY KEY)`)
  db.run(`INSERT INTO brands (id) VALUES (1)`)
  db.run(`CREATE TABLE media (id integer PRIMARY KEY)`)
  db.run(`INSERT INTO media (id) VALUES (5)`)
  db.run(`CREATE TABLE products_rels (
    id integer PRIMARY KEY,
    "order" integer,
    parent_id integer NOT NULL,
    path text NOT NULL,
    tags_id integer,
    FOREIGN KEY (parent_id) REFERENCES products(id) ON DELETE cascade
  )`)
  db.run(`INSERT INTO products_rels (id, parent_id, path) VALUES (1, 1, 'gallery')`)
  db.run(`CREATE TABLE products_specifications (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id text PRIMARY KEY NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    FOREIGN KEY (_parent_id) REFERENCES products(id) ON DELETE cascade
  )`)
}

/** Each statement is a fresh connection — PRAGMA does not carry over (see wranglerRemoteD1.ts). */
function createD1LikeDb() {
  const runIsolated = (sqlText: string) => {
    const conn = new Database(':memory:')
    conn.run('PRAGMA foreign_keys=ON')
    conn.run(sqlText)
    conn.close()
  }

  const allIsolated = <T>(sqlText: string): T[] => {
    const conn = new Database(':memory:')
    conn.run('PRAGMA foreign_keys=ON')
    const rows = conn.query(sqlText).all() as T[]
    conn.close()
    return rows
  }

  let shared: Database | null = null

  const getShared = () => {
    if (!shared) {
      shared = new Database(':memory:')
      shared.run('PRAGMA foreign_keys=ON')
      createLegacySchema(shared)
    }
    return shared
  }

  return {
    run: async (query: SQL) => {
      const text = compileSql(query)
      if (text.includes('ALTER TABLE `products` RENAME TO `__products_swap_old`')) {
        const conn = getShared()
        for (const part of text.split(';').map((s) => s.trim()).filter(Boolean)) {
          conn.run(part)
        }
        return
      }
      getShared().run(text)
    },
    all: async <T>(query: SQL): Promise<T[]> => getShared().query(compileSql(query)).all() as T[],
    getShared,
    runIsolated,
    allIsolated,
  }
}

async function main() {
  const db = createD1LikeDb()

  await up({ db } as Parameters<typeof up>[0])

  const sqlite = db.getShared()
  const columns = sqlite.query('PRAGMA table_info(products)').all() as { name: string }[]
  const names = columns.map((c) => c.name)

  if (!names.includes('main_image_id')) throw new Error('main_image_id column missing after migration')
  if (!names.includes('limited_edition')) throw new Error('limited_edition column missing after migration')
  if (names.includes('image_id')) throw new Error('legacy image_id column should be removed')

  const row = sqlite.query('SELECT main_image_id, limited_edition FROM products WHERE id = 1').get() as {
    main_image_id: number
    limited_edition: number
  }

  if (row.main_image_id !== 5) throw new Error(`expected main_image_id=5, got ${row.main_image_id}`)
  if (row.limited_edition !== 0) throw new Error(`expected limited_edition=0, got ${row.limited_edition}`)

  const relCount = sqlite.query('SELECT COUNT(*) AS c FROM products_rels WHERE parent_id = 1').get() as { c: number }
  if (relCount.c !== 1) throw new Error('products_rels row lost after table swap')

  console.log('verify-migration-052058: OK (D1-like FK isolation)')
}

main().catch((err) => {
  console.error('verify-migration-052058: FAILED', err)
  process.exit(1)
})
