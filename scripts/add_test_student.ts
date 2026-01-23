
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import fs from "fs";
import path from "path";

// Load .env manually since we're running a standalone script
try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, "utf-8");
        envConfig.split("\n").forEach((line) => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
                process.env[key] = value;
            }
        });
        console.log("Loaded environment variables from .env");
    }
} catch (e) {
    console.warn("Failed to load .env file", e);
}

// Database setup (copied from src/lib/db.ts to work in script context)
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
    // Test Student Credentials
    const email = "test.student@iitrpr.ac.in";
    const rollNumber = "2024CSB9999";
    const password = "password";

    console.log(`Creating test student: ${email}...`);

    const hashedPassword = await hash(password, 10);

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.upsert({
                where: { email },
                update: {
                    password: hashedPassword,
                    role: "STUDENT",
                    rollNumber
                },
                create: {
                    email,
                    rollNumber,
                    firstName: "Test",
                    lastName: "Student",
                    role: "STUDENT",
                    password: hashedPassword,
                    profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Test"
                }
            });

            console.log(`User ID: ${user.id}`);

            // 2. Create Student Profile
            // We need to check if profile exists because upsert only works on unique constraints
            // and userId is likely unique in Student table, but let's check schema/ensure logic.
            // Student table usually has userId as unique.

            const existingStudent = await tx.student.findUnique({
                where: { userId: user.id }
            });

            if (!existingStudent) {
                await tx.student.create({
                    data: {
                        userId: user.id,
                        department: "Computer Science and Engineering",
                        yearOfEntry: 2024,
                        degree: "B.Tech",
                        degreeType: "BTECH",
                        currentStatus: "REGISTERED"
                    }
                });
                console.log("Student profile created.");
            } else {
                console.log("Student profile already exists.");
            }
        });

        console.log("\n✅ Success! You can now login with:");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (e) {
        console.error("Error creating student:", e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
