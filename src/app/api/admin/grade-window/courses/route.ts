
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q");

        if (!q || q.length < 2) {
            return NextResponse.json({ courses: [] });
        }

        const courses = await prisma.courseOffering.findMany({
            where: {
                OR: [
                    { course: { courseCode: { contains: q, mode: "insensitive" } } },
                    { course: { courseName: { contains: q, mode: "insensitive" } } }
                ]
            },
            include: { course: true },
            take: 20
        });

        const formatted = courses.map(c => ({
            id: c.id,
            courseCode: c.course.courseCode,
            courseName: c.course.courseName,
            department: c.offeringDepartment,
            gradeSubmissionEnabled: null // Placeholder
        }));

        return NextResponse.json({ courses: formatted });

    } catch (error) {
        console.error("Error searching courses:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
