import "dotenv/config";
import prisma from "@/lib/db";

async function main() {
    const email = "2023csb1122@iitrpr.ac.in";

    // 1. Find Student
    const student = await prisma.student.findFirst({
        where: { user: { email } },
    });

    if (!student) {
        console.error(`Student with email ${email} not found.`);
        return;
    }

    // 2. Find a Course Offering
    const offering = await prisma.courseOffering.findFirst({
        where: { status: "OPEN_FOR_ENROLLMENT" },
        include: { course: true }
    });

    if (!offering) {
        console.error("No open course offering found.");
        return;
    }

    // 3. Create Pending Payment
    const payment = await prisma.payment.create({
        data: {
            amount: offering.fee > 0 ? offering.fee : 5000, // Default to 5000 if free (just for test)
            currency: "INR",
            status: "PENDING",
            razorpayOrderId: `order_test_${Date.now()}`, // Fake order ID
            studentId: student.id,
            courseOfferingId: offering.id,
        },
    });

    console.log(`Created PENDING payment for ${email} for course ${offering.course.courseCode}.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
