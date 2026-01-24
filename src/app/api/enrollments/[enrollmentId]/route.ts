import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ enrollmentId: string }> }
) {
    try {
        const session = await auth();
        const { enrollmentId } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (!["DROP", "WITHDRAW", "AUDIT"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Get enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                student: { include: { user: true } },
                courseOffering: true
            }
        });

        if (!enrollment) {
            return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
        }

        // Verify ownership (or admin)
        if (enrollment.student.user.email !== session.user.email && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let updateData: any = {};

        switch (action) {
            case "DROP":
                // Logic for dropping: set status to DROPPED
                // Usually allowed only before a deadline, but we'll assume valid for now or UI handles it
                updateData = { enrollmentStatus: "DROPPED" };
                break;
            case "WITHDRAW":
                updateData = { enrollmentStatus: "WITHDRAWN" };
                break;
            case "AUDIT":
                updateData = { enrollmentType: "AUDIT" };
                break;
        }

        const updatedEnrollment = await prisma.enrollment.update({
            where: { id: enrollmentId },
            data: updateData,
        });

        // If dropped/withdrawn, we might want to decrement currentStrength if it was approved (ENROLLED)
        // However, if the status was PENDING, it didn't count towards strength yet (depending on logic). 
        // Based on previous route, strength is updated on approval. 
        // If status was ENROLLED, we should decrement.
        if (["DROP", "WITHDRAW"].includes(action) && enrollment.enrollmentStatus === "ENROLLED") {
            await prisma.courseOffering.update({
                where: { id: enrollment.courseOfferingId },
                data: { currentStrength: { decrement: 1 } }
            });
        }

        return NextResponse.json({ message: "Action successful", enrollment: updatedEnrollment });

    } catch (error) {
        console.error("Error updating enrollment:", error);
        return NextResponse.json(
            { error: "Failed to update enrollment" },
            { status: 500 }
        );
    }
}
