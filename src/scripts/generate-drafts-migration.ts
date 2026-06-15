import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

type SchemaJson = {
  version: string
  dialect: string
  tables: Record<string, { name: string; columns: Record<string, unknown> }>
}

function stripDraftTables(schema: SchemaJson): SchemaJson {
  const tables: SchemaJson['tables'] = {}

  for (const [key, table] of Object.entries(schema.tables)) {
    if (key.startsWith('_') && key.includes('_v')) {
      continue
    }

    const columns = { ...table.columns }
    delete columns._status

    tables[key] = {
      ...table,
      columns,
    }
  }

  return {
    ...schema,
    tables,
  }
}

async function main() {
  const outDir = path.join(process.cwd(), '.next-build')
  const afterPath = path.join(outDir, 'drafts-schema-after.json')

  if (!fs.existsSync(afterPath)) {
    throw new Error(`Missing ${afterPath}. Run the schema dump step first.`)
  }

  const after = JSON.parse(fs.readFileSync(afterPath, 'utf8')) as SchemaJson
  const before = stripDraftTables(after)

  fs.writeFileSync(
    path.join(outDir, 'drafts-schema-before-synthetic.json'),
    JSON.stringify(before, null, 2),
  )

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

  fs.writeFileSync(
    path.join(outDir, 'drafts-migration-up.json'),
    JSON.stringify(upStatements, null, 2),
  )
  fs.writeFileSync(
    path.join(outDir, 'drafts-migration-down.json'),
    JSON.stringify(downStatements, null, 2),
  )

  const sqlExecute = 'await db.run(sql`'
  const upSQL = (upStatements ?? [])
    .map((statement) => `${sqlExecute}${statement.replaceAll('`', '\\`')}\`)`)
    .join('\n')
  const downSQL = (downStatements ?? [])
    .map((statement) => `${sqlExecute}${statement.replaceAll('`', '\\`')}\`)`)
    .join('\n')

  const publishExisting = ['users', 'media', 'categories', 'brands', 'tags', 'products', 'reviews']
    .map((table) => {
      const statement = `UPDATE \`${table}\` SET \`_status\` = 'published';`
      return `${sqlExecute}${statement.replaceAll('`', '\\`')}\`)`
    })
    .join('\n')

  const migrationName = '20260613_drafts_autosave'
  const migrationDir = path.join(process.cwd(), 'src', 'migrations')
  const migrationPath = path.join(migrationDir, `${migrationName}.ts`)

  const migrationSource = `import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
${upSQL
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
${publishExisting
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
  console.log(`Wrote migration to ${migrationPath}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
