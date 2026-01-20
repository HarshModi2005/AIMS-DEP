import { PrismaClient, DegreeType, Category, StudentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;

function getDatabaseName(url: string): string {
    try {
        const urlObj = new URL(url.replace(/^postgres:/, 'postgresql:'));
        return urlObj.pathname.slice(1) || 'template1';
    } catch {
        return 'template1';
    }
}

const pool = new Pool({
    connectionString,
    database: getDatabaseName(connectionString),
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Adding sample students...");

    const students = [
        {
            email: "2023csb1122@iitrpr.ac.in",
            rollNumber: "2023CSB1122",
            firstName: "Harsh",
            lastName: "Modi",
        },
        {
            email: "2023csb1125@iitrpr.ac.in",
            rollNumber: "2023CSB1125",
            firstName: "Ishita",
            lastName: "Garg",
        },
        {
            email: "2023csb1127@iitrpr.ac.in",
            rollNumber: "2023CSB1127",
            firstName: "Karan",
            lastName: "Soni",
        },
    ];

    for (const s of students) {
        console.log(`Creating user: ${s.firstName} ${s.lastName} (${s.rollNumber})...`);

        const user = await prisma.user.upsert({
            where: { email: s.email },
            update: {
                firstName: s.firstName,
                lastName: s.lastName,
            },
            create: {
                email: s.email,
                rollNumber: s.rollNumber,
                firstName: s.firstName,
                lastName: s.lastName,
                role: "STUDENT",
            },
        });

        await prisma.student.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                department: "Computer Science and Engineering",
                yearOfEntry: 2023,
                degreeType: DegreeType.BTECH,
                degree: "B.Tech",
                category: Category.GENERAL,
                currentStatus: StudentStatus.REGISTERED,
                cgpa: 8.5,
                creditsEarned: 45,
                cumulativeCreditsEarned: 45,
            },
        });

        console.log(`  ✅ Created ${s.rollNumber}`);
    }

    console.log("✅ Sample students added successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
