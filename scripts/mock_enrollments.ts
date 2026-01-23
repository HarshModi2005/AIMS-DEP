
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
    console.log('--- Mocking Enrolments Start ---');

    // CS303 (Database Management Systems) - Satyam Agarwal
    const courseOfferingId = 'cmke2vgrs000jocrkfeog5f14';
    const studentIds = [
        'cmke2vgqv0005ocrkdlcho83p',
        'cmke2vgqv0006ocrk84wzyvci',
        'cmkk119mb00073cuwx96an0pq',
        'cmkkouhmm0001vtjg8mr7gujm',
        'cmkmyr1yz00039grksns9o8d0'
    ];

    for (const studentId of studentIds) {
        // Use raw SQL as requested, though Prisma create is also fine. 
        // The user specifically asked for "make an sql query from the terminal", 
        // but running it via node script is safer for connection handling.
        // We will use Prisma's executeRaw to run the SQL.

        const id = `mock_${Math.random().toString(36).substring(7)}`;

        try {
            const result = await prisma.$executeRaw`
            INSERT INTO "Enrollment" ("id", "studentId", "courseOfferingId", "enrollmentStatus", "enrollmentType", "courseCategory", "enrolledAt", "isCompleted")
            VALUES (${id}, ${studentId}, ${courseOfferingId}, 'PENDING'::"EnrollmentStatus", 'CREDIT'::"EnrollmentType", 'PC'::"CourseCategory", NOW(), false)
            ON CONFLICT ("studentId", "courseOfferingId") DO NOTHING;
        `;
            console.log(`Inserted/Processed student ${studentId}: ${result}`);
        } catch (e) {
            console.error(`Failed to insert for student ${studentId}:`, e);
        }
    }

    console.log('--- Mocking Enrolments End ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
