import "dotenv/config";
import prisma from "@/lib/db";

async function main() {
    // 1. Find Current Session
    const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
    });

    if (!currentSession) {
        console.error("No current academic session found.");
        return;
    }

    // 2. Find a Course Offering in this session
    const offering = await prisma.courseOffering.findFirst({
        where: {
            sessionId: currentSession.id,
            status: "OPEN_FOR_ENROLLMENT",
        },
        include: {
            course: true
        }
    });

    if (!offering) {
        console.error("No open course offering found in the current session.");
        return;
    }

    // 3. Update Fee to 5
    await prisma.courseOffering.update({
        where: { id: offering.id },
        data: { fee: 5 },
    });

    console.log(`Updated fee for course ${offering.course.courseCode} - ${offering.course.courseName} to ₹5.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
