import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

type SchemaJson = {
  version: string
  dialect: string
  tables: Record<string, unknown>
}

async function main() {
  const migrationDir = path.join(process.cwd(), 'src', 'migrations')
  const beforePath = path.join(migrationDir, '20260613_draft_nullable_fields.json')
  const before = JSON.parse(fs.readFileSync(beforePath, 'utf8')) as SchemaJson

  const payload = await getPayload({
    config,
    disableOnInit: true,
  })

  const adapter = payload.db as {
    schema: unknown
    requireDrizzleKit: () => {
      generateDrizzleJson: (schema: unknown) => Promise<SchemaJson>
      generateMigration: (before: unknown, after: unknown) => Promise<string[] | undefined>
    }
  }

  const kit = adapter.requireDrizzleKit()
  const after = await kit.generateDrizzleJson(adapter.schema)

  const outDir = path.join(process.cwd(), '.next-build')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'variant-schema-after.json'), JSON.stringify(after, null, 2))

  const upStatements = await kit.generateMigration(before, after)
  const downStatements = await kit.generateMigration(after, before)

  fs.writeFileSync(
    path.join(outDir, 'variant-migration-up.json'),
    JSON.stringify(upStatements, null, 2),
  )
  fs.writeFileSync(
    path.join(outDir, 'variant-migration-down.json'),
    JSON.stringify(downStatements, null, 2),
  )

  const sqlExecute = 'await db.run(sql`'
  const upSQL = (upStatements ?? [])
    .map((statement) => `${sqlExecute}${statement.replaceAll('`', '\\`')}\`)`)
    .join('\n')
  const downSQL = (downStatements ?? [])
    .map((statement) => `${sqlExecute}${statement.replaceAll('`', '\\`')}\`)`)
    .join('\n')

  const migrationName = '20260614_add_variant_collections'
  const migrationPath = path.join(migrationDir, `${migrationName}.ts`)

  const migrationSource = `import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

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
  fs.copyFileSync(
    path.join(outDir, 'variant-schema-after.json'),
    path.join(migrationDir, `${migrationName}.json`),
  )

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
