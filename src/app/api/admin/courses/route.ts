import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch courses with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Allow Admin and Faculty to view courses (Faculty needs this for floating)
        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const department = searchParams.get("department");
        const category = searchParams.get("category");

        // Build where clause
        const where: Record<string, unknown> = {};

        if (department && department !== "all") {
            where.department = department;
        }

        if (category && category !== "all") {
            where.courseCategory = category;
        }

        if (search) {
            where.OR = [
                { courseCode: { contains: search, mode: "insensitive" } },
                { courseName: { contains: search, mode: "insensitive" } },
            ];
        }

        const courses = await prisma.course.findMany({
            where,
            orderBy: { courseCode: "asc" },
        });

        return NextResponse.json({ courses });
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

// POST - Create a new course
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const {
            courseCode,
            courseName,
            lectureHours = 3,
            tutorialHours = 1,
            practicalHours = 0,
            selfStudyHours = 5,
            credits = 3,
            department = "Computer Science and Engineering",
            courseCategory = "PC",
            level = "UNDERGRADUATE",
        } = body;

        if (!courseCode || !courseName) {
            return NextResponse.json(
                { error: "Course code and name are required" },
                { status: 400 }
            );
        }

        // Check if course already exists
        const existing = await prisma.course.findUnique({
            where: { courseCode },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Course with this code already exists" },
                { status: 400 }
            );
        }

        const course = await prisma.course.create({
            data: {
                courseCode,
                courseName,
                lectureHours,
                tutorialHours,
                practicalHours,
                selfStudyHours,
                credits,
                department,
                courseCategory,
                level,
            },
        });

        return NextResponse.json({ course }, { status: 201 });
    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json(
            { error: "Failed to create course" },
            { status: 500 }
        );
    }
}
