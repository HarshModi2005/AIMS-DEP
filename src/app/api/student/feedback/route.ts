import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Get courses with open feedback for current student
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get student profile
        const student = await prisma.student.findFirst({
            where: { user: { email: session.user.email } },
        });

        if (!student) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            );
        }

        // Get enrolled courses - then filter for feedback open
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                enrollmentStatus: "ENROLLED",
            },
            include: {
                courseOffering: {
                    include: {
                        course: {
                            select: {
                                courseCode: true,
                                courseName: true,
                            },
                        },
                        instructors: {
                            where: { isPrimary: true },
                            include: {
                                faculty: {
                                    include: {
                                        user: {
                                            select: { firstName: true, lastName: true },
                                        },
                                    },
                                },
                            },
                        },
                        simpleFeedbacks: {
                            where: { studentId: student.id },
                            select: { id: true },
                        },
                    },
                },
            },
        });

        // Filter for courses with feedback open
        const coursesWithFeedback = enrollments
            .filter((e) => e.courseOffering.feedbackOpen)
            .map((e) => ({
                offeringId: e.courseOffering.id,
                courseCode: e.courseOffering.course.courseCode,
                courseName: e.courseOffering.course.courseName,
                instructor: e.courseOffering.instructors[0]
                    ? `${e.courseOffering.instructors[0].faculty.user.firstName} ${e.courseOffering.instructors[0].faculty.user.lastName}`
                    : "TBA",
                hasSubmitted: e.courseOffering.simpleFeedbacks.length > 0,
            }));

        // Count pending feedback (for notification badge)
        const pendingCount = coursesWithFeedback.filter((c) => !c.hasSubmitted).length;

        return NextResponse.json({
            courses: coursesWithFeedback,
            pendingCount,
        });
    } catch (error) {
        console.error("Error fetching feedback courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

// POST - Submit feedback for a course
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { offeringId, feedback } = body;

        if (!offeringId || !feedback) {
            return NextResponse.json(
                { error: "offeringId and feedback are required" },
                { status: 400 }
            );
        }

        if (feedback.length < 10) {
            return NextResponse.json(
                { error: "Feedback must be at least 10 characters" },
                { status: 400 }
            );
        }

        // Get student profile
        const student = await prisma.student.findFirst({
            where: { user: { email: session.user.email } },
        });

        if (!student) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            );
        }

        // Verify student is enrolled and feedback is open
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                studentId: student.id,
                courseOfferingId: offeringId,
                enrollmentStatus: "ENROLLED",
            },
            include: {
                courseOffering: true,
            },
        });

        if (!enrollment) {
            return NextResponse.json(
                { error: "Not enrolled in this course" },
                { status: 403 }
            );
        }

        if (!enrollment.courseOffering.feedbackOpen) {
            return NextResponse.json(
                { error: "Feedback is not open for this course" },
                { status: 400 }
            );
        }

        // Check if already submitted
        const existing = await prisma.simpleFeedback.findUnique({
            where: {
                courseOfferingId_studentId: {
                    courseOfferingId: offeringId,
                    studentId: student.id,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "You have already submitted feedback for this course" },
                { status: 400 }
            );
        }

        // Create feedback
        await prisma.simpleFeedback.create({
            data: {
                courseOfferingId: offeringId,
                studentId: student.id,
                feedback: feedback.trim(),
            },
        });

        return NextResponse.json(
            { message: "Feedback submitted successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return NextResponse.json(
            { error: "Failed to submit feedback" },
            { status: 500 }
        );
    }
}
