import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch pending enrollments for faculty's courses
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get faculty profile
        const faculty = await prisma.faculty.findFirst({
            where: { user: { email: session.user.email } },
        });

        if (!faculty) {
            return NextResponse.json(
                { error: "Faculty profile not found" },
                { status: 404 }
            );
        }

        // Get offerings where this faculty is an instructor
        const offerings = await prisma.courseOffering.findMany({
            where: {
                instructors: {
                    some: { facultyId: faculty.id },
                },
                status: {
                    in: ["OPEN_FOR_ENROLLMENT", "ENROLLMENT_CLOSED"]
                }
            },
            include: {
                course: {
                    select: {
                        courseCode: true,
                        courseName: true,
                    },
                },
                enrollments: {
                    include: {
                        student: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        rollNumber: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Format response
        const response = offerings.map((offering) => ({
            offeringId: offering.id,
            courseCode: offering.course.courseCode,
            courseName: offering.course.courseName,
            maxStrength: offering.maxStrength,
            currentStrength: offering.currentStrength,
            feedbackOpen: offering.feedbackOpen,
            students: offering.enrollments.map((e) => ({
                enrollmentId: e.id,
                studentId: e.studentId,
                rollNumber: e.student.user.rollNumber,
                name: `${e.student.user.firstName} ${e.student.user.lastName}`,
                email: e.student.user.email,
                enrollmentType: e.enrollmentType,
                enrollmentStatus: e.enrollmentStatus,
                requestedAt: e.enrolledAt,
            })),
        }));

        return NextResponse.json({ offerings: response });
    } catch (error) {
        console.error("Error fetching faculty enrollments:", error);
        return NextResponse.json(
            { error: "Failed to fetch enrollments" },
            { status: 500 }
        );
    }
}

// PUT - Approve or reject an enrollment request
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { enrollmentId, action } = body;

        if (!enrollmentId || !action) {
            return NextResponse.json(
                { error: "enrollmentId and action are required" },
                { status: 400 }
            );
        }

        if (!["APPROVE", "REJECT"].includes(action)) {
            return NextResponse.json(
                { error: "action must be APPROVE or REJECT" },
                { status: 400 }
            );
        }

        // Get faculty profile
        const faculty = await prisma.faculty.findFirst({
            where: { user: { email: session.user.email } },
        });

        if (!faculty) {
            return NextResponse.json(
                { error: "Faculty profile not found" },
                { status: 404 }
            );
        }

        // Get enrollment and verify faculty owns the course
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                courseOffering: {
                    include: {
                        instructors: true,
                    },
                },
            },
        });

        if (!enrollment) {
            return NextResponse.json(
                { error: "Enrollment not found" },
                { status: 404 }
            );
        }

        // Check if faculty is an instructor for this course
        const isInstructor = enrollment.courseOffering.instructors.some(
            (i) => i.facultyId === faculty.id
        );

        if (!isInstructor) {
            return NextResponse.json(
                { error: "You are not an instructor for this course" },
                { status: 403 }
            );
        }

        if (action === "APPROVE") {
            if (enrollment.enrollmentStatus !== "PENDING") {
                return NextResponse.json(
                    { error: "Only pending requests can be approved" },
                    { status: 400 }
                );
            }

            // Check capacity before approving
            if (
                enrollment.courseOffering.currentStrength >=
                enrollment.courseOffering.maxStrength
            ) {
                return NextResponse.json(
                    { error: "Course is at maximum capacity" },
                    { status: 400 }
                );
            }

            // Approve: Update status and increment strength
            await prisma.$transaction([
                prisma.enrollment.update({
                    where: { id: enrollmentId },
                    data: { enrollmentStatus: "PENDING_ADVISOR" as any },
                }),
                prisma.courseOffering.update({
                    where: { id: enrollment.courseOfferingId },
                    data: { currentStrength: { increment: 1 } },
                }),
            ]);

            return NextResponse.json({
                message: "Enrollment approved",
                status: "PENDING_ADVISOR",
            });
        } else {
            // Reject: Update status to DROPPED
            // If the student was already counting towards strength (PENDING_ADVISOR or ENROLLED), decrement it
            const countsTowardsStrength = ["PENDING_ADVISOR", "ENROLLED"].includes(enrollment.enrollmentStatus);

            if (countsTowardsStrength) {
                await prisma.$transaction([
                    prisma.enrollment.update({
                        where: { id: enrollmentId },
                        data: { enrollmentStatus: "INSTRUCTOR_REJECTED" as any },
                    }),
                    prisma.courseOffering.update({
                        where: { id: enrollment.courseOfferingId },
                        data: { currentStrength: { decrement: 1 } },
                    }),
                ]);
            } else {
                await prisma.enrollment.update({
                    where: { id: enrollmentId },
                    data: { enrollmentStatus: "INSTRUCTOR_REJECTED" as any },
                });
            }

            return NextResponse.json({
                message: "Enrollment rejected",
                status: "INSTRUCTOR_REJECTED",
            });
        }
    } catch (error) {
        console.error("Error processing enrollment:", error);
        return NextResponse.json(
            { error: "Failed to process enrollment" },
            { status: 500 }
        );
    }
}
