
import prisma from "../src/lib/db";

async function main() {
    const email = "2023csb1122@iitrpr.ac.in"; // Harsh

    console.log(`🔍 Finding student ${email}...`);
    const user = await prisma.user.findUnique({
        where: { email },
        include: { student: true }
    });

    if (!user || !user.student) {
        console.error("❌ Student not found!");
        return;
    }

    // Find current session
    const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true }
    });

    if (!currentSession) {
        console.error("❌ No active academic session found!");
        return;
    }
    console.log(`📅 Current Session: ${currentSession.name}`);

    // Check for existing payment
    const existingPayment = await prisma.payment.findFirst({
        where: {
            studentId: user.student.id,
            sessionId: currentSession.id,
            type: "SEMESTER_FEE",
            status: "SUCCESS"
        }
    });

    if (existingPayment) {
        console.log("✅ Student has already paid/waived the semester fee.");
        console.log(`   Payment ID: ${existingPayment.id}`);
        console.log(`   Amount: ${existingPayment.amount}`);
        return;
    }

    console.log("🔄 Waiving fee...");

    // Create "Waived" payment
    const payment = await prisma.payment.create({
        data: {
            amount: 0,
            currency: "INR",
            status: "SUCCESS",
            type: "SEMESTER_FEE",
            studentId: user.student.id,
            sessionId: currentSession.id,
            razorpayOrderId: `WAIVED_${Date.now()}`,
            razorpayPaymentId: `WAIVED_BY_ADMIN_${Date.now()}`
        }
    });

    console.log("🎉 Fee waived successfully!");
    console.log(`   Payment Record ID: ${payment.id}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
