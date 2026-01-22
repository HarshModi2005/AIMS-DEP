import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

interface BulkApproveRequest {
    type: "ALL" | "DEPARTMENT" | "YEAR";
    value?: string;
}

// POST - Bulk approve enrollment requests
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ offeringId: string }> }
) {
    try {
        const session = await auth();
        const { offeringId } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body: BulkApproveRequest = await request.json();
        const { type, value } = body;

        if (!type || !["ALL", "DEPARTMENT", "YEAR"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid bulk approve type" },
                { status: 400 }
            );
        }

        if ((type === "DEPARTMENT" || type === "YEAR") && !value) {
            return NextResponse.json(
                { error: "Value is required for DEPARTMENT or YEAR type" },
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

        // Get offering and verify faculty is an instructor
        const offering = await prisma.courseOffering.findUnique({
            where: { id: offeringId },
            include: {
                instructors: true,
                enrollments: {
                    where: {
                        enrollmentStatus: "PENDING",
                    },
                    include: {
                        student: {
                            include: {
                                user: {
                                    select: {
                                        rollNumber: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        enrolledAt: "asc", // FIFO ordering
                    },
                },
            },
        });

        if (!offering) {
            return NextResponse.json(
                { error: "Course offering not found" },
                { status: 404 }
            );
        }

        // Check if faculty is an instructor for this course
        const isInstructor = offering.instructors.some(
            (i) => i.facultyId === faculty.id
        );

        if (!isInstructor) {
            return NextResponse.json(
                { error: "You are not an instructor for this course" },
                { status: 403 }
            );
        }

        // Calculate available seats
        const availableSeats = offering.maxStrength - offering.currentStrength;

        if (availableSeats <= 0) {
            return NextResponse.json(
                { error: "No seats available", approved: 0, remaining: offering.enrollments.length },
                { status: 400 }
            );
        }

        // Filter pending enrollments based on criteria
        let filteredEnrollments = offering.enrollments;

        if (type === "DEPARTMENT") {
            filteredEnrollments = offering.enrollments.filter((e) => {
                const deptCode = e.student.user.rollNumber.substring(4, 6).toUpperCase();
                return deptCode === value?.toUpperCase();
            });
        } else if (type === "YEAR") {
            const yearValue = parseInt(value!, 10);
            filteredEnrollments = offering.enrollments.filter((e) => {
                const yearStr = e.student.user.rollNumber.substring(0, 4);
                const year = parseInt(yearStr, 10);
                return year === yearValue;
            });
        }

        if (filteredEnrollments.length === 0) {
            return NextResponse.json({
                message: "No matching pending enrollments found",
                approved: 0,
                remaining: 0,
            });
        }

        // Take only up to available seats (FIFO - already sorted by enrolledAt)
        const toApprove = filteredEnrollments.slice(0, availableSeats);
        const enrollmentIds = toApprove.map((e) => e.id);

        // Approve in a transaction
        await prisma.$transaction([
            prisma.enrollment.updateMany({
                where: {
                    id: { in: enrollmentIds },
                },
                data: {
                    enrollmentStatus: "ENROLLED",
                },
            }),
            prisma.courseOffering.update({
                where: { id: offeringId },
                data: {
                    currentStrength: { increment: enrollmentIds.length },
                },
            }),
        ]);

        const remainingPending = filteredEnrollments.length - toApprove.length;

        return NextResponse.json({
            message: `Successfully approved ${toApprove.length} enrollment(s)`,
            approved: toApprove.length,
            remaining: remainingPending,
            totalPendingAfter: offering.enrollments.length - toApprove.length,
        });
    } catch (error) {
        console.error("Error bulk approving enrollments:", error);
        return NextResponse.json(
            { error: "Failed to bulk approve enrollments" },
            { status: 500 }
        );
    }
}
