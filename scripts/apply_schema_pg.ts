
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import 'dotenv/config'

const sql = fs.readFileSync(path.join(process.cwd(), 'setup.sql'), 'utf-8')

// Remove pgbouncer param just in case pg doesn't like it (though it usually ignores query params)
// But actually we are using the transaction pooler, so we probably want to keep it or use the raw URL.
// The check_pg_connection.ts worked with the URL in .env, so we use that.

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function main() {
    try {
        console.log('Connecting...')
        await client.connect()
        console.log('Connected. Applying schema...')

        // Split by semi-colon might be naive if SQL has semi-colons in strings, but generated SQL is usually clean.
        // However, executing the whole string as one query usually works in pg.
        await client.query(sql)

        console.log('Schema applied successfully!')
        await client.end()
    } catch (e) {
        console.error('Migration failed:', e)
        process.exit(1)
    }
}

main()
