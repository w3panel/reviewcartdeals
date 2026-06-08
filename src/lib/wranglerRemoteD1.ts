import 'server-only'

import { execFileSync } from 'node:child_process'
import path from 'node:path'

type WranglerD1Response = {
  results?: Record<string, unknown>[]
  success: boolean
  meta?: {
    last_row_id?: number
    rows_written?: number
    changes?: number
    duration?: number
  }
  error?: string
}

function formatSqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (value instanceof Uint8Array) return `X'${Buffer.from(value).toString('hex')}'`
  return `'${String(value).replace(/'/g, "''")}'`
}

function substituteParams(sql: string, params: unknown[]): string {
  let index = 0
  return sql.replace(/\?/g, () => {
    if (index >= params.length) {
      throw new Error(`Missing SQL bind parameter at index ${index}`)
    }
    return formatSqlValue(params[index++])
  })
}

function runWranglerQuery(sql: string, environment?: string): WranglerD1Response {
  const wranglerBin = path.join(process.cwd(), 'node_modules', '.bin', 'wrangler')
  const args = ['d1', 'execute', 'D1', '--remote', '--json', '--command', sql]

  if (environment) {
    args.push('--env', environment)
  }

  try {
    const output = execFileSync(wranglerBin, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const parsed = JSON.parse(output.trim()) as WranglerD1Response[] | WranglerD1Response
    const response = Array.isArray(parsed) ? parsed[0] : parsed

    if (!response?.success) {
      throw new Error(response?.error ?? `Wrangler D1 query failed: ${sql}`)
    }

    return response
  } catch (error) {
    const execError = error as { stderr?: string; stdout?: string; message?: string }
    const details = execError.stderr?.trim() || execError.stdout?.trim() || execError.message
    throw new Error(`Wrangler D1 query failed${details ? `: ${details}` : ''}`)
  }
}

class WranglerRemotePreparedStatement {
  private params: unknown[] = []

  constructor(
    private readonly sql: string,
    private readonly environment?: string,
  ) {}

  bind(...values: unknown[]): D1PreparedStatement {
    const next = new WranglerRemotePreparedStatement(this.sql, this.environment)
    next.params = values
    return next as unknown as D1PreparedStatement
  }

  private execute() {
    const statement = substituteParams(this.sql, this.params)
    const response = runWranglerQuery(statement, this.environment)

    return {
      success: true as const,
      results: response.results ?? [],
      meta: {
        last_row_id: response.meta?.last_row_id ?? 0,
        rows_written: response.meta?.rows_written ?? response.meta?.changes ?? 0,
        changes: response.meta?.changes ?? response.meta?.rows_written ?? 0,
        duration: response.meta?.duration ?? 0,
      },
    }
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const result = this.execute()
    return (result.results[0] as T | undefined) ?? null
  }

  async run<T = Record<string, unknown>>() {
    return this.execute() as D1Result<T>
  }

  async all<T = Record<string, unknown>>() {
    return this.execute() as D1Result<T>
  }

  async raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<T[]> {
    const result = this.execute()
    const rows = result.results

    if (options?.columnNames) {
      const columnNames = rows[0] ? Object.keys(rows[0]) : []
      return [columnNames, ...rows.map((row) => columnNames.map((key) => row[key]))] as T[]
    }

    return rows.map((row) => Object.values(row)) as T[]
  }
}

class WranglerRemoteD1Database {
  constructor(private readonly environment?: string) {}

  prepare(query: string): D1PreparedStatement {
    return new WranglerRemotePreparedStatement(
      query,
      this.environment,
    ) as unknown as D1PreparedStatement
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = []

    for (const statement of statements) {
      results.push(await (statement as unknown as WranglerRemotePreparedStatement).run<T>())
    }

    return results
  }

  async exec(query: string): Promise<D1ExecResult> {
    const response = runWranglerQuery(query, this.environment)
    return {
      count: response.meta?.changes ?? 0,
      duration: response.meta?.duration ?? 0,
    }
  }

  withSession(): D1Database {
    return this as unknown as D1Database
  }

  async dump(): Promise<ArrayBuffer> {
    throw new Error('dump() is not supported by WranglerRemoteD1Database')
  }
}

export function createWranglerRemoteD1Binding(environment?: string): D1Database {
  return new WranglerRemoteD1Database(environment) as unknown as D1Database
}
