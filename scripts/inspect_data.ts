

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^"(.*)"$/, '$1');
            process.env[key] = value;
        }
    });
}

const connectionString = process.env.DATABASE_URL!;

// Parse the database name from the connection string (copied from db.ts)
function getDatabaseName(url: string): string {
    try {
        const urlObj = new URL(url.replace(/^postgres:/, 'postgresql:'));
        return urlObj.pathname.slice(1) || 'template1';
    } catch {
        return 'template1';
    }
}

const databaseName = getDatabaseName(connectionString);
const pool = new Pool({ connectionString, database: databaseName });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


async function main() {
    console.log('--- Inspection Start ---');

    // Find an active session
    const session = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
    });

    if (!session) {
        console.log('No current session found.');
        return;
    }
    console.log(`Current Session: ${session.id} (${session.name})`);

    // Find a course offering in this session with an instructor
    const offering = await prisma.courseOffering.findFirst({
        where: {
            sessionId: session.id,
            // Ensure it has at least one instructor
            instructors: { some: {} }
        },
        include: {
            course: true,
            instructors: { include: { faculty: { include: { user: true } } } }
        }
    });

    if (!offering) {
        console.log('No course offering found in current session.');
        return;
    }
    console.log(`Course Offering: ${offering.id} (${offering.course.courseCode})`);
    console.log(`Instructor: ${offering.instructors[0]?.faculty.user.firstName}`);

    // Find some students not already enrolled
    const students = await prisma.student.findMany({
        take: 5,
        where: {
            enrollments: {
                none: {
                    courseOfferingId: offering.id
                }
            }
        },
        include: { user: true }
    });

    if (students.length === 0) {
        console.log('No available students found.');
    }

    students.forEach(s => {
        console.log(`Student: ${s.id} (${s.user.firstName})`);
    });

    console.log('--- Inspection End ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
