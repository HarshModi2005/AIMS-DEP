"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayButtonProps {
    courseOfferingId?: string;
    sessionId?: string;
    amount: number; // in rupees
    onSuccess?: () => void;
    userEmail?: string;
    userName?: string;
    disabled?: boolean;
    label?: string;
    askConfirmation?: boolean;
}

export default function RazorpayButton({
    courseOfferingId,
    sessionId,
    amount,
    onSuccess,
    userEmail,
    userName,
    disabled,
    label,
    askConfirmation,
}: RazorpayButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const initiatePayment = async () => {
        setLoading(true);

        try {
            // 1. Create Order
            const res = await fetch("/api/payments/create-order", {
                method: "POST",
                body: JSON.stringify({ courseOfferingId, sessionId }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Failed to create order");
                setLoading(false);
                return;
            }

            const order = await res.json();

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "AIMS Portal",
                description: sessionId ? "Semester Fee Payment" : "Course Enrollment Fee",
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch("/api/payments/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            alert("Payment Successful!");
                            if (onSuccess) onSuccess();
                        } else {
                            alert("Payment verification failed");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on("payment.failed", function (response: any) {
                alert(response.error.description);
            });
            rzp1.open();
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <Button
                onClick={() => {
                    if (askConfirmation) {
                        setShowConfirm(true);
                    } else {
                        initiatePayment();
                    }
                }}
                disabled={loading || disabled}
            >
                {loading ? "Processing..." : label || `Pay ₹${amount}`}
            </Button>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={initiatePayment}
                title="Confirm Payment"
                message={`Are you sure you want to pay ₹${amount} right now?`}
            />
        </>
    );
}
