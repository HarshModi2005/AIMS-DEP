
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  try {
    console.log('Connecting with URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'))
    await prisma.$connect()
    console.log('Successfully connected to database!')
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
