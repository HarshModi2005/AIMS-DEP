import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PayFeeWithConfirmation from "./PayFeeWithConfirmation";

export default async function FeesPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "STUDENT") {
        redirect("/");
    }

    const student = await prisma.student.findFirst({
        where: { user: { email: session.user.email } },
    });

    if (!student) {
        return <div className="p-6 text-white">Student profile not found.</div>;
    }

    const payments = await prisma.payment.findMany({
        where: { studentId: student.id },
        include: {
            courseOffering: {
                include: {
                    course: true,
                },
            },
            session: true,
        },
        orderBy: { createdAt: "desc" },
    });

    const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
    });

    const semesterFeePaid = payments.some(
        (p) =>
            p.sessionId === currentSession?.id &&
            p.type === "SEMESTER_FEE" &&
            p.status === "SUCCESS"
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Paid
                    </span>
                );
            case "PENDING":
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                        <Clock className="h-3 w-3" />
                        Pending
                    </span>
                );
            case "FAILED":
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                        <XCircle className="h-3 w-3" />
                        Failed
                    </span>
                );
            default:
                return <span className="text-zinc-400">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Fee Payments</h1>
                        <p className="text-zinc-400">View your payment history and receipts</p>
                    </div>
                </div>

                {/* Semester Fee Section for Current Session */}
                {currentSession && (
                    <div className="mb-8 rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <h2 className="text-xl font-semibold mb-4">Current Session: {currentSession.name}</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400">Semester Fee</p>
                                <p className="text-2xl font-bold mt-1">₹{currentSession.semesterFee}</p>
                            </div>
                            <div>
                                {semesterFeePaid ? (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                        <CheckCircle className="h-5 w-5" />
                                        <span>Semester Fee Paid</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
                                            <Clock className="h-4 w-4" />
                                            <span>Required for enrollment</span>
                                        </div>
                                        <PayFeeWithConfirmation
                                            courseOfferingId="" // Not course specific
                                            sessionId={currentSession.id} // Session specific
                                            amount={currentSession.semesterFee}
                                            userEmail={session?.user?.email || ""}
                                            userName={session?.user?.name || ""}
                                            label="Pay Semester Fee"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <h2 className="text-lg font-semibold mb-4">Payment History</h2>
                <div className="rounded-xl border border-white/10 overflow-hidden bg-zinc-900/50">
                    {payments.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-zinc-900/80 border-b border-white/5 text-left">
                                    <th className="px-6 py-4 text-sm font-medium text-zinc-400">Date</th>
                                    <th className="px-6 py-4 text-sm font-medium text-zinc-400">Order ID</th>
                                    <th className="px-6 py-4 text-sm font-medium text-zinc-400">Details</th>
                                    <th className="px-6 py-4 text-sm font-medium text-zinc-400">Amount</th>
                                    <th className="px-6 py-4 text-sm font-medium text-zinc-400">Status</th>
                                    <th className="px-6 py-4 text-sm font-medium text-zinc-400">Reference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm text-zinc-300">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-zinc-400">
                                            {payment.razorpayOrderId}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.type === "SEMESTER_FEE" ? (
                                                <div>
                                                    <div className="font-medium text-indigo-400">
                                                        Semester Fee
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {payment.session?.name}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-medium text-indigo-400">
                                                        {payment.courseOffering?.course.courseCode}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {payment.courseOffering?.course.courseName}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            ₹{payment.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.status === "PENDING" ? (
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(payment.status)}
                                                    <PayFeeWithConfirmation
                                                        courseOfferingId={payment.courseOfferingId || ""}
                                                        sessionId={payment.sessionId || ""}
                                                        amount={payment.amount}
                                                        userEmail={session?.user?.email || ""}
                                                        userName={session?.user?.name || ""}
                                                    />
                                                </div>
                                            ) : (
                                                getStatusBadge(payment.status)
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-zinc-500">
                                            {payment.razorpayPaymentId || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center">
                            <p className="text-zinc-400">No payment history found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
