import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch all pending course offerings
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const pendingOfferings = await prisma.courseOffering.findMany({
            where: {
                status: "PENDING_APPROVAL",
            },
            include: {
                course: true,
                instructors: {
                    include: {
                        faculty: {
                            include: { user: true },
                        },
                    },
                },
                session: true,
            },
            orderBy: {
                course: {
                    courseCode: "asc",
                },
            },
        });

        const formattedOfferings = pendingOfferings.map((offering) => ({
            id: offering.id,
            courseCode: offering.course.courseCode,
            courseName: offering.course.courseName,
            department: offering.offeringDepartment,
            credits: offering.course.credits,
            instructor: offering.instructors.find((i) => i.isPrimary)?.faculty.user.firstName + " " + offering.instructors.find((i) => i.isPrimary)?.faculty.user.lastName,
            session: offering.session.name,
            maxStrength: offering.maxStrength,
            floatedAt: offering.course.updatedAt, // Using updatedAt as proxy for float time
        }));

        return NextResponse.json({ offerings: formattedOfferings });
    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        return NextResponse.json(
            { error: "Failed to fetch pending approvals" },
            { status: 500 }
        );
    }
}
