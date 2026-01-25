
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- START DEBUG ---');
    try {
        const result = await prisma.$queryRawUnsafe(`SELECT unnest(enum_range(NULL::"EnrollmentStatus")) as val`);
        console.log('Current ENUM values:', result);

        console.log('Attempting to ADD VALUE...');
        await prisma.$executeRawUnsafe(`ALTER TYPE "EnrollmentStatus" ADD VALUE 'INSTRUCTOR_REJECTED'`);
        console.log('SUCCESS: Added value.');
    } catch (e: any) {
        if (e.message && e.message.includes("already exists")) {
            console.log('INFO: Value already exists.');
        } else {
            console.error('ERROR:', e.message);
        }
    } finally {
        await prisma.$disconnect();
        console.log('--- END DEBUG ---');
    }
}

main();
