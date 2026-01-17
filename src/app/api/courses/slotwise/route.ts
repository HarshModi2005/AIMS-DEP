import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch slotwise courses for a session
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        // If no session ID provided, get current session
        let academicSession;
        if (sessionId) {
            academicSession = await prisma.academicSession.findUnique({
                where: { id: sessionId },
            });
        } else {
            academicSession = await prisma.academicSession.findFirst({
                where: { isCurrent: true },
            });
        }

        if (!academicSession) {
            return NextResponse.json(
                { error: "No academic session found" },
                { status: 404 }
            );
        }

        // Fetch course offerings for this session
        const offerings = await prisma.courseOffering.findMany({
            where: {
                sessionId: academicSession.id,
            },
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
                    where: { isPrimary: true },
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
        });

        // Group by department
        const groupedCourses: Record<string, { id: string; name: string; courses: unknown[] }> = {};

        for (const offering of offerings) {
            const category = offering.offeringDepartment || "General";
            if (!groupedCourses[category]) {
                groupedCourses[category] = {
                    id: category,
                    name: category,
                    courses: [],
                };
            }

            const coordinator = offering.instructors[0]?.faculty?.user;

            groupedCourses[category].courses.push({
                id: offering.id,
                code: offering.course.courseCode,
                name: offering.course.courseName,
                ltp: `${offering.course.lectureHours}-${offering.course.tutorialHours}-${offering.course.practicalHours}-${offering.course.selfStudyHours}-${offering.course.credits}`,
                credits: offering.course.credits,
                slot: "-",
                coordinator: coordinator ? `${coordinator.firstName} ${coordinator.lastName}` : "TBA",
                department: offering.offeringDepartment,
            });
        }

        return NextResponse.json({
            session: {
                id: academicSession.id,
                name: academicSession.name,
                fullName: academicSession.fullName,
            },
            categories: Object.values(groupedCourses),
        });
    } catch (error) {
        console.error("Error fetching slotwise courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch slotwise courses" },
            { status: 500 }
        );
    }
}
