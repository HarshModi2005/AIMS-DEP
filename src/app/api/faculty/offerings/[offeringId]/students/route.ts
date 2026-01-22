import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { parseRollNumber } from "@/lib/student-utils";

// GET - Fetch all students for a specific course offering with enriched data
export async function GET(
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
                course: {
                    select: {
                        courseCode: true,
                        courseName: true,
                    },
                },
                instructors: true,
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

        // Enrich students with parsed department and year
        const students = offering.enrollments.map((e) => {
            const parsed = parseRollNumber(e.student.user.rollNumber);
            return {
                enrollmentId: e.id,
                studentId: e.studentId,
                rollNumber: e.student.user.rollNumber,
                name: `${e.student.user.firstName} ${e.student.user.lastName}`,
                email: e.student.user.email,
                department: parsed?.department || "Unknown",
                departmentCode: e.student.user.rollNumber.substring(4, 6).toUpperCase(),
                year: parsed?.yearOfEntry || 0,
                enrollmentType: e.enrollmentType,
                enrollmentStatus: e.enrollmentStatus,
                requestedAt: e.enrolledAt,
            };
        });

        // Extract unique departments and years for filter options
        const departments = [...new Set(students.map((s) => s.departmentCode))].sort();
        const years = [...new Set(students.map((s) => s.year))].filter(y => y > 0).sort((a, b) => b - a);

        return NextResponse.json({
            offering: {
                id: offering.id,
                courseCode: offering.course.courseCode,
                courseName: offering.course.courseName,
                maxStrength: offering.maxStrength,
                currentStrength: offering.currentStrength,
            },
            students,
            filterOptions: {
                departments,
                years,
            },
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json(
            { error: "Failed to fetch students" },
            { status: 500 }
        );
    }
}
