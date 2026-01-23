
import prisma from "../src/lib/db";

async function main() {
    const email = "fa.cse.2023@iitrpr.ac.in";

    console.log(`🔍 Checking state for ${email}...`);
    const user = await prisma.user.findUnique({
        where: { email },
        include: { facultyAdvisor: true }
    });

    if (!user) {
        console.error("❌ User not found!");
        return;
    }

    console.log(`✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email: ${user.email}`);

    if (user.role !== "FACULTY_ADVISOR") {
        console.error(`❌ ROLE MISMATCH: Expected FACULTY_ADVISOR, got ${user.role}`);
        console.log("   (This might be why they can't access advisor API)");
    }

    if (!user.facultyAdvisor) {
        console.error("❌ No FacultyAdvisor record linked to this user!");

        // Check if a record exists but detached?
        const detached = await prisma.facultyAdvisor.findFirst({
            where: { department: "Computer Science and Engineering", batchYear: 2023 }
        });
        if (detached) {
            console.log("⚠️ Found a detached FacultyAdvisor record for CSE 2023:");
            console.log(detached);
        } else {
            console.log("❌ No FacultyAdvisor record found for CSE 2023 at all.");
        }
    } else {
        console.log("✅ FacultyAdvisor Record Found:");
        console.log(user.facultyAdvisor);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
