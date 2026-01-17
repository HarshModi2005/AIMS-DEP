"use client";

import RazorpayButton from "@/components/payments/RazorpayButton";
import { useRouter } from "next/navigation";

interface PayPendingButtonProps {
    courseOfferingId: string;
    amount: number;
    userEmail: string;
    userName: string;
}

export default function PayPendingButton({
    courseOfferingId,
    amount,
    userEmail,
    userName,
}: PayPendingButtonProps) {
    const router = useRouter();

    return (
        <RazorpayButton
            courseOfferingId={courseOfferingId}
            amount={amount}
            userEmail={userEmail}
            userName={userName}
            onSuccess={() => {
                router.refresh();
            }}
        />
    );
}
