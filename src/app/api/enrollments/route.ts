import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch courses available for enrollment
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        const title = searchParams.get("title");
        const department = searchParams.get("department");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100); // Cap at 100
        const skip = (page - 1) * limit;

        // Get current session
        const currentSession = await prisma.academicSession.findFirst({
            where: { isCurrent: true },
        });

        if (!currentSession) {
            return NextResponse.json(
                { error: "No active academic session" },
                { status: 404 }
            );
        }

        // Get student's existing enrollments with status
        const student = await prisma.student.findFirst({
            where: {
                user: {
                    email: session.user.email,
                },
            },
            include: {
                enrollments: {
                    where: {
                        courseOffering: {
                            sessionId: currentSession.id,
                        },
                    },
                    select: {
                        id: true,
                        courseOfferingId: true,
                        enrollmentStatus: true,
                        enrollmentType: true,
                    },
                },
            },
        });

        // Create maps for enrolled (approved) and pending enrollments
        const enrolledOfferingIds = new Set(
            student?.enrollments
                .filter((e) => e.enrollmentStatus === "ENROLLED")
                .map((e) => e.courseOfferingId) || []
        );
        const pendingOfferingIds = new Set(
            student?.enrollments
                .filter((e) => (e.enrollmentStatus as any) === "PENDING" || (e.enrollmentStatus as any) === "PENDING_ADVISOR")
                .map((e) => e.courseOfferingId) || []
        );

        // Map for exact status
        const statusMap = new Map<string, string>();
        student?.enrollments.forEach(e => {
            statusMap.set(e.courseOfferingId, e.enrollmentStatus);
        });

        // Build filter
        const where: Record<string, unknown> = {
            sessionId: currentSession.id,
            status: "OPEN_FOR_ENROLLMENT",
        };

        if (department && department !== "All Departments") {
            where.offeringDepartment = department;
        }

        if (code || title) {
            where.course = {
                AND: [
                    code ? { courseCode: { contains: code, mode: "insensitive" } } : {},
                    title ? { courseName: { contains: title, mode: "insensitive" } } : {},
                ],
            };
        }

        // Get total count for pagination
        const totalCount = await prisma.courseOffering.count({ where });

        const offerings = await prisma.courseOffering.findMany({
            where,
            include: {
                course: {
                    select: {
                        courseCode: true,
                        courseName: true,
                        lectureHours: true,
                        tutorialHours: true,
                        practicalHours: true,
                        selfStudyHours: true,
                        credits: true,
                    },
                },
                instructors: {
                    include: {
                        faculty: {
                            select: {
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
            orderBy: {
                course: { courseCode: "asc" },
            },
            take: limit,
            skip: skip,
        });

        const response = offerings.map((offering) => ({
            id: offering.id,
            code: offering.course.courseCode,
            name: offering.course.courseName,
            ltp: `${offering.course.lectureHours}-${offering.course.tutorialHours}-${offering.course.practicalHours}-${offering.course.selfStudyHours}-${offering.course.credits}`,
            credits: offering.course.credits,
            department: offering.offeringDepartment,
            status: offering.status,
            maxStrength: offering.maxStrength,
            currentStrength: offering.currentStrength,
            fee: offering.fee,
            isEnrolled: enrolledOfferingIds.has(offering.id),
            isPending: pendingOfferingIds.has(offering.id),
            enrollmentStatus: statusMap.get(offering.id) || null,
            enrollmentType: student?.enrollments.find(e => e.courseOfferingId === offering.id)?.enrollmentType || null,
            instructor: offering.instructors
                .map((i) => `${i.faculty.user.firstName} ${i.faculty.user.lastName}`)
                .join(", "),
        }));

        return NextResponse.json({
            session: currentSession.name,
            courses: response,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching enrollment courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

// POST - Enroll in a course
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { courseOfferingId, enrollmentType = "CREDIT", courseCategory } = body;

        if (!courseOfferingId) {
            return NextResponse.json(
                { error: "Course offering ID is required" },
                { status: 400 }
            );
        }

        // Get student
        const student = await prisma.student.findFirst({
            where: {
                user: {
                    email: session.user.email,
                },
            },
        });

        if (!student) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            );
        }

        // Check if course offering exists and is open for enrollment
        const offering = await prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
            include: { course: true },
        });

        if (!offering) {
            return NextResponse.json(
                { error: "Course offering not found" },
                { status: 404 }
            );
        }

        if (offering.status !== "OPEN_FOR_ENROLLMENT") {
            return NextResponse.json(
                { error: "Enrollment is not open for this course" },
                { status: 400 }
            );
        }

        // Check if Semester Fee is paid
        const semesterFeePayment = await prisma.payment.findFirst({
            where: {
                studentId: student.id,
                sessionId: offering.sessionId,
                type: "SEMESTER_FEE",
                status: "SUCCESS",
            },
        });

        if (!semesterFeePayment) {
            return NextResponse.json(
                { error: "Semester Fee not paid. Please pay the semester fee to enroll." },
                { status: 402 } // Payment Required
            );
        }

        // Check Max Credits Limit (24)
        const currentEnrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                courseOffering: {
                    sessionId: offering.sessionId,
                },
                enrollmentStatus: {
                    in: ["ENROLLED", "PENDING"],
                },
            },
            include: {
                courseOffering: {
                    include: {
                        course: {
                            select: {
                                credits: true,
                            },
                        },
                    },
                },
            },
        });

        const currentCredits = currentEnrollments.reduce(
            (sum, e) => sum + e.courseOffering.course.credits,
            0
        );

        if (currentCredits + offering.course.credits > 24) {
            return NextResponse.json(
                {
                    error: `Cannot register. Maximum credits allowed per semester is 24. You currently have ${currentCredits} credits registered (including pending).`,
                },
                { status: 400 }
            );
        }

        // Check capacity
        if (offering.currentStrength >= offering.maxStrength) {
            return NextResponse.json(
                { error: "Course is full" },
                { status: 400 }
            );
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseOfferingId: {
                    studentId: student.id,
                    courseOfferingId: courseOfferingId,
                },
            },
        });

        if (existingEnrollment) {
            const allowReEnroll = ["DROPPED", "WITHDRAWN", "ADVISOR_REJECTED", "INSTRUCTOR_REJECTED"].includes(existingEnrollment.enrollmentStatus);

            if (!allowReEnroll) {
                return NextResponse.json(
                    { error: "Already enrolled in this course" },
                    { status: 400 }
                );
            }

            // Re-enroll: Update the existing record
            const enrollment = await prisma.enrollment.update({
                where: { id: existingEnrollment.id },
                data: {
                    enrollmentType: enrollmentType,
                    enrollmentStatus: "PENDING",
                    courseCategory: courseCategory || offering.course.courseCategory,
                    enrolledAt: new Date(), // Refresh enrollment time
                    // Reset other fields if necessary
                    grade: null,
                    attendancePercent: null,
                    isCompleted: false,
                    completionStatus: null,
                    completedAt: null
                },
            });

            return NextResponse.json(
                { message: "Re-enrollment request submitted. Awaiting faculty approval.", enrollment },
                { status: 200 }
            );
        }

        // Create new enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                studentId: student.id,
                courseOfferingId: courseOfferingId,
                enrollmentType: enrollmentType,
                enrollmentStatus: "PENDING",
                courseCategory: courseCategory || offering.course.courseCategory,
            },
        });

        return NextResponse.json(
            { message: "Enrollment request submitted. Awaiting faculty approval.", enrollment },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error enrolling:", error);
        // @ts-ignore
        if (error.code) console.error("Error code:", error.code);
        // @ts-ignore
        if (error.meta) console.error("Error meta:", error.meta);

        return NextResponse.json(
            { error: "Failed to enroll" },
            { status: 500 }
        );
    }
}
