import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch feedback data (active cycle, questions, eligible courses)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type"); // "MID_SEM" or "END_SEM"

        // Build where clause for feedback type
        const typeFilter = type ? { type: type as "MID_SEM" | "END_SEM" } : {};

        // Get active feedback cycle
        const activeCycle = await prisma.feedbackCycle.findFirst({
            where: {
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
                ...typeFilter,
            },
            include: {
                questions: {
                    where: { isActive: true },
                    orderBy: { questionNumber: "asc" },
                },
                session: true,
            },
        });

        if (!activeCycle) {
            return NextResponse.json({
                active: false,
                message: "Feedback is currently not active",
            });
        }

        // Get student's enrollments for current session - include userId for feedback lookup
        const student = await prisma.student.findFirst({
            where: {
                user: {
                    email: session.user.email,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                    },
                },
                enrollments: {
                    where: {
                        courseOffering: {
                            sessionId: activeCycle.sessionId,
                        },
                        enrollmentStatus: { in: ["ENROLLED", "COMPLETED"] },
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
                                    include: {
                                        faculty: {
                                            select: {
                                                id: true,
                                                user: {
                                                    select: {
                                                        firstName: true,
                                                        lastName: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!student) {
            return NextResponse.json({
                active: true,
                cycle: activeCycle,
                questions: activeCycle.questions,
                courseInstructors: [],
            });
        }

        // Get already submitted feedback - use student.user.id directly instead of separate query
        const submittedFeedbacks = await prisma.courseFeedback.findMany({
            where: {
                cycleId: activeCycle.id,
                studentId: student.user.id,
            },
            select: {
                courseOfferingId: true,
                instructorId: true,
            },
        });

        const submittedSet = new Set(
            submittedFeedbacks.map((f) => `${f.courseOfferingId}-${f.instructorId}`)
        );

        // Build course-instructor options (excluding already submitted)
        const courseInstructors: Array<{
            id: string;
            courseCode: string;
            courseName: string;
            instructorId: string;
            instructorName: string;
            isSubmitted: boolean;
        }> = [];

        for (const enrollment of student.enrollments) {
            for (const instructor of enrollment.courseOffering.instructors) {
                const key = `${enrollment.courseOffering.id}-${instructor.faculty.id}`;
                courseInstructors.push({
                    id: key,
                    courseCode: enrollment.courseOffering.course.courseCode,
                    courseName: enrollment.courseOffering.course.courseName,
                    instructorId: instructor.faculty.id,
                    instructorName: `${instructor.faculty.user.firstName} ${instructor.faculty.user.lastName}`,
                    isSubmitted: submittedSet.has(key),
                });
            }
        }

        // Filter out already submitted ones
        const eligibleCourseInstructors = courseInstructors.filter((ci) => !ci.isSubmitted);

        return NextResponse.json({
            active: true,
            cycle: {
                id: activeCycle.id,
                name: activeCycle.name,
                type: activeCycle.type,
                startDate: activeCycle.startDate,
                endDate: activeCycle.endDate,
            },
            questions: activeCycle.questions.map((q) => ({
                id: q.id,
                number: q.questionNumber,
                text: q.questionText,
                type: q.questionType,
                options: q.options,
                isMandatory: q.isMandatory,
            })),
            courseInstructors: eligibleCourseInstructors,
            submittedCount: submittedFeedbacks.length,
            totalCount: courseInstructors.length,
        });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return NextResponse.json(
            { error: "Failed to fetch feedback data" },
            { status: 500 }
        );
    }
}

// POST - Submit feedback
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { cycleId, courseOfferingId, instructorId, responses, additionalComments } = body;

        if (!cycleId || !courseOfferingId || !instructorId || !responses) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify cycle is active
        const cycle = await prisma.feedbackCycle.findUnique({
            where: { id: cycleId },
        });

        if (!cycle || !cycle.isActive) {
            return NextResponse.json(
                { error: "Feedback cycle is not active" },
                { status: 400 }
            );
        }

        const now = new Date();
        if (now < cycle.startDate || now > cycle.endDate) {
            return NextResponse.json(
                { error: "Feedback period has ended or not started" },
                { status: 400 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if already submitted
        const existing = await prisma.courseFeedback.findUnique({
            where: {
                cycleId_studentId_courseOfferingId_instructorId: {
                    cycleId,
                    studentId: user.id,
                    courseOfferingId,
                    instructorId,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Feedback already submitted for this course and instructor" },
                { status: 400 }
            );
        }

        // Create feedback with responses
        const feedback = await prisma.courseFeedback.create({
            data: {
                cycleId,
                studentId: user.id,
                courseOfferingId,
                instructorId,
                isAnonymous: true,
                responses: {
                    create: Object.entries(responses).map(([questionId, response]) => ({
                        questionId,
                        response: String(response),
                    })),
                },
            },
        });

        return NextResponse.json(
            { message: "Feedback submitted successfully", feedbackId: feedback.id },
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
