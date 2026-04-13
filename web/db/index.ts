import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let _client: ReturnType<typeof postgres> | null = null
let _db: ReturnType<typeof drizzle> | null = null

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error(
        '[DB] DATABASE_URL is not configured. Set DATABASE_URL in your environment.'
      )
    }
    _client = postgres(connectionString, {
      prepare: false,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '20', 10),
      connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10', 10),
      max_lifetime: 60 * 30,
      onnotice: () => {},
      transform: { undefined: undefined },
    })
    _db = drizzle(_client, { schema })
  }
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  },
})

export async function closeDatabase(): Promise<void> {
  if (_client) {
    await _client.end()
    _client = null
    _db = null
  }
}

export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) return false
    const c = postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 1,
      idle_timeout: 5,
      connect_timeout: 5,
    })
    await c`SELECT 1`
    await c.end()
    return true
  } catch (_error: unknown) {
    return false
  }
}
