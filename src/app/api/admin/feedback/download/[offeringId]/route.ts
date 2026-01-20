import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ offeringId: string }> }
) {
    try {
        const session = await auth();

        // Check Admin Role
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { offeringId } = await context.params;

        // Fetch the course offering
        const offering = await prisma.courseOffering.findUnique({
            where: { id: offeringId },
            include: {
                course: {
                    select: {
                        courseCode: true,
                        courseName: true,
                    },
                },
                session: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!offering) {
            return NextResponse.json({ error: "Course offering not found" }, { status: 404 });
        }

        // Fetch all feedback for this offering
        const feedbacks = await prisma.simpleFeedback.findMany({
            where: {
                courseOfferingId: offeringId,
            },
            select: {
                feedback: true,
                submittedAt: true,
                // Explicitly exclude student info for anonymization
            },
            orderBy: {
                submittedAt: "desc",
            },
        });

        if (feedbacks.length === 0) {
            return NextResponse.json({ error: "No feedback available for this course" }, { status: 404 });
        }

        // Create text file content
        const textContent = [
            `Course Feedback Report`,
            `======================`,
            ``,
            `Course: ${offering.course.courseCode} - ${offering.course.courseName}`,
            `Session: ${offering.session.name}`,
            `Total Feedback Submissions: ${feedbacks.length}`,
            `Generated: ${new Date().toLocaleString()}`,
            ``,
            `NOTE: All feedback is anonymous. Student identities are not included.`,
            ``,
            `${"=".repeat(80)}`,
            ``,
            ...feedbacks.flatMap((fb, index) => [
                `Feedback #${index + 1}`,
                `Submitted: ${new Date(fb.submittedAt).toLocaleString()}`,
                `-`.repeat(80),
                fb.feedback,
                ``,
                `${"=".repeat(80)}`,
                ``,
            ]),
        ].join("\n");

        // Create file name
        const fileName = `feedback_${offering.course.courseCode}_${offering.session.name}.txt`;

        // Return text file
        return new NextResponse(textContent, {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error("Error downloading feedback:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
