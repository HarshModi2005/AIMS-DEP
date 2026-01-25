
import { Client } from 'pg'
import 'dotenv/config'

async function main() {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
    console.log("Connecting to:", connectionString?.split('@')[1]) // Log only host part for safety

    const client = new Client({
        connectionString: connectionString,
    })

    try {
        await client.connect()
        console.log("Connected successfully.")

        try {
            await client.query(`ALTER TYPE "EnrollmentType" ADD VALUE IF NOT EXISTS 'CREDIT_FOR_MINOR'`)
            console.log("Added CREDIT_FOR_MINOR")
        } catch (e: any) {
            console.log("Error adding CREDIT_FOR_MINOR (might exist):", e.message)
        }

        try {
            await client.query(`ALTER TYPE "EnrollmentType" ADD VALUE IF NOT EXISTS 'CREDIT_FOR_SPECIALIZATION'`)
            console.log("Added CREDIT_FOR_SPECIALIZATION")
        } catch (e: any) {
            console.log("Error adding CREDIT_FOR_SPECIALIZATION (might exist):", e.message)
        }

        console.log("Done.")

    } catch (e) {
        console.error("Connection error:", e)
    } finally {
        await client.end()
    }
}

main()
