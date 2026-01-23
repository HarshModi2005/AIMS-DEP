
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (req: Request) => {
    try {
        const session = await auth();
        if (!session || session.user.role !== "FACULTY_ADVISOR") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const yearStr = searchParams.get("year");

        if (!department || !yearStr) {
            return NextResponse.json({ error: "Department and Year are required" }, { status: 400 });
        }

        const year = parseInt(yearStr);

        // Verify Advisor is assigned to this batch
        const advisorAssignment = await prisma.facultyAdvisor.findUnique({
            where: {
                department_batchYear: {
                    department,
                    batchYear: year
                }
            }
        });

        if (!advisorAssignment || advisorAssignment.userId !== session.user.id) {
            return NextResponse.json({ error: "You are not the advisor for this batch" }, { status: 403 });
        }

        // Fetch students
        // Assuming 'yearOfEntry' in Student model matches 'batchYear'
        // Also include enrollments to show quick status? The requirement says "list of all students... accompanied by simple search".

        const students = await prisma.student.findMany({
            where: {
                department: department,
                yearOfEntry: year,
                // Add search logic if needed, usually handled by separate param or basic text filter on client or here
                user: {
                    OR: [
                        { firstName: { contains: searchParams.get("q") || "", mode: "insensitive" } },
                        { lastName: { contains: searchParams.get("q") || "", mode: "insensitive" } },
                        { rollNumber: { contains: searchParams.get("q") || "", mode: "insensitive" } }
                    ]
                }
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        rollNumber: true,
                        email: true,
                        profilePhoto: true
                    }
                }
            }
        });

        return NextResponse.json({ students });

    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
