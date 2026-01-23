
import prisma from "../src/lib/db";

async function main() {
    const email = "satyam@iitrpr.ac.in";
    const department = "Computer Science and Engineering";

    console.log(`🔍 Finding user ${email}...`);
    const user = await prisma.user.findUnique({
        where: { email },
        include: { faculty: true }
    });

    if (!user) {
        console.error("❌ User not found!");
        return;
    }

    if (user.role !== "FACULTY") {
        console.warn(`⚠️ User role is ${user.role}, expected FACULTY. Proceeding anyway...`);
    }

    console.log(`✅ User found. Updating department to '${department}'...`);

    // Update or Create Faculty Profile
    await prisma.faculty.upsert({
        where: { userId: user.id },
        update: { department },
        create: {
            userId: user.id,
            department,
            designation: "ASSISTANT_PROFESSOR", // Default if creating new
            specialization: "Unknown"
        }
    });

    console.log("🎉 Faculty department updated successfully.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
