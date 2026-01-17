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

        const { courseOfferingId } = await req.json();

        if (!courseOfferingId) {
            return NextResponse.json({ error: "Course Offering ID is required" }, { status: 400 });
        }

        const student = await prisma.student.findFirst({
            where: { user: { email: session.user.email } },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const offering = await prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
        });

        if (!offering) {
            return NextResponse.json({ error: "Course Offering not found" }, { status: 404 });
        }

        if (offering.fee <= 0) {
            return NextResponse.json({ error: "This course is free" }, { status: 400 });
        }

        const options = {
            amount: offering.fee * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                studentId: student.id,
                courseOfferingId: offering.id,
            },
        };

        const order = await razorpay.orders.create(options);

        // Save PENDING payment order to database
        await prisma.payment.create({
            data: {
                amount: offering.fee,
                currency: "INR",
                status: "PENDING",
                razorpayOrderId: order.id,
                studentId: student.id,
                courseOfferingId: offering.id,
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
