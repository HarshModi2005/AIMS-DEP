import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment successful
            await prisma.payment.update({
                where: { razorpayOrderId: razorpay_order_id },
                data: {
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: "SUCCESS",
                },
            });

            return NextResponse.json({ message: "Payment verified successfully", success: true });
        } else {
            await prisma.payment.update({
                where: { razorpayOrderId: razorpay_order_id },
                data: {
                    status: "FAILED",
                },
            });
            return NextResponse.json({ message: "Invalid signature", success: false }, { status: 400 });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
