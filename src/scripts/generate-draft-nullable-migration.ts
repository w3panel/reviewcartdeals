import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const DRAFT_COLLECTIONS = new Set(['categories', 'brands', 'tags', 'products', 'reviews'])

type ColumnDef = { notNull?: boolean; [key: string]: unknown }
type SchemaJson = {
  tables: Record<
    string,
    {
      columns: Record<string, ColumnDef>
      [key: string]: unknown
    }
  >
  [key: string]: unknown
}

/** DB state after drafts_autosave: same tables, but legacy NOT NULL on draft collection fields. */
function schemaWithLegacyNotNull(target: SchemaJson): SchemaJson {
  const tables: SchemaJson['tables'] = {}

  for (const [name, table] of Object.entries(target.tables)) {
    if (!DRAFT_COLLECTIONS.has(name)) {
      tables[name] = table
      continue
    }

    const columns: Record<string, ColumnDef> = {}

    for (const [columnName, column] of Object.entries(table.columns)) {
      if (columnName === 'id' || columnName === 'updated_at' || columnName === 'created_at') {
        columns[columnName] = column
        continue
      }

      columns[columnName] = {
        ...column,
        notNull: column.notNull === false ? true : column.notNull,
      }
    }

    tables[name] = { ...table, columns }
  }

  return { ...target, tables }
}

async function main() {
  const migrationDir = path.join(process.cwd(), 'src', 'migrations')
  const afterPath = path.join(migrationDir, '20260613_drafts_autosave.json')
  const after = JSON.parse(fs.readFileSync(afterPath, 'utf8')) as SchemaJson
  const before = schemaWithLegacyNotNull(after)

  const payload = await getPayload({
    config,
    disableDBConnect: true,
    disableOnInit: true,
  })

  const { generateMigration } = (
    payload.db as {
      requireDrizzleKit: () => {
        generateMigration: (before: unknown, after: unknown) => Promise<string[] | undefined>
      }
    }
  ).requireDrizzleKit()

  const upStatements = await generateMigration(before, after)
  const downStatements = await generateMigration(after, before)

  const outDir = path.join(process.cwd(), '.next-build')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, 'drafts-nullable-up.json'),
    JSON.stringify(upStatements, null, 2),
  )

  const sqlExecute = 'await db.run(sql`'
  const upSQL = (upStatements ?? [])
    .map((statement) => `${sqlExecute}${statement.replaceAll('`', '\\`')}\`)`)
    .join('\n')
  const downSQL = (downStatements ?? [])
    .map((statement) => `${sqlExecute}${statement.replaceAll('`', '\\`')}\`)`)
    .join('\n')

  const migrationName = '20260613_draft_nullable_fields'
  const migrationPath = path.join(migrationDir, `${migrationName}.ts`)

  const migrationSource = `import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
${upSQL
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
${downSQL
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
}
`

  fs.writeFileSync(migrationPath, migrationSource)
  fs.copyFileSync(afterPath, path.join(migrationDir, `${migrationName}.json`))

  console.log(`UP statements: ${upStatements?.length ?? 0}`)
  console.log(`DOWN statements: ${downStatements?.length ?? 0}`)
  console.log(`Wrote ${migrationPath}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
