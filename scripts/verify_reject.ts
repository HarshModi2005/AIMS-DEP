
import fs from "fs";
import path from "path";

// 1. Load env vars BEFORE importing db
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^"|"$/g, "");
        }
    });
}

// 2. Import the app's prisma instance
// We use dynamic import or require to ensure env is set first, though usually imports are hoisted.
// But since we set env at top level, it might be racey with static import.
// Let's use standard import but rely on the fact that this code runs before db module's top-level code?
// Actually, imports are evaluated first.
// So we must set env in a separate file or use a launcher?
// Or we can just set it here and hope db.ts reads it at runtime?
// src/lib/db.ts reads process.env.DATABASE_URL at the top level: `const connectionString = process.env.DATABASE_URL!;`
// So we CANNOT use static import here because that module will evaluate before our code runs.

async function main() {
    // Import using dynamic import to ensure env is set
    const { default: prisma } = await import("../src/lib/db");

    console.log("Finding a PENDING_APPROVAL course...");
    const course = await prisma.courseOffering.findFirst({
        where: { status: "PENDING_APPROVAL" }
    });

    if (!course) {
        console.log("No pending courses found. Searching for ANY course to test update...");
        // Fallback to finding any course, and trying to set it to REJECTED then revert?
        // Risky if we change a live course.
        // Let's try to find a REJECTED course and set it to REJECTED (no-op)?
        const rejectedCourse = await prisma.courseOffering.findFirst({
            where: { status: "REJECTED" }
        });
        if (rejectedCourse) {
            console.log("Found existing REJECTED course. Updating it to REJECTED again...");
            const updated = await prisma.courseOffering.update({
                where: { id: rejectedCourse.id },
                data: { status: "REJECTED" }
            });
            console.log("Success! Status is:", updated.status);
            return;
        }

        console.log("No testable courses found. Exiting.");
        return;
    }

    console.log(`Found pending course: ${course.id} (${course.courseId})`);

    console.log("Attempting to update status to REJECTED...");
    try {
        const updated = await prisma.courseOffering.update({
            where: { id: course.id },
            data: { status: "REJECTED" }
        });
        console.log("Success! Updated status to:", updated.status);

        // Revert it back
        console.log("Reverting status to PENDING_APPROVAL...");
        await prisma.courseOffering.update({
            where: { id: course.id },
            data: { status: "PENDING_APPROVAL" }
        });
        console.log("Reverted successfully.");

    } catch (e) {
        console.error("Failed to update status. Error details:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
