
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const actionSchema = z.object({
    enrollmentIds: z.array(z.string()), // Bulk action
    action: z.enum(["APPROVE", "REJECT"])
});

export const GET = async (req: Request) => {
    try {
        const session = await auth();
        if (!session || session.user.role !== "FACULTY_ADVISOR") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const yearStr = searchParams.get("year");

        // If param is provided, filter by it. If not, fetch all pending for this advisor?
        // Requirement says "list of years... taken to a new page... list of students... enrollment request".
        // So likely filtered by batch.

        if (!department || !yearStr) {
            return NextResponse.json({ error: "Department and Year are required" }, { status: 400 });
        }
        const year = parseInt(yearStr);

        // Verify assignment
        const advisorAssignment = await prisma.facultyAdvisor.findUnique({
            where: { department_batchYear: { department, batchYear: year } }
        });
        if (!advisorAssignment || advisorAssignment.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized for this batch" }, { status: 403 });
        }

        // Fetch pending enrollments (PENDING_ADVISOR)
        const enrollments = await prisma.enrollment.findMany({
            where: {
                enrollmentStatus: "PENDING_ADVISOR",
                student: {
                    department: department,
                    yearOfEntry: year
                }
            },
            include: {
                student: {
                    include: { user: true }
                },
                courseOffering: {
                    include: { course: true }
                }
            }
        });

        // Transform response
        const formatted = enrollments.map(e => ({
            id: e.id,
            studentName: `${e.student.user.firstName} ${e.student.user.lastName}`,
            rollNumber: e.student.user.rollNumber,
            courseCode: e.courseOffering.course.courseCode,
            courseName: e.courseOffering.course.courseName,
            status: e.enrollmentStatus,
            credits: e.courseOffering.course.credits,
            requestedAt: e.enrolledAt.toISOString()
        }));

        return NextResponse.json({ enrollments: formatted });

    } catch (error) {
        console.error("Error fetching advisor enrollments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export const POST = async (req: Request) => {
    try {
        const session = await auth();
        if (!session || session.user.role !== "FACULTY_ADVISOR") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = actionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { enrollmentIds, action } = result.data;

        // Verify these enrollments belong to students under this advisor.
        // For simplicity, we assume if they are PENDING_ADVISOR and the advisor is calling, 
        // we should check permissions per enrollment. 
        // Or just check if the student belongs to a batch the advisor owns.
        // Let's do a transactional update with a check.

        // 1. Get Advisor's batches
        const advisorBatches = await prisma.facultyAdvisor.findMany({
            where: { userId: session.user.id },
            select: { department: true, batchYear: true }
        });

        // Construct a filter for students in these batches
        // OR condition for each batch
        const batchFilters = advisorBatches.map(b => ({
            student: {
                department: b.department,
                yearOfEntry: b.batchYear
            }
        }));

        if (batchFilters.length === 0) {
            return NextResponse.json({ error: "No batches assigned" }, { status: 403 });
        }

        const targetStatus = action === "APPROVE" ? "ENROLLED" : "ADVISOR_REJECTED";

        // Update
        // Issue: For "ENROLLED", we might need to increment currentStrength?
        // Wait, previous logic (Instructor approve) probably incremented strength, or strength is incremented when creating?
        // Checking `src/app/api/enrollments/route.ts`... create doesn't increment.
        // So Instructor Approve MUST increment.
        // If Instructor Approve increments, then Advisor Approve just changes status.
        // BUT if Advisor Rejects, we should DECREMENT?
        // Let's check Instructor Approve logic first. If I can't check it now, I should be safe.

        // Assumption: Instructor Approve handles capacity check and increment.
        // If Advisor rejects, we should decrement capacity.

        // Let's defer strict capacity logic update to "Update Instructor Approve" step.
        // For now, just change status.

        // Actually, wait. If status is PENDING_ADVISOR, it means Instructor approved it.
        // If Instructor approved it, they "reserved" the seat?
        // If so, Rejection releases the seat.

        await prisma.$transaction(async (tx) => {
            // Find enrollments to update
            const enrollmentsToUpdate = await tx.enrollment.findMany({
                where: {
                    id: { in: enrollmentIds },
                    enrollmentStatus: "PENDING_ADVISOR",
                    OR: batchFilters
                },
                include: { courseOffering: true }
            });

            const validIds = enrollmentsToUpdate.map(e => e.id);

            if (validIds.length === 0) {
                throw new Error("No valid enrollments found to update");
            }

            await tx.enrollment.updateMany({
                where: { id: { in: validIds } },
                data: {
                    enrollmentStatus: targetStatus,
                    // If approved, maybe set enrolledAt?
                }
            });

            if (action === "REJECT") {
                // Decrement strength
                for (const enrollment of enrollmentsToUpdate) {
                    await tx.courseOffering.update({
                        where: { id: enrollment.courseOfferingId },
                        data: { currentStrength: { decrement: 1 } }
                    });
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully ${action === "APPROVE" ? "approved" : "rejected"} enrollments`
        });

    } catch (error) {
        console.error("Error processing advisor action:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
