"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    BookOpen,
    Users,
    Clock,
    Plus,
    Loader2,
    AlertCircle,
    MessageSquare,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { CardSpotlight } from "@/components/ui/aceternity/card-spotlight";
import { HoverBorderGradient } from "@/components/ui/aceternity/hover-border-gradient";

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
    const [togglingFeedback, setTogglingFeedback] = useState<string | null>(null);

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
        <div className="min-h-screen bg-zinc-950 text-white p-6 relative overflow-hidden">
            <BackgroundBeams className="absolute inset-0 z-0" />
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                            Faculty Dashboard
                        </h1>
                        <p className="text-zinc-400">
                            Manage your courses, enrollments, and feedback
                        </p>
                    </div>

                    <Link href="/faculty/float-course">
                        <HoverBorderGradient
                            containerClassName="rounded-full"
                            as="button"
                            className="bg-zinc-900 text-white flex items-center gap-2 px-4 py-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Float New Course</span>
                        </HoverBorderGradient>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <CardSpotlight className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-indigo-500/10">
                                <BookOpen className="h-6 w-6 text-indigo-400" />
                            </div>
                            <span className="text-zinc-400">My Courses</span>
                        </div>
                        <p className="text-4xl font-bold text-white">{offerings.length}</p>
                    </CardSpotlight>

                    <CardSpotlight className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-amber-500/10">
                                <Clock className="h-6 w-6 text-amber-400" />
                            </div>
                            <span className="text-zinc-400">Pending Requests</span>
                        </div>
                        <p className="text-4xl font-bold text-white">{totalPending}</p>
                    </CardSpotlight>

                    <CardSpotlight className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-emerald-500/10">
                                <Users className="h-6 w-6 text-emerald-400" />
                            </div>
                            <span className="text-zinc-400">Total Enrolled</span>
                        </div>
                        <p className="text-4xl font-bold text-white">
                            {offerings.reduce((sum, o) => sum + o.currentStrength, 0)}
                        </p>
                    </CardSpotlight>
                </div>

                {/* Courses */}
                <h2 className="text-2xl font-semibold mb-6 text-white">My Courses</h2>
                {offerings.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-12 text-center backdrop-blur-sm">
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
                            <CardSpotlight
                                key={offering.offeringId}
                                className="p-0 overflow-hidden bg-zinc-900/80"
                            >
                                {/* Course Header */}
                                <div className="px-8 py-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-xl mb-1">
                                            <span className="text-indigo-400">
                                                {offering.courseCode}
                                            </span>{" "}
                                            - {offering.courseName}
                                        </h3>
                                        <p className="text-zinc-500">
                                            {offering.currentStrength} / {offering.maxStrength} enrolled
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* Feedback Toggle */}
                                        <button
                                            onClick={() => toggleFeedback(offering.offeringId, offering.feedbackOpen)}
                                            disabled={togglingFeedback === offering.offeringId}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${offering.feedbackOpen
                                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-white/10"
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

                                        {/* View Course Button */}
                                        <Link
                                            href={`/faculty/${offering.offeringId}/students`}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-sm font-medium border border-indigo-500/30 transition-all hover:scale-105"
                                        >
                                            <Users className="h-4 w-4" />
                                            View Course
                                            {offering.students.filter(s => s.enrollmentStatus === "PENDING").length > 0 && (
                                                <span className="ml-1 flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                </span>
                                            )}
                                        </Link>
                                    </div>
                                </div>
                            </CardSpotlight>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
