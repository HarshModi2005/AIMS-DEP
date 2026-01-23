
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
    const email = "test.student@iitrpr.ac.in";
    console.log(`Processing fee payment for ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { student: true }
    });

    if (!user || !user.student) {
        console.error("Student not found!");
        return;
    }

    // Get current active session
    const activeSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true }
    });

    if (!activeSession) {
        console.error("No active academic session found!");
        return;
    }

    console.log(`Found active session: ${activeSession.name}`);

    // Create successful payment
    const payment = await prisma.payment.create({
        data: {
            amount: 50000,
            currency: "INR",
            status: "SUCCESS",
            type: "SEMESTER_FEE",
            studentId: user.student.id,
            sessionId: activeSession.id,
            razorpayOrderId: `order_mock_${Date.now()}`,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
        }
    });

    console.log("✅ Fee marked as PAID!");
    console.log(`Payment ID: ${payment.id}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
