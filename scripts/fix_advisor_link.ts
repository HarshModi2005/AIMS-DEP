
import prisma from "../src/lib/db";

async function main() {
    const advisorEmail = "fa.cse.2023@iitrpr.ac.in";

    console.log(`🔍 Finding correct advisor user ${advisorEmail}...`);
    const advisorUser = await prisma.user.findUnique({
        where: { email: advisorEmail }
    });

    if (!advisorUser) {
        console.error("❌ Advisor User not found!");
        return;
    }

    console.log(`✅ Correct Advisor User ID: ${advisorUser.id}`);

    // Update the record
    console.log("🔄 Updating FacultyAdvisor record for CSE 2023...");
    const updateResult = await prisma.facultyAdvisor.update({
        where: {
            department_batchYear: {
                department: "Computer Science and Engineering",
                batchYear: 2023
            }
        },
        data: {
            userId: advisorUser.id
        }
    });

    console.log("✅ Update complete!");
    console.log(updateResult);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
