
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
    console.log('--- Find Satyam Course Start ---');

    // Find current session
    const session = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
    });

    if (!session) {
        console.log("No current session found");
        return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: 'satyam@iitrpr.ac.in' },
        include: { faculty: true }
    });

    if (!user || !user.faculty) {
        console.log("User Satyam not found or is not faculty.");
        return;
    }

    console.log(`Found Faculty: ${user.firstName} ${user.lastName} (ID: ${user.faculty.id})`);

    // Find course offerings in current session for this faculty
    const offerings = await prisma.courseOffering.findMany({
        where: {
            sessionId: session.id,
            instructors: {
                some: {
                    facultyId: user.faculty.id
                }
            }
        },
        include: { course: true }
    });

    if (offerings.length === 0) {
        console.log("No course offerings found for Satyam in the current session.");
    } else {
        offerings.forEach(o => {
            console.log(`Course Offering: ${o.id}`);
            console.log(`Code: ${o.course.courseCode}, Name: ${o.course.courseName}`);
        });
    }

    console.log('--- Find Satyam Course End ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
