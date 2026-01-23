
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
    console.log('--- Verification Start ---');

    // CS303 (Database Management Systems) - Satyam Agarwal
    const courseOfferingId = 'cmke2vgrs000jocrkfeog5f14';

    const pendingEnrollments = await prisma.enrollment.findMany({
        where: {
            courseOfferingId: courseOfferingId,
            enrollmentStatus: 'PENDING'
        },
        include: {
            student: { include: { user: true } }
        }
    });

    console.log(`Found ${pendingEnrollments.length} pending enrollments.`);
    pendingEnrollments.forEach(e => {
        console.log(`- ${e.student.user.firstName} (ID: ${e.studentId})`);
    });

    console.log('--- Verification End ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
