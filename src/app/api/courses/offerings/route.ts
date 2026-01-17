import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch course offerings with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");
        const department = searchParams.get("department");
        const code = searchParams.get("code");
        const title = searchParams.get("title");
        const status = searchParams.get("status");
        const instructor = searchParams.get("instructor");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

        // Build the where clause
        const where: Record<string, unknown> = {};

        // Session filter
        if (sessionId) {
            where.sessionId = sessionId;
        } else {
            // Default to current session
            const currentSession = await prisma.academicSession.findFirst({
                where: { isCurrent: true },
            });
            if (currentSession) {
                where.sessionId = currentSession.id;
            }
        }

        // Department filter
        if (department && department !== "All Departments") {
            where.offeringDepartment = department;
        }

        // Status filter
        if (status && status !== "all") {
            where.status = status;
        }

        // Course code/title filter
        if (code || title) {
            where.course = {
                AND: [
                    code ? { courseCode: { contains: code, mode: "insensitive" } } : {},
                    title ? { courseName: { contains: title, mode: "insensitive" } } : {},
                ],
            };
        }

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
                session: {
                    select: {
                        name: true,
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
            orderBy: [
                { course: { courseCode: "asc" } },
            ],
            take: limit,
            skip: (page - 1) * limit,
        });

        // Filter by instructor name if provided (done in memory for simplicity)
        let filteredOfferings = offerings;
        if (instructor) {
            const instructorLower = instructor.toLowerCase();
            filteredOfferings = offerings.filter((o) =>
                o.instructors.some((i) =>
                    `${i.faculty.user.firstName} ${i.faculty.user.lastName}`
                        .toLowerCase()
                        .includes(instructorLower)
                )
            );
        }

        const response = filteredOfferings.map((offering) => ({
            id: offering.id,
            code: offering.course.courseCode,
            name: offering.course.courseName,
            ltp: `${offering.course.lectureHours}-${offering.course.tutorialHours}-${offering.course.practicalHours}-${offering.course.selfStudyHours}-${offering.course.credits}`,
            credits: offering.course.credits,
            department: offering.offeringDepartment,
            session: offering.session.name,
            status: offering.status,
            maxStrength: offering.maxStrength,
            currentStrength: offering.currentStrength,
            instructors: offering.instructors.map((i) => ({
                id: i.faculty.id,
                name: `${i.faculty.user.firstName} ${i.faculty.user.lastName}`,
                isPrimary: i.isPrimary,
            })),
        }));

        return NextResponse.json({
            offerings: response,
            pagination: {
                page,
                limit,
                total: response.length,
            },
        });
    } catch (error) {
        console.error("Error fetching offerings:", error);
        return NextResponse.json(
            { error: "Failed to fetch offerings" },
            { status: 500 }
        );
    }
}
