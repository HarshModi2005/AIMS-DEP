
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

// Load .env manually
try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, "utf-8");
        envConfig.split("\n").forEach((line) => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.warn("Failed to load .env file", e);
}

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
    const satyamEmail = "satyam@iitrpr.ac.in";
    const newAdvisorEmail = "fa.cse.2023@iitrpr.ac.in";

    console.log(`Swapping advisor role from ${satyamEmail} to ${newAdvisorEmail}...`);

    const satyam = await prisma.user.findUnique({ where: { email: satyamEmail } });
    let newAdvisor = await prisma.user.findUnique({ where: { email: newAdvisorEmail } });

    if (!satyam) {
        console.warn(`Warning: User ${satyamEmail} not found!`);
    }

    if (!newAdvisor) {
        console.log(`Creating new advisor user: ${newAdvisorEmail}`);
        newAdvisor = await prisma.user.create({
            data: {
                email: newAdvisorEmail,
                firstName: "CSE 2023",
                lastName: "Faculty Advisor",
                role: "FACULTY_ADVISOR",
                rollNumber: "FA-CSE-2023"
            }
        });
    }

    await prisma.$transaction(async (tx) => {
        // 1. Restore Satyam to FACULTY (if he exists)
        if (satyam) {
            await tx.user.update({
                where: { id: satyam.id },
                data: { role: "FACULTY" }
            });
            // Remove any advisor assignments for him
            await tx.facultyAdvisor.deleteMany({
                where: { userId: satyam.id }
            });
        }

        // 2. Clear any existing advisor for this specific batch
        await tx.facultyAdvisor.deleteMany({
            where: {
                department: "Computer Science and Engineering",
                batchYear: 2023
            }
        });

        // 3. Update new advisor role
        await tx.user.update({
            where: { id: newAdvisor!.id },
            data: { role: "FACULTY_ADVISOR" }
        });

        // 4. Create FacultyAdvisor entry for new advisor
        await tx.facultyAdvisor.upsert({
            where: { userId: newAdvisor!.id },
            update: {
                department: "Computer Science and Engineering",
                batchYear: 2023
            },
            create: {
                userId: newAdvisor!.id,
                department: "Computer Science and Engineering",
                batchYear: 2023
            }
        });
    });

    console.log(`✅ Successfully restored Professor Satyam to FACULTY.`);
    console.log(`✅ Successfully assigned ${newAdvisorEmail} as FACULTY_ADVISOR for CS 2023 batch.`);

    // 5. Setup test student
    const studentEmail = "test.student@iitrpr.ac.in";
    console.log(`Setting up student ${studentEmail} under the advisor...`);

    let studentUser = await prisma.user.findUnique({
        where: { email: studentEmail },
        include: { student: true }
    });

    if (!studentUser) {
        console.log(`Creating new student user: ${studentEmail}`);
        studentUser = await prisma.user.create({
            data: {
                email: studentEmail,
                firstName: "Test",
                lastName: "Student",
                role: "STUDENT",
                rollNumber: "2023CSB1100",
                student: {
                    create: {
                        department: "Computer Science and Engineering",
                        yearOfEntry: 2023,
                        degree: "B.Tech.",
                        degreeType: "BTECH",
                        currentStatus: "REGISTERED"
                    }
                }
            },
            include: { student: true }
        });
    } else {
        console.log(`Updating existing student profile for ${studentEmail}`);
        await prisma.student.upsert({
            where: { userId: studentUser.id },
            update: {
                department: "Computer Science and Engineering",
                yearOfEntry: 2023
            },
            create: {
                userId: studentUser.id,
                department: "Computer Science and Engineering",
                yearOfEntry: 2023,
                degree: "B.Tech.",
                degreeType: "BTECH",
                currentStatus: "REGISTERED"
            }
        });
    }

    console.log(`✅ Successfully assigned ${studentEmail} to CS 2023 batch.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
