
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        // enabled can be true, false, or null (to reset)
        const { enabled } = body;

        // Feature disabled temporarily due to DB sync issues
        return NextResponse.json({
            error: "Course Overrides are temporarily disabled due to database maintenance."
        }, { status: 400 });

        /*
        await prisma.courseOffering.update({
            where: { id },
            data: { gradeSubmissionEnabled: enabled }
        });
        */

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error updating override:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
