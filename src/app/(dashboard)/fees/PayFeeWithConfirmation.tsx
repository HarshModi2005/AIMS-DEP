"use client";

import { useState } from "react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Script from "next/script";

interface PayFeeWithConfirmationProps {
    courseOfferingId?: string;
    sessionId?: string;
    amount: number;
    userEmail: string;
    userName: string;
    label?: string;
    disabled?: boolean;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PayFeeWithConfirmation({
    courseOfferingId,
    sessionId,
    amount,
    userEmail,
    userName,
    label = "Pay Fee",
    disabled = false,
}: PayFeeWithConfirmationProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
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
                // Close modal on error so they can see alert or we should show error in modal
                setIsModalOpen(false);
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
                            router.refresh();
                            setIsModalOpen(false);
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
                setLoading(false); // Reset loading if payment fails/cancels
            });
            rzp1.open();
            // Note: Razorpay opens in a new layer, so we can keep our modal open or close it?
            // Usually we might want to keep "Processing..." state or close it.
            // Let's close the confirmation modal so Razorpay modal is the focus.
            setIsModalOpen(false);
            setLoading(false);

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
            setLoading(false);
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />

            <Button
                onClick={() => setIsModalOpen(true)}
                disabled={loading || disabled}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
                {label || `Pay ₹${amount}`}
            </Button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => !loading && setIsModalOpen(false)}
                onConfirm={handlePayment}
                title="Pay Fees Now"
                description={
                    <div className="space-y-4">
                        <p>Are you sure you want to proceed with the payment of <strong className="text-white">₹{amount}</strong>?</p>
                        <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
                            <div className="flex items-start gap-2 text-sm text-indigo-300">
                                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Clicking "Yes, Pay Now" will open the secure Razorpay payment gateway to complete your transaction.</span>
                            </div>
                        </div>
                    </div>
                }
                confirmText="Yes, Pay Now"
                cancelText="Cancel"
                isLoading={loading}
                variant="default"
            />
        </>
    );
}
