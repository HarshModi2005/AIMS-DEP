
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env from current directory
dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
    console.log("🔄 Resetting faculty passwords...");

    const facultyUsers = await prisma.user.findMany({
        where: { role: 'FACULTY' },
    });

    console.log(`Found ${facultyUsers.length} faculty users.`);

    if (facultyUsers.length === 0) {
        console.log("No faculty users found!");
        return;
    }

    const newPassword = "password123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    for (const user of facultyUsers) {
        console.log(`Updating password for: ${user.email}`);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
    }

    console.log("\n✅ All faculty passwords set to: password123");
}

main()
    .catch((e) => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
