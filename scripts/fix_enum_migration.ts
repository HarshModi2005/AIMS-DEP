
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

// Use Direct URL for schema operations to bypass connection pooler restrictions
if (process.env.DIRECT_URL) {
    process.env.DATABASE_URL = process.env.DIRECT_URL
    console.log("Using DIRECT_URL for database connection.")
}

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Attempting to update EnrollmentType enum...")

        try {
            await prisma.$executeRawUnsafe(`ALTER TYPE "EnrollmentType" ADD VALUE IF NOT EXISTS 'CREDIT_FOR_MINOR'`)
            console.log("Added CREDIT_FOR_MINOR")
        } catch (e) {
            console.log("CREDIT_FOR_MINOR check/add completed. (May already exist)")
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TYPE "EnrollmentType" ADD VALUE IF NOT EXISTS 'CREDIT_FOR_SPECIALIZATION'`)
            console.log("Added CREDIT_FOR_SPECIALIZATION")
        } catch (e) {
            console.log("CREDIT_FOR_SPECIALIZATION check/add completed. (May already exist)")
        }

        console.log("Done updating.")

    } catch (e) {
        console.error("Critical error:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
