
import prisma from "../src/lib/db";

async function main() {
    console.log("🧪 Starting Advisor Flow Verification...");

    // 1. Verify User exists
    const advisorEmail = "fa.cse.2023@iitrpr.ac.in";
    const advisor = await prisma.user.findUnique({
        where: { email: advisorEmail },
        include: { facultyAdvisor: true }
    });

    if (!advisor) {
        console.error("❌ Advisor user not found. Did you run seed?");
        return;
    }
    console.log("✅ Advisor user found:", advisor.email, advisor.role);

    if (advisor.role !== "FACULTY_ADVISOR") {
        console.error("❌ Advisor role is incorrect:", advisor.role);
    }

    if (!advisor.facultyAdvisor) {
        console.error("❌ FacultyAdvisor profile missing");
    } else {
        console.log("✅ FacultyAdvisor profile confirmed:", advisor.facultyAdvisor.department, advisor.facultyAdvisor.batchYear);
    }

    // 2. Check for PENDING_ADVISOR enrollments
    let pendingEnrollment = await prisma.enrollment.findFirst({
        where: {
            enrollmentStatus: "PENDING_ADVISOR",
            courseOffering: {
                course: { courseCode: "CS301" }
            }
        },
        include: { student: { include: { user: true } } }
    });

    if (!pendingEnrollment) {
        console.log("⚠️ No PENDING_ADVISOR enrollment found. Checking for existing enrollment to reset...");

        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                courseOffering: { course: { courseCode: "CS301" } },
                student: { user: { email: "2023csb1122@iitrpr.ac.in" } } // Harsh
            }
        });

        if (existingEnrollment) {
            console.log(`🔄 Resetting enrollment status from ${existingEnrollment.enrollmentStatus} to PENDING_ADVISOR for testing...`);
            await prisma.enrollment.update({
                where: { id: existingEnrollment.id },
                data: { enrollmentStatus: "PENDING_ADVISOR" }
            });
            console.log("✅ Reset complete.");

            // Re-fetch to continue logic
            pendingEnrollment = await prisma.enrollment.findUnique({
                where: { id: existingEnrollment.id },
                include: { student: { include: { user: true } } }
            });
        } else {
            console.error("❌ Could not find ANY enrollment for CS301 (Harsh) to test.");
            return;
        }
    }

    if (pendingEnrollment) {
        verifyApproval(pendingEnrollment);
    }
}

async function verifyApproval(enrollment: any) {
    console.log("✅ Found pending enrollment:", enrollment.id);
    console.log("   Student:", enrollment.student.user.firstName);

    // 3. Simulate Approval
    console.log("🔄 Simulating Advisor Approval...");

    // Update status
    await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { enrollmentStatus: "ENROLLED" }
    });

    console.log("✅ Enrollment updated to ENROLLED.");

    // 4. Verify Final State
    const finalState = await prisma.enrollment.findUnique({
        where: { id: enrollment.id }
    });

    if (finalState?.enrollmentStatus === "ENROLLED") {
        console.log("🎉 Verification Success: Student is ENROLLED.");
    } else {
        console.error("❌ Verification Failed: Status is", finalState?.enrollmentStatus);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
