"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ConfirmationModal from "@/components/ui/confirmation-modal";

interface PendingOffering {
    id: string;
    courseCode: string;
    courseName: string;
    department: string;
    credits: number;
    instructor: string;
    session: string;
    maxStrength: number;
    floatedAt: string;
}

export default function AdminApprovalsPage() {
    const { data: session, status } = useSession();
    const [offerings, setOfferings] = useState<PendingOffering[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    // Confirmation Modal State
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ offering: PendingOffering, type: "approve" | "reject" } | null>(null);

    useEffect(() => {
        if (status === "authenticated" && (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN")) {
            fetchPendingOfferings();
        }
    }, [session, status]);

    async function fetchPendingOfferings() {
        try {
            const res = await fetch("/api/admin/approvals");
            if (res.ok) {
                const data = await res.json();
                setOfferings(data.offerings || []);
            }
        } catch (error) {
            console.error("Failed to fetch offerings", error);
        } finally {
            setLoading(false);
        }
    }

    function handleApproval(offering: PendingOffering, action: "approve" | "reject") {
        setConfirmAction({ offering, type: action });
        setShowConfirm(true);
    }

    async function executeApproval() {
        if (!confirmAction) return;
        const { offering, type: action } = confirmAction;
        const id = offering.id;

        setProcessingId(id);
        setMessage(null);
        setShowConfirm(false);

        try {
            const status = action === "approve" ? "OPEN_FOR_ENROLLMENT" : "REJECTED";
            const res = await fetch(`/api/admin/approvals/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            // Remove from list
            setOfferings((prev) => prev.filter((o) => o.id !== id));
            setMessage({
                type: "success",
                text: `Course ${action === "approve" ? "approved" : "rejected"} successfully`
            });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            setMessage({ type: "error", text: "Failed to process request" });
        } finally {
            setProcessingId(null);
            setConfirmAction(null);
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Pending Approvals</h1>
                        <p className="text-zinc-400">Review and approve faculty course offerings</p>
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                        {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        {message.text}
                    </div>
                )}

                {offerings.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-white/10">
                        <CheckCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-zinc-400">All Caught Up!</h3>
                        <p className="text-zinc-500">No pending course approvals found.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-zinc-900/80 text-sm text-zinc-400">
                                    <th className="text-left p-4 font-medium">Course Code</th>
                                    <th className="text-left p-4 font-medium">Course Name</th>
                                    <th className="text-left p-4 font-medium">Instructor</th>
                                    <th className="text-left p-4 font-medium">Department</th>
                                    <th className="text-left p-4 font-medium">Credits</th>
                                    <th className="text-left p-4 font-medium">Strength</th>
                                    <th className="text-left p-4 font-medium">Floated On</th>
                                    <th className="text-right p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {offerings.map((offering) => (
                                    <tr key={offering.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400">
                                                {offering.courseCode}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-white">{offering.courseName}</td>
                                        <td className="p-4 text-zinc-400">{offering.instructor}</td>
                                        <td className="p-4 text-zinc-400 text-sm">{offering.department}</td>
                                        <td className="p-4 text-zinc-400">{offering.credits}</td>
                                        <td className="p-4 text-zinc-400">{offering.maxStrength}</td>
                                        <td className="p-4 text-zinc-400 text-sm">{format(new Date(offering.floatedAt), "MMM d, yyyy")}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleApproval(offering, "reject")}
                                                    disabled={processingId === offering.id}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                                                    title="Reject"
                                                >
                                                    {processingId === offering.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(offering, "approve")}
                                                    disabled={processingId === offering.id}
                                                    className="p-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 border border-emerald-600/20 disabled:opacity-50 transition-colors"
                                                    title="Approve"
                                                >
                                                    {processingId === offering.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <ConfirmationModal
                    isOpen={showConfirm}
                    onClose={() => {
                        setShowConfirm(false);
                        setConfirmAction(null);
                    }}
                    onConfirm={executeApproval}
                    title={confirmAction?.type === "approve" ? "Confirm Course Approval" : "Confirm Course Rejection"}
                    message={`Are you sure you want to ${confirmAction?.type} the course offering for "${confirmAction?.offering.courseCode}: ${confirmAction?.offering.courseName}"?`}
                    confirmLabel={confirmAction?.type === "approve" ? "Yes, Approve" : "Yes, Reject"}
                />
            </div>
        </div>
    );
}
