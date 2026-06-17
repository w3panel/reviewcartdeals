// Load .env files before Payload config reads process.env.
import 'dotenv/config'

// Payload defaults to a single DB connection outside CLI/build phases.
// Integration tests call getPayload in beforeAll and query in each test, so
// they need at least two concurrent connections from the pool.
process.env.DATABASE_POOL_MAX ??= '5'
