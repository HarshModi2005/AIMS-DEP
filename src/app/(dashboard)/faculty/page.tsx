"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    BookOpen,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    Loader2,
    AlertCircle,
    MessageSquare,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";

interface StudentEnrollment {
    enrollmentId: string;
    studentId: string;
    rollNumber: string;
    name: string;
    email: string;
    enrollmentType: string;
    enrollmentStatus: string;
    requestedAt: string;
}

interface OfferingWithStudents {
    offeringId: string;
    courseCode: string;
    courseName: string;
    maxStrength: number;
    currentStrength: number;
    feedbackOpen: boolean;
    students: StudentEnrollment[];
}

export default function FacultyDashboard() {
    const { data: session, status } = useSession();
    const [offerings, setOfferings] = useState<OfferingWithStudents[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [togglingFeedback, setTogglingFeedback] = useState<string | null>(null);
    const [selectedOffering, setSelectedOffering] = useState<OfferingWithStudents | null>(null);

    // Fetch offerings and pending requests
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/faculty/enrollments");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setOfferings(data.offerings || []);
            } catch {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated" && session?.user?.role === "FACULTY") {
            fetchData();
        }
    }, [session, status]);

    // Auth check - show loading during auth, redirect non-faculty
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (status === "unauthenticated" || session?.user?.role !== "FACULTY") {
        redirect("/");
    }

    const handleAction = async (enrollmentId: string, action: "APPROVE" | "REJECT") => {
        setProcessingId(enrollmentId);
        try {
            const res = await fetch("/api/faculty/enrollments", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enrollmentId, action }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to process");
            }

            // Update local state
            setOfferings((prev) =>
                prev.map((o) => ({
                    ...o,
                    students: o.students.map((s) =>
                        s.enrollmentId === enrollmentId
                            ? { ...s, enrollmentStatus: action === "APPROVE" ? "ENROLLED" : "DROPPED" }
                            : s
                    ),
                    currentStrength: action === "APPROVE" ? o.currentStrength + 1 : o.currentStrength,
                }))
            );

            // Also update selectedOffering if it exists
            if (selectedOffering) {
                setSelectedOffering((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        students: prev.students.map((s) =>
                            s.enrollmentId === enrollmentId
                                ? { ...s, enrollmentStatus: action === "APPROVE" ? "ENROLLED" : "DROPPED" }
                                : s
                        ),
                        currentStrength: action === "APPROVE" ? prev.currentStrength + 1 : prev.currentStrength,
                    };
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to process");
        } finally {
            setProcessingId(null);
        }
    };

    const toggleFeedback = async (offeringId: string, currentState: boolean) => {
        setTogglingFeedback(offeringId);
        try {
            const res = await fetch("/api/faculty/feedback", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ offeringId, feedbackOpen: !currentState }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to toggle");
            }

            // Update local state
            setOfferings((prev) =>
                prev.map((o) =>
                    o.offeringId === offeringId
                        ? { ...o, feedbackOpen: !currentState }
                        : o
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to toggle feedback");
        } finally {
            setTogglingFeedback(null);
        }
    };

    const totalPending = offerings.reduce(
        (sum, o) => sum + o.students.filter(s => s.enrollmentStatus === "PENDING").length,
        0
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
                        <p className="text-zinc-400 mt-1">
                            Manage your courses, enrollments, and feedback
                        </p>
                    </div>
                    <Link
                        href="/faculty/float-course"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Float New Course
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto">×</button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="h-5 w-5 text-indigo-400" />
                            <span className="text-zinc-400">My Courses</span>
                        </div>
                        <p className="text-2xl font-bold">{offerings.length}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-5 w-5 text-amber-400" />
                            <span className="text-zinc-400">Pending Requests</span>
                        </div>
                        <p className="text-2xl font-bold">{totalPending}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="h-5 w-5 text-emerald-400" />
                            <span className="text-zinc-400">Total Enrolled</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {offerings.reduce((sum, o) => sum + o.currentStrength, 0)}
                        </p>
                    </div>
                </div>

                {/* Courses */}
                <h2 className="text-xl font-semibold mb-4">My Courses</h2>
                {offerings.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-12 text-center">
                        <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-400">
                            You haven't floated any courses yet.
                        </p>
                        <Link
                            href="/faculty/float-course"
                            className="inline-block mt-4 text-indigo-400 hover:text-indigo-300"
                        >
                            Float your first course →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {offerings.map((offering) => (
                            <div
                                key={offering.offeringId}
                                className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden"
                            >
                                {/* Course Header */}
                                <div className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            <span className="text-indigo-400">
                                                {offering.courseCode}
                                            </span>{" "}
                                            - {offering.courseName}
                                        </h3>
                                        <p className="text-sm text-zinc-500">
                                            {offering.currentStrength} / {offering.maxStrength} enrolled
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* Feedback Toggle */}
                                        <button
                                            onClick={() => toggleFeedback(offering.offeringId, offering.feedbackOpen)}
                                            disabled={togglingFeedback === offering.offeringId}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${offering.feedbackOpen
                                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                                : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"
                                                }`}
                                        >
                                            {togglingFeedback === offering.offeringId ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : offering.feedbackOpen ? (
                                                <ToggleRight className="h-4 w-4" />
                                            ) : (
                                                <ToggleLeft className="h-4 w-4" />
                                            )}
                                            <MessageSquare className="h-3 w-3" />
                                            Feedback {offering.feedbackOpen ? "Open" : "Closed"}
                                        </button>

                                        {/* View Students Button */}
                                        <button
                                            onClick={() => setSelectedOffering(offering)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-sm transition-colors"
                                        >
                                            <Users className="h-4 w-4" />
                                            View Students
                                            {offering.students.filter(s => s.enrollmentStatus === "PENDING").length > 0 && (
                                                <span className="ml-1 flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Students Modal */}
                {selectedOffering && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-4xl max-h-[85vh] bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        <span className="text-indigo-400">{selectedOffering.courseCode}</span>
                                        {" "}- Enrolled Students
                                    </h2>
                                    <p className="text-zinc-400 text-sm mt-1">
                                        Manage enrollments for {selectedOffering.courseName}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOffering(null)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <XCircle className="h-6 w-6 text-zinc-400" />
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Pending Requests Section */}
                                {selectedOffering.students.some(s => s.enrollmentStatus === "PENDING") && (
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Clock className="h-5 w-5 text-amber-400" />
                                            <h3 className="text-lg font-semibold text-amber-400">Pending Requests</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {selectedOffering.students
                                                .filter(s => s.enrollmentStatus === "PENDING")
                                                .map((req) => (
                                                    <div
                                                        key={req.enrollmentId}
                                                        className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <p className="font-medium">{req.name}</p>
                                                            <p className="text-sm text-zinc-500">
                                                                {req.rollNumber} • {req.email}
                                                            </p>
                                                            <p className="text-xs text-zinc-600 mt-1">
                                                                Type: {req.enrollmentType} • Requested:{" "}
                                                                {new Date(req.requestedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleAction(req.enrollmentId, "APPROVE")
                                                                }
                                                                disabled={processingId === req.enrollmentId}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm disabled:opacity-50"
                                                            >
                                                                {processingId === req.enrollmentId ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="h-3 w-3" />
                                                                )}
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleAction(req.enrollmentId, "REJECT")
                                                                }
                                                                disabled={processingId === req.enrollmentId}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50"
                                                            >
                                                                <XCircle className="h-3 w-3" />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Enrolled Students Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users className="h-5 w-5 text-indigo-400" />
                                        <h3 className="text-lg font-semibold">Enrolled Students ({selectedOffering.students.filter(s => s.enrollmentStatus === "ENROLLED").length})</h3>
                                    </div>

                                    {selectedOffering.students.filter(s => s.enrollmentStatus === "ENROLLED").length > 0 ? (
                                        <div className="border border-white/10 rounded-lg overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-white/5 text-zinc-400">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">Name</th>
                                                        <th className="px-4 py-3 font-medium">Roll Number</th>
                                                        <th className="px-4 py-3 font-medium">Email</th>
                                                        <th className="px-4 py-3 font-medium">Type</th>
                                                        <th className="px-4 py-3 font-medium">Joined</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {selectedOffering.students
                                                        .filter(s => s.enrollmentStatus === "ENROLLED")
                                                        .sort((a, b) => a.name.localeCompare(b.name))
                                                        .map((student) => (
                                                            <tr key={student.enrollmentId} className="hover:bg-white/5 transition-colors">
                                                                <td className="px-4 py-3 font-medium">{student.name}</td>
                                                                <td className="px-4 py-3 text-zinc-400">{student.rollNumber}</td>
                                                                <td className="px-4 py-3 text-zinc-400">{student.email}</td>
                                                                <td className="px-4 py-3 text-zinc-400 capitalize">{student.enrollmentType.toLowerCase()}</td>
                                                                <td className="px-4 py-3 text-zinc-400">{new Date(student.requestedAt).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-zinc-500 border border-dashed border-white/10 rounded-lg">
                                            No students enrolled yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
