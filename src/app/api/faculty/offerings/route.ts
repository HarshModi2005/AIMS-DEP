import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// POST - Faculty creates a new course offering (floats a course)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only Faculty can float courses
        if (session.user.role !== "FACULTY") {
            return NextResponse.json(
                { error: "Only faculty members can float courses" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            courseId,
            maxStrength = 60,
            offeringDepartment,
        } = body;

        if (!courseId) {
            return NextResponse.json(
                { error: "Course ID is required" },
                { status: 400 }
            );
        }

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

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        // Check if offering already exists for this course+session
        const existingOffering = await prisma.courseOffering.findUnique({
            where: {
                courseId_sessionId: {
                    courseId: courseId,
                    sessionId: currentSession.id,
                },
            },
        });

        if (existingOffering) {
            return NextResponse.json(
                { error: "This course is already being offered this session" },
                { status: 400 }
            );
        }

        // Get faculty profile for current user
        const faculty = await prisma.faculty.findFirst({
            where: {
                user: { email: session.user.email },
            },
        });

        if (!faculty) {
            return NextResponse.json(
                { error: "Faculty profile not found" },
                { status: 404 }
            );
        }

        // Create offering and assign faculty as primary instructor
        const offering = await prisma.courseOffering.create({
            data: {
                courseId: courseId,
                sessionId: currentSession.id,
                offeringDepartment: offeringDepartment || course.department,
                maxStrength: maxStrength,
                currentStrength: 0,
                status: "OPEN_FOR_ENROLLMENT",
                instructors: {
                    create: {
                        facultyId: faculty.id,
                        isPrimary: true,
                    },
                },
            },
            include: {
                course: true,
                session: true,
                instructors: {
                    include: {
                        faculty: {
                            include: { user: true },
                        },
                    },
                },
            },
        });

        return NextResponse.json(
            {
                message: "Course floated successfully",
                offering: {
                    id: offering.id,
                    courseCode: offering.course.courseCode,
                    courseName: offering.course.courseName,
                    session: offering.session.name,
                    maxStrength: offering.maxStrength,
                    status: offering.status,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error floating course:", error);
        return NextResponse.json(
            { error: "Failed to float course" },
            { status: 500 }
        );
    }
}
