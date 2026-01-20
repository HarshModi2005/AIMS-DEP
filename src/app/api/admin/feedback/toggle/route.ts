import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Check Admin Role
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { offeringId, feedbackOpen } = body;

        if (!offeringId || typeof feedbackOpen !== "boolean") {
            return NextResponse.json(
                { error: "Invalid request. offeringId and feedbackOpen (boolean) are required" },
                { status: 400 }
            );
        }

        // Update the course offering
        const updatedOffering = await prisma.courseOffering.update({
            where: { id: offeringId },
            data: { feedbackOpen },
            include: {
                course: {
                    select: {
                        courseCode: true,
                        courseName: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: `Feedback ${feedbackOpen ? "enabled" : "disabled"} for ${updatedOffering.course.courseCode}`,
            offering: {
                id: updatedOffering.id,
                feedbackOpen: updatedOffering.feedbackOpen,
            },
        });
    } catch (error) {
        console.error("Error toggling feedback:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
