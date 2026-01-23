
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";

        // Fetch faculty with optional search
        const faculty = await prisma.faculty.findMany({
            where: {
                user: {
                    OR: [
                        { firstName: { contains: query, mode: "insensitive" } },
                        { lastName: { contains: query, mode: "insensitive" } },
                        { email: { contains: query, mode: "insensitive" } },
                    ]
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            },
            take: 20, // Limit results for performance
        });

        const formatted = faculty.map(f => ({
            id: f.id,
            userId: f.userId,
            name: `${f.user.firstName} ${f.user.lastName}`,
            email: f.user.email,
            department: f.department,
        }));

        return NextResponse.json({ faculty: formatted });
    } catch (error) {
        console.error("Error fetching faculty:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
