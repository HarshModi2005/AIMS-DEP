import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// PATCH - Approve or Reject a course offering
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { status } = await request.json();

        if (!status || (status !== "OPEN_FOR_ENROLLMENT" && status !== "REJECTED")) {
            return NextResponse.json(
                { error: "Invalid status. Must be OPEN_FOR_ENROLLMENT or REJECTED" },
                { status: 400 }
            );
        }

        const { id: offeringId } = await params;

        const updatedOffering = await prisma.courseOffering.update({
            where: { id: offeringId },
            data: { status: status },
        });

        return NextResponse.json({
            message: `Course ${status === "OPEN_FOR_ENROLLMENT" ? "approved" : "rejected"} successfully`,
            offering: updatedOffering,
        });
    } catch (error) {
        console.error("Error updating offering status:", error);
        return NextResponse.json(
            { error: "Failed to update offering status" },
            { status: 500 }
        );
    }
}
