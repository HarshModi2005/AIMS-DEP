
import { Client } from 'pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
console.log('Testing connection to:', connectionString?.replace(/:[^:@]*@/, ':****@'))

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
    try {
        await client.connect()
        console.log('Successfully connected via pg!')
        const res = await client.query('SELECT NOW()')
        console.log('Server time:', res.rows[0])
        await client.end()
    } catch (e) {
        console.error('Connection failed:', e)
    }
}

main()
