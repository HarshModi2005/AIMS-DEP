
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Checking EnrollmentType enum in database...")
        // This query is specific to PostgreSQL to check enum labels
        const result = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'EnrollmentType'
    `
        console.log("Current Enum Values:", result)
    } catch (e) {
        console.error("Error checking enum:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
