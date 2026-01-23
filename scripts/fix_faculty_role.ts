
import prisma from "../src/lib/db";

async function main() {
    const email = "satyam@iitrpr.ac.in";

    console.log(`🔍 Finding user ${email}...`);
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.error("❌ User not found!");
        return;
    }

    console.log(`Current role: ${user.role}`);

    if (user.role === "FACULTY_ADVISOR") {
        console.log("🔄 Changing role back to FACULTY...");
        await prisma.user.update({
            where: { id: user.id },
            data: { role: "FACULTY" }
        });
        console.log("✅ Role updated to FACULTY.");
    } else {
        console.log("✅ Role is already correct:", user.role);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
