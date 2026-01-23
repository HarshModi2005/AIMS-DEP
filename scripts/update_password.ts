
import { Client } from 'pg'
import 'dotenv/config'

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function main() {
    try {
        await client.connect()
        // Update password for fa.cse.2023@iitrpr.ac.in
        // The hash generated for 'admin' is $2b$10$dkRir0xMW3w7HwI/MsFT6.dwchNmb7377xpwvss3NSHceGv9miQsO
        const query = `
      UPDATE "User"
      SET password = '$2b$10$dkRir0xMW3w7HwI/MsFT6.dwchNmb7377xpwvss3NSHceGv9miQsO'
      WHERE email = 'fa.cse.2023@iitrpr.ac.in';
    `
        await client.query(query)
        console.log('Password updated successfully for fa.cse.2023@iitrpr.ac.in')
    } catch (e) {
        console.error('Update failed:', e)
    } finally {
        await client.end()
    }
}

main()
