
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        // where: { role: 'FACULTY' }, // Let's list all to be sure, or just search by email if I knew it. Listing all for now, concise.
    });

    console.log("Found users:", users.length);
    for (const user of users) {
        console.log(`- Email: ${user.email}, Role: ${user.role}, Name: ${user.firstName} ${user.lastName}`);
        console.log(`  Target Role: ${user.role}`);
        console.log(`  Password Hash (First 5 chars): ${user.password?.substring(0, 7)}...`);
        console.log(`  Password Length: ${user.password?.length}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
