
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ offeringId: string }> }
) {
    try {
        const session = await auth();
        const { offeringId } = await params;

        if (!session?.user || session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const offering = await prisma.courseOffering.findUnique({
            where: { id: offeringId },
            select: { sessionId: true } // Removed gradeSubmissionEnabled
        });

        if (!offering) return NextResponse.json({ error: "Not found" }, { status: 404 });

        let isOpen = false;
        let message = "Closed";

        // Override check disabled

        const now = new Date();
        const window = await prisma.academicDate.findFirst({
            where: {
                eventType: "GRADES_SUBMISSION",
                sessionId: offering.sessionId,
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });

        if (window) {
            isOpen = true;
            message = "Open";
        } else {
            // check if future
            const future = await prisma.academicDate.findFirst({
                where: {
                    eventType: "GRADES_SUBMISSION",
                    sessionId: offering.sessionId,
                    startDate: { gt: now }
                }
            });
            message = future ? "Submission window not started" : "Submission window closed";
        }

        return NextResponse.json({ isOpen, message });

    } catch (error) {
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}
