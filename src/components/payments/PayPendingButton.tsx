"use client";

import RazorpayButton from "@/components/payments/RazorpayButton";
import { useRouter } from "next/navigation";

interface PayPendingButtonProps {
    courseOfferingId?: string;
    sessionId?: string;
    amount: number;
    userEmail: string;
    userName: string;
    label?: string;
    askConfirmation?: boolean;
}

export default function PayPendingButton({
    courseOfferingId,
    sessionId,
    amount,
    userEmail,
    userName,
    label,
    askConfirmation,
}: PayPendingButtonProps) {
    const router = useRouter();

    return (
        <RazorpayButton
            courseOfferingId={courseOfferingId}
            sessionId={sessionId}
            amount={amount}
            userEmail={userEmail}
            userName={userName}
            label={label}
            askConfirmation={askConfirmation}
            onSuccess={() => {
                router.refresh();
            }}
        />
    );
}
