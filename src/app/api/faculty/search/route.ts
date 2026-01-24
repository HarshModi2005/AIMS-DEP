
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({ faculty: [] });
        }

        const faculty = await prisma.faculty.findMany({
            where: {
                user: {
                    OR: [
                        { firstName: { contains: query, mode: "insensitive" } },
                        { lastName: { contains: query, mode: "insensitive" } },
                        { email: { contains: query, mode: "insensitive" } },
                    ],
                },
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            take: 10,
        });

        const results = faculty.map((f) => ({
            id: f.id,
            name: `${f.user.firstName} ${f.user.lastName}`,
            email: f.user.email,
            department: f.department,
        }));

        return NextResponse.json({ faculty: results });
    } catch (error) {
        console.error("Error searching faculty:", error);
        return NextResponse.json(
            { error: "Failed to search faculty" },
            { status: 500 }
        );
    }
}
