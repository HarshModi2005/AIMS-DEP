import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Check Admin Role
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const department = searchParams.get("department") || "";

        // Build where clause
        const whereClause: any = {};

        if (search) {
            whereClause.course = {
                OR: [
                    { courseCode: { contains: search, mode: "insensitive" } },
                    { courseName: { contains: search, mode: "insensitive" } },
                ],
            };
        }

        if (department) {
            whereClause.offeringDepartment = department;
        }

        // Fetch course offerings with related data
        const offerings = await prisma.courseOffering.findMany({
            where: whereClause,
            include: {
                course: {
                    select: {
                        courseCode: true,
                        courseName: true,
                        credits: true,
                    },
                },
                session: {
                    select: {
                        name: true,
                        isCurrent: true,
                    },
                },
                instructors: {
                    include: {
                        faculty: {
                            include: {
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
                simpleFeedbacks: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: [
                { session: { startDate: "desc" } },
                { course: { courseCode: "asc" } },
            ],
        });

        // Transform data for frontend
        const transformedOfferings = offerings.map((offering) => ({
            id: offering.id,
            courseCode: offering.course.courseCode,
            courseName: offering.course.courseName,
            credits: offering.course.credits,
            department: offering.offeringDepartment,
            session: offering.session.name,
            isCurrent: offering.session.isCurrent,
            feedbackOpen: offering.feedbackOpen,
            instructors: offering.instructors.map((inst) => ({
                name: `${inst.faculty.user.firstName} ${inst.faculty.user.lastName}`,
                isPrimary: inst.isPrimary,
            })),
            feedbackCount: offering.simpleFeedbacks.length,
        }));

        // Get unique departments for filter
        const departments = await prisma.courseOffering.findMany({
            select: {
                offeringDepartment: true,
            },
            distinct: ["offeringDepartment"],
            orderBy: {
                offeringDepartment: "asc",
            },
        });

        return NextResponse.json({
            offerings: transformedOfferings,
            departments: departments.map((d) => d.offeringDepartment),
        });
    } catch (error) {
        console.error("Error fetching course offerings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
