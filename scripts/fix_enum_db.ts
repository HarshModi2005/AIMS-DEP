
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Attempting to add INSTRUCTOR_REJECTED to EnrollmentStatus enum...');
    try {
        await prisma.$executeRawUnsafe(`ALTER TYPE "EnrollmentStatus" ADD VALUE 'INSTRUCTOR_REJECTED'`);
        console.log('Successfully added INSTRUCTOR_REJECTED to enum.');
    } catch (e: any) {
        if (e.message.includes("already exists")) {
            console.log('Value INSTRUCTOR_REJECTED already exists in enum.');
        } else {
            console.error('Error executing raw SQL:', e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
