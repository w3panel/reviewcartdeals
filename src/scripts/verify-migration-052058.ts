/**
 * Verifies migration 20260608_052058 against the legacy products schema.
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
  db.run(`CREATE TABLE products_rels (id integer PRIMARY KEY, "order" integer, parent_id integer NOT NULL, path text NOT NULL, tags_id integer)`)
}

async function main() {
  const sqlite = new Database(':memory:')

  const db = {
    run: async (query: SQL) => sqlite.run(compileSql(query)),
    all: async <T>(query: SQL): Promise<T[]> => sqlite.query(compileSql(query)).all() as T[],
  }

  createLegacySchema(sqlite)

  await up({ db } as Parameters<typeof up>[0])

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

  const logLine = JSON.stringify({
    sessionId: 'd5a77f',
    runId: 'post-fix',
    hypothesisId: 'H1-H2',
    location: 'verify-migration-052058.ts',
    message: 'migration 052058 verified on legacy schema',
    data: { main_image_id: row.main_image_id, limited_edition: row.limited_edition, columns: names },
    timestamp: Date.now(),
  })
  await Bun.write('debug-d5a77f.log', `${logLine}\n`, { createPath: true })
  // #region agent log
  fetch('http://127.0.0.1:7929/ingest/bf262c1b-20b1-46ac-86eb-643238e1e95c', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd5a77f' },
    body: logLine,
  }).catch(() => {})
  // #endregion

  console.log('verify-migration-052058: OK')
}

main().catch((err) => {
  console.error('verify-migration-052058: FAILED', err)
  process.exit(1)
})
