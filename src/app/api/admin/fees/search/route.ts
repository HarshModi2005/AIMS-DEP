import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        // Check Admin Role
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");

        if (!query) {
            return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
        }

        // Find student by email OR entry number (assuming entry no is stored in a field, currently searching by email)
        // TODO: Enhance search to include entryNumber if available in schema. For now, matching email.
        // Find student by email OR roll number
        const student = await prisma.student.findFirst({
            where: {
                user: {
                    OR: [
                        { email: { contains: query, mode: "insensitive" } },
                        { rollNumber: { contains: query, mode: "insensitive" } },
                    ],
                },
            },
            include: {
                user: true,
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Fetch all academic sessions
        const allSessions = await prisma.academicSession.findMany({
            orderBy: { startDate: "desc" },
        });

        // Fetch student's semester fee payments
        const feePayments = await prisma.payment.findMany({
            where: {
                studentId: student.id,
                type: "SEMESTER_FEE",
                status: "SUCCESS",
            },
        });

        const studentData = {
            studentName: `${student.user.firstName} ${student.user.lastName}`,
            studentEmail: student.user.email,
            rollNumber: student.user.rollNumber || "N/A",
            sessions: allSessions.map((session) => {
                const payment = feePayments.find((p) => p.sessionId === session.id);
                return {
                    id: session.id,
                    name: session.name,
                    semesterFee: session.semesterFee,
                    status: payment ? "PAID" : "PENDING",
                    paymentDate: payment ? payment.createdAt : null,
                    amountPaid: payment ? payment.amount : null,
                };
            }),
        };

        return NextResponse.json(studentData);
    } catch (error) {
        console.error("Error searching student fees:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
