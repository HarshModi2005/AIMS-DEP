
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for validation
const assignAdvisorSchema = z.object({
    department: z.string(),
    batchYear: z.coerce.number(),
    facultyEmail: z.string().email(),
});

export const GET = async (req: Request) => {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const advisors = await prisma.facultyAdvisor.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        rollNumber: true
                    }
                }
            },
            orderBy: [
                { batchYear: 'desc' },
                { department: 'asc' }
            ]
        });

        return NextResponse.json({ advisors });
    } catch (error) {
        console.error("Error fetching advisors:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export const POST = async (req: Request) => {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = assignAdvisorSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.errors },
                { status: 400 }
            );
        }

        const { department, batchYear, facultyEmail } = result.data;

        // 1. Check if Faculty exists
        const facultyUser = await prisma.user.findUnique({
            where: { email: facultyEmail },
        });

        if (!facultyUser) {
            return NextResponse.json(
                { error: "Faculty user not found with this email" },
                { status: 404 }
            );
        }

        // 2. Create/Update FacultyAdvisor record
        // NOTE: We do NOT change the user's role here. 
        // Faculty advisors should use a separate fa.* account with FACULTY_ADVISOR role.
        // This just links the user to a batch for filtering purposes.
        await prisma.facultyAdvisor.upsert({
            where: {
                department_batchYear: {
                    department,
                    batchYear,
                },
            },
            update: {
                userId: facultyUser.id,
            },
            create: {
                userId: facultyUser.id,
                department,
                batchYear,
            },
        });

        return NextResponse.json({ success: true, message: "Faculty Advisor assigned successfully" });

    } catch (error) {
        console.error("Error assigning advisor:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
