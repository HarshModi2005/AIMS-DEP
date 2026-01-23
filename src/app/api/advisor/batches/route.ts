
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
    try {
        const session = await auth();
        if (!session || session.user.role !== "FACULTY_ADVISOR") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch batches assigned to this advisor
        const batches = await prisma.facultyAdvisor.findMany({
            where: { userId: session.user.id },
            select: {
                department: true,
                batchYear: true
            }
        });

        return NextResponse.json({ batches });
    } catch (error) {
        console.error("Error fetching advisor batches:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
