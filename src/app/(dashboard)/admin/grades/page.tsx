
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2, Calendar, Search, ToggleLeft, ToggleRight, Save, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AcademicDate {
    id: string;
    sessionId: string;
    startDate: string; // ISO
    endDate: string; // ISO
    isVisible: boolean;
}

interface CourseOverride {
    id: string; // courseOffering id
    courseCode: string;
    courseName: string;
    department: string;
    gradeSubmissionEnabled: boolean | null; // null = global, true = open, false = closed
}

export default function AdminGradesPage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [globalDate, setGlobalDate] = useState<AcademicDate | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Course Search
    const [searchQuery, setSearchQuery] = useState("");
    const [courseResults, setCourseResults] = useState<CourseOverride[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN")) {
            fetchGlobalSettings();
        }
    }, [status, session]);

    const fetchGlobalSettings = async () => {
        try {
            const res = await fetch("/api/admin/grade-window");
            if (res.ok) {
                const data = await res.json();
                if (data.window) {
                    setGlobalDate(data.window);
                    // Convert to datetime-local format: YYYY-MM-DDTHH:MM
                    setStartDate(new Date(data.window.startDate).toISOString().slice(0, 16));
                    setEndDate(new Date(data.window.endDate).toISOString().slice(0, 16));
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const saveGlobalSettings = async () => {
        setProcessing(true);
        try {
            const res = await fetch("/api/admin/grade-window", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString()
                }),
            });

            if (res.ok) {
                alert("Global grade submission window updated.");
                fetchGlobalSettings();
            } else {
                alert("Failed to update settings.");
            }
        } catch (error) {
            console.error("Error saving settings", error);
        } finally {
            setProcessing(false);
        }
    };

    const searchCourses = async () => {
        if (!searchQuery) return;
        setSearching(true);
        try {
            const res = await fetch(`/api/admin/grade-window/courses?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setCourseResults(data.courses || []);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setSearching(false);
        }
    };

    const toggleCourseOverride = async (offeringId: string, currentState: boolean | null, targetState: boolean | null) => {
        // Optimistic update
        setCourseResults(prev => prev.map(c => c.id === offeringId ? { ...c, gradeSubmissionEnabled: targetState } : c));

        try {
            const res = await fetch(`/api/admin/grade-window/courses/${offeringId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: targetState }),
            });

            if (!res.ok) {
                // Revert on failure
                setCourseResults(prev => prev.map(c => c.id === offeringId ? { ...c, gradeSubmissionEnabled: currentState } : c));
                alert("Failed to update course override.");
            }
        } catch (error) {
            console.error("Override failed", error);
            setCourseResults(prev => prev.map(c => c.id === offeringId ? { ...c, gradeSubmissionEnabled: currentState } : c));
        }
    };

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
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Grade Submission Control</h1>
                    <p className="text-zinc-400">Manage global submission window and course-specific overrides.</p>
                </div>

                {/* Global Settings */}
                <div className="bg-zinc-900 rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-400" />
                        Global Submission Window
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Start Date & Time</label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">End Date & Time</label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                        <button
                            onClick={saveGlobalSettings}
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Update Global Window
                        </button>
                        {globalDate && (
                            <p className="text-sm text-zinc-500">
                                Current window: <span className="text-zinc-300">{format(new Date(globalDate.startDate), "PP p")}</span> to <span className="text-zinc-300">{format(new Date(globalDate.endDate), "PP p")}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Course Overrides */}
                <div className="bg-zinc-900 rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ToggleLeft className="h-5 w-5 text-emerald-400" />
                        Course Overrides
                    </h2>
                    <p className="text-sm text-zinc-400 mb-6">
                        Manually open or close submission for specific courses, regardless of the global window.
                    </p>

                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search course code or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && searchCourses()}
                                className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={searchCourses}
                            disabled={searching}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors border border-white/10"
                        >
                            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-white/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-950 text-zinc-400">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Course</th>
                                    <th className="px-4 py-3 font-medium">Department</th>
                                    <th className="px-4 py-3 font-medium text-center">Current Mode</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {courseResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                                            {searchQuery ? "No courses found." : "Search for a course to manage overrides."}
                                        </td>
                                    </tr>
                                ) : (
                                    courseResults.map((course) => (
                                        <tr key={course.id} className="bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-white">{course.courseCode}</div>
                                                <div className="text-zinc-500 text-xs">{course.courseName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400">{course.department}</td>
                                            <td className="px-4 py-3 text-center">
                                                {course.gradeSubmissionEnabled === true && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30">
                                                        Always Open
                                                    </span>
                                                )}
                                                {course.gradeSubmissionEnabled === false && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs border border-red-500/30">
                                                        Always Closed
                                                    </span>
                                                )}
                                                {course.gradeSubmissionEnabled === null && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-500/20 text-zinc-400 text-xs border border-white/10">
                                                        Global Default
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleCourseOverride(course.id, course.gradeSubmissionEnabled, null)}
                                                        className={`px-3 py-1 rounded text-xs transition-colors ${course.gradeSubmissionEnabled === null ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                                                        title="Follow Global Settings"
                                                    >
                                                        Auto
                                                    </button>
                                                    <button
                                                        onClick={() => toggleCourseOverride(course.id, course.gradeSubmissionEnabled, true)}
                                                        className={`px-3 py-1 rounded text-xs transition-colors ${course.gradeSubmissionEnabled === true ? "bg-emerald-600 text-white" : "bg-zinc-800 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"}`}
                                                        title="Force Open"
                                                    >
                                                        Open
                                                    </button>
                                                    <button
                                                        onClick={() => toggleCourseOverride(course.id, course.gradeSubmissionEnabled, false)}
                                                        className={`px-3 py-1 rounded text-xs transition-colors ${course.gradeSubmissionEnabled === false ? "bg-red-600 text-white" : "bg-zinc-800 text-red-400 hover:bg-red-500/10 border border-red-500/20"}`}
                                                        title="Force Close"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
