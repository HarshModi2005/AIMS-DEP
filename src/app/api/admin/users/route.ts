import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch users with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const role = searchParams.get("role");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Build where clause
        const where: Record<string, unknown> = {};

        if (role && role !== "all") {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { rollNumber: { contains: search, mode: "insensitive" } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                student: {
                    select: {
                        department: true,
                        degreeType: true,
                        currentStatus: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });

        const total = await prisma.user.count({ where });

        return NextResponse.json({
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                rollNumber: user.rollNumber,
                role: user.role,
                createdAt: user.createdAt,
                student: user.student,
            })),
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// POST - Create a new user
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
        const { email, firstName, lastName, role, rollNumber } = body;

        if (!email || !firstName || !lastName) {
            return NextResponse.json(
                { error: "Email, first name, and last name are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        const user = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                role: role || "STUDENT",
                rollNumber,
            },
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
