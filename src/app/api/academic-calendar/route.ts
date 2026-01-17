import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch academic dates for a session
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        // Get the session
        let academicSession;
        if (sessionId) {
            academicSession = await prisma.academicSession.findUnique({
                where: { id: sessionId },
            });
        } else {
            academicSession = await prisma.academicSession.findFirst({
                where: { isCurrent: true },
            });
        }

        if (!academicSession) {
            return NextResponse.json(
                { error: "No academic session found" },
                { status: 404 }
            );
        }

        // Fetch academic dates
        const dates = await prisma.academicDate.findMany({
            where: {
                sessionId: academicSession.id,
                isVisible: true,
            },
            orderBy: [
                { startDate: "asc" },
                { eventType: "asc" },
            ],
        });

        // Fetch academic calendar document
        const document = await prisma.academicDocument.findFirst({
            where: {
                sessionId: academicSession.id,
                documentType: "ACADEMIC_CALENDAR",
                isActive: true,
            },
            orderBy: { uploadedAt: "desc" }
        });

        // Format dates for response
        const formattedDates = dates.map((date) => ({
            id: date.id,
            event: formatEventType(date.eventType, date.eventName),
            eventType: date.eventType,
            startDate: date.startDate ? formatDate(date.startDate) : "N/A",
            endDate: date.endDate ? formatDate(date.endDate) : "N/A",
        }));

        return NextResponse.json({
            session: {
                id: academicSession.id,
                name: academicSession.name,
                fullName: academicSession.fullName,
                startDate: formatDate(academicSession.startDate),
                endDate: formatDate(academicSession.endDate),
            },
            dates: formattedDates,
            document: document ? {
                url: document.fileUrl,
                name: document.fileName
            } : null
        });
    } catch (error) {
        console.error("Error fetching academic dates:", error);
        return NextResponse.json(
            { error: "Failed to fetch academic dates" },
            { status: 500 }
        );
    }
}

// POST - Create academic date (Admin only)
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
        const { sessionId, eventType, eventName, startDate, endDate } = body;

        if (!sessionId || !eventType) {
            return NextResponse.json(
                { error: "Session ID and event type are required" },
                { status: 400 }
            );
        }

        const date = await prisma.academicDate.create({
            data: {
                sessionId,
                eventType,
                eventName: eventName || eventType,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
        });

        return NextResponse.json({ date }, { status: 201 });
    } catch (error) {
        console.error("Error creating academic date:", error);
        return NextResponse.json(
            { error: "Failed to create academic date" },
            { status: 500 }
        );
    }
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).replace(/\//g, "/");
}

function formatEventType(eventType: string, eventName?: string | null): string {
    if (eventName && eventName !== eventType) {
        return eventName;
    }

    const eventLabels: Record<string, string> = {
        "ACADEMIC_SESSION": "Academic session",
        "COURSE_PRE_REGISTRATION": "Course pre-registration",
        "CLASSES": "Classes",
        "COURSE_DROP": "Course drop",
        "MIDSEM_COURSE_FEEDBACK": "Midsem course feedback",
        "MID_SEM_EXAMS": "Mid sem exams",
        "WITHDRAW": "Withdraw",
        "END_SEM_EXAMS": "End sem exams",
        "COURSE_FEEDBACK": "Course feedback",
        "GRADES_SUBMISSION": "Grades submission",
        "SHOW_FEEDBACK_MIDSEM": "Show feedback (midsem)",
        "SHOW_FEEDBACK_ENDSEM": "Show feedback (endsem)",
        "RESULT_DECLARATION": "Result Declaration",
        "HOLIDAYS": "Holidays",
        "CUSTOM": eventName || "Custom Event",
    };
    return eventLabels[eventType] || eventType;
}
