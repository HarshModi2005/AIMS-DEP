
import "dotenv/config";
import prisma from "@/lib/db";

async function main() {
    console.log("Current Time (Server/Local):", new Date().toString());
    console.log("Current Time (ISO):", new Date().toISOString());

    const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true }
    });
    console.log("Current Session:", currentSession);

    if (currentSession) {
        const globalWindow = await prisma.academicDate.findFirst({
            where: {
                eventType: "GRADES_SUBMISSION",
                sessionId: currentSession.id
            }
        });
        console.log("Global Window for Current Session:", globalWindow);
    }

    // Check a sample course offering
    const offering = await prisma.courseOffering.findFirst({
        include: { session: true }
    });
    console.log("Sample Offering Session:", offering?.session);
    console.log("Offering ID:", offering?.id);

    // Simulate the check logic
    if (offering && currentSession) {
        const now = new Date();
        // The logic used in the API:
        const window = await prisma.academicDate.findFirst({
            where: {
                eventType: "GRADES_SUBMISSION",
                sessionId: offering.sessionId,
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });
        console.log("Is Window Open logic result:", window ? "YES" : "NO");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
