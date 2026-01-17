import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch feedback cycles
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const cycles = await prisma.feedbackCycle.findMany({
            include: {
                session: {
                    select: {
                        name: true,
                    },
                },
                questions: {
                    select: {
                        id: true,
                    },
                },
                _count: {
                    select: {
                        feedbacks: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            cycles: cycles.map(cycle => ({
                id: cycle.id,
                name: cycle.name,
                type: cycle.type,
                sessionId: cycle.sessionId,
                sessionName: cycle.session.name,
                startDate: cycle.startDate,
                endDate: cycle.endDate,
                isActive: cycle.isActive,
                questionsCount: cycle.questions.length,
                responsesCount: cycle._count.feedbacks,
            })),
        });
    } catch (error) {
        console.error("Error fetching feedback cycles:", error);
        return NextResponse.json(
            { error: "Failed to fetch feedback cycles" },
            { status: 500 }
        );
    }
}

// POST - Create a new feedback cycle
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { name, type, sessionId, startDate, endDate, isActive = false } = body;

        if (!name || !type || !sessionId || !startDate || !endDate) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const cycle = await prisma.feedbackCycle.create({
            data: {
                name,
                type,
                sessionId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive,
                createdBy: session.user.id || "admin",
            },
        });

        return NextResponse.json({ cycle }, { status: 201 });
    } catch (error) {
        console.error("Error creating feedback cycle:", error);
        return NextResponse.json(
            { error: "Failed to create feedback cycle" },
            { status: 500 }
        );
    }
}
