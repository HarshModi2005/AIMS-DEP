import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch all academic sessions
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";

        const sessions = await prisma.academicSession.findMany({
            where: includeArchived ? undefined : {
                OR: [
                    { isCurrent: true },
                    { isUpcoming: true },
                    { endDate: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } }, // Last year
                ],
            },
            orderBy: {
                startDate: "desc",
            },
            select: {
                id: true,
                name: true,
                fullName: true,
                type: true,
                academicYear: true,
                startDate: true,
                endDate: true,
                isCurrent: true,
                isUpcoming: true,
            },
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}

// POST - Create a new academic session (Admin only)
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
        const { name, fullName, type, academicYear, startDate, endDate, isCurrent, isUpcoming } = body;

        // Validate required fields
        if (!name || !type || !academicYear || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // If setting as current, unset other current sessions
        if (isCurrent) {
            await prisma.academicSession.updateMany({
                where: { isCurrent: true },
                data: { isCurrent: false },
            });
        }

        const newSession = await prisma.academicSession.create({
            data: {
                name,
                fullName: fullName || `${name} : ${type.toLowerCase()} session`,
                type,
                academicYear,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isCurrent: isCurrent || false,
                isUpcoming: isUpcoming || false,
            },
        });

        return NextResponse.json({ session: newSession }, { status: 201 });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}
