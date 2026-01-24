import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const faculty = await prisma.faculty.findUnique({
            where: { userId: session.user.id },
        });

        if (!faculty) {
            return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 });
        }

        const body = await req.json();
        const { updates } = body; // Expecting { updates: { enrollmentId: string, grade: string }[] }

        if (!updates || !Array.isArray(updates)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // We should verify that the faculty is the instructor for these enrollments, 
        // but for bulk efficiency we might rely on the fact that they can only see enrollments for their course.
        // A stricter check would be to fetch all courseOfferingIds for these enrollments and check faculty mapping.
        // For now, let's assume valid enrollmentIds passed from the frontend which guards this.
        // We can do a quick check if desired, but let's proceed with the update transaction.

        const updatePromises = updates.map(update =>
            prisma.enrollment.updateMany({
                where: {
                    id: update.enrollmentId,
                    // Security: Ensure the course offering associated with this enrollment involves this faculty
                    courseOffering: {
                        instructors: {
                            some: { facultyId: faculty.id }
                        }
                    }
                },
                data: { grade: update.grade }
            })
        );

        await prisma.$transaction(updatePromises);
        // Note: updateMany inside transaction is fine. updateMany returns count.
        // We use updateMany with 'where' including the security check to fail silently/safely for unauthorized IDs.

        return NextResponse.json({ message: "Grades updated successfully" });

    } catch (error) {
        console.error("Error updating grades:", error);
        return NextResponse.json({ error: "Failed to update grades" }, { status: 500 });
    }
}
