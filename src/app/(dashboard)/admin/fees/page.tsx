"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentFeeDetails {
    studentName: string;
    studentEmail: string;
    rollNumber: string;
    sessions: {
        id: string;
        name: string;
        semesterFee: number;
        status: "PAID" | "PENDING";
        paymentDate?: string;
        amountPaid?: number;
    }[];
}

export default function AdminFeesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [studentData, setStudentData] = useState<StudentFeeDetails | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setStudentData(null);

        try {
            const response = await fetch(`/api/admin/fees/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch student details");
            }

            setStudentData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Fee Management</h1>
                    <p className="text-zinc-400 mt-1">Search students and view payment records</p>
                </div>

                {/* Search Bar */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Enter student email or entry number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-zinc-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <Button type="submit" size="lg" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
                        </Button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 mb-8 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {/* Results */}
                {studentData && (
                    <div className="space-y-6">
                        {/* Student Profile Card */}
                        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">{studentData.studentName}</h2>
                                <p className="text-zinc-400">{studentData.studentEmail}</p>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm border border-indigo-500/20">
                                    <FileText className="h-4 w-4" />
                                    <span>{studentData.rollNumber}</span>
                                </div>
                            </div>
                        </div>

                        {/* Session Fee Status */}
                        <h3 className="text-lg font-semibold">Semester Fee Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {studentData.sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`rounded-xl border p-6 flex items-center justify-between transition-all ${session.status === "PAID"
                                            ? "bg-emerald-900/10 border-emerald-500/20"
                                            : "bg-zinc-900/50 border-white/10"
                                        }`}
                                >
                                    <div>
                                        <h4 className="font-semibold text-lg">{session.name}</h4>
                                        <p className="text-sm text-zinc-400 mt-1">Fee Amount: ₹{session.semesterFee}</p>
                                        {session.status === "PAID" && (
                                            <p className="text-xs text-emerald-400 mt-2">Paid on {new Date(session.paymentDate!).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                    <div>
                                        {session.status === "PAID" ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                                                    <CheckCircle className="h-4 w-4" />
                                                    PAID
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium">
                                                    <Clock className="h-4 w-4" />
                                                    PENDING
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
