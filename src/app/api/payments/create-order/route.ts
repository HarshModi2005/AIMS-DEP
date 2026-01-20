import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { courseOfferingId, sessionId } = body;

        if (!courseOfferingId && !sessionId) {
            return NextResponse.json({ error: "Either Course Offering ID or Session ID is required" }, { status: 400 });
        }

        const student = await prisma.student.findFirst({
            where: { user: { email: session.user.email } },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        let amount = 0;
        let notes: any = { studentId: student.id };
        let paymentType: "COURSE_FEE" | "SEMESTER_FEE" = "COURSE_FEE";

        if (sessionId) {
            // Semantic Fee Payment
            const academicSession = await prisma.academicSession.findUnique({
                where: { id: sessionId },
            });
            if (!academicSession) {
                return NextResponse.json({ error: "Session not found" }, { status: 404 });
            }
            amount = academicSession.semesterFee;
            notes.sessionId = sessionId;
            paymentType = "SEMESTER_FEE";
        } else if (courseOfferingId) {
            // Course Fee Payment
            const offering = await prisma.courseOffering.findUnique({
                where: { id: courseOfferingId },
            });
            if (!offering) {
                return NextResponse.json({ error: "Course Offering not found" }, { status: 404 });
            }
            if (offering.fee <= 0) {
                return NextResponse.json({ error: "This course is free" }, { status: 400 });
            }
            amount = offering.fee;
            notes.courseOfferingId = courseOfferingId;
        }

        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: notes,
        };

        const order = await razorpay.orders.create(options);

        // Save PENDING payment order to database
        await prisma.payment.create({
            data: {
                amount: amount,
                currency: "INR",
                status: "PENDING",
                type: paymentType,
                razorpayOrderId: order.id,
                studentId: student.id,
                courseOfferingId: courseOfferingId || undefined,
                sessionId: sessionId || undefined,
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
