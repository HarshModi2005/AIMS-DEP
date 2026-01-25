
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { AcademicEvent } from "@prisma/client";

// GET: Fetch global window
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch GRADES_SUBMISSION event for current/upcoming session
        // For simplicity, let's just get the latest one or create one if missing
        // Ideally, we find the "active" session. Let's assume there's a current session.

        let academicDate = await prisma.academicDate.findFirst({
            where: { eventType: "GRADES_SUBMISSION" },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ window: academicDate });

    } catch (error) {
        console.error("Error fetching grade window:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Update global window
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { startDate, endDate } = body;

        // Find active session
        const currentSession = await prisma.academicSession.findFirst({
            where: { isCurrent: true }
        });

        if (!currentSession) {
            return NextResponse.json({ error: "No active academic session found" }, { status: 400 });
        }

        // Upsert the event for this session
        const existing = await prisma.academicDate.findFirst({
            where: {
                eventType: "GRADES_SUBMISSION",
                sessionId: currentSession.id
            }
        });

        if (existing) {
            await prisma.academicDate.update({
                where: { id: existing.id },
                data: { startDate, endDate }
            });
        } else {
            await prisma.academicDate.create({
                data: {
                    sessionId: currentSession.id,
                    eventType: "GRADES_SUBMISSION",
                    eventName: "Grade Submission",
                    startDate,
                    endDate,
                    isVisible: true
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error updating grade window:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
