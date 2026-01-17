"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
    id: string;
    code: string;
    name: string;
    ltp: string;
    credits: number;
    slot: string;
    coordinator: string;
    targetYear: string | null;
    targetProgram: string | null;
}

interface SlotCategory {
    id: string;
    name: string;
    courses: Course[];
}

interface SessionOption {
    id: string;
    name: string;
    fullName: string;
    isCurrent: boolean;
    isUpcoming: boolean;
}

export default function SlotwiseCoursesPage() {
    const { data: session } = useSession();
    const [sessions, setSessions] = useState<SessionOption[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>("");
    const [showSessionDropdown, setShowSessionDropdown] = useState(false);
    const [categories, setCategories] = useState<SlotCategory[]>([]);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch available sessions
    useEffect(() => {
        async function fetchSessions() {
            try {
                const response = await fetch("/api/sessions");
                if (!response.ok) throw new Error("Failed to fetch sessions");
                const data = await response.json();
                setSessions(data.sessions || []);

                // Set default to current session
                const current = data.sessions?.find((s: SessionOption) => s.isCurrent);
                if (current) {
                    setSelectedSession(current.id);
                } else if (data.sessions?.length > 0) {
                    setSelectedSession(data.sessions[0].id);
                }
            } catch (err) {
                console.error("Error fetching sessions:", err);
            }
        }

        if (session?.user) {
            fetchSessions();
        }
    }, [session]);

    // Fetch slotwise courses when session changes
    useEffect(() => {
        async function fetchSlotCourses() {
            if (!selectedSession) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/courses/slotwise?sessionId=${selectedSession}`);
                if (!response.ok) throw new Error("Failed to fetch slotwise courses");
                const data = await response.json();

                setCategories(data.categories || []);

                // Open all categories by default
                const defaultOpen: Record<string, boolean> = {};
                (data.categories || []).forEach((cat: SlotCategory) => {
                    defaultOpen[cat.id] = true;
                });
                setOpenCategories(defaultOpen);
            } catch (err) {
                console.error("Error fetching slotwise courses:", err);
                setError("Failed to load slotwise courses. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        if (selectedSession) {
            fetchSlotCourses();
        }
    }, [selectedSession]);

    const toggleCategory = (categoryId: string) => {
        setOpenCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const currentSessionOption = sessions.find((s) => s.id === selectedSession);

    if (loading && !categories.length) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Slotwise Courses</h1>

                {/* Session Selector */}
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-zinc-400">Load for session</span>
                    <div className="relative flex-1 max-w-2xl">
                        <button
                            onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/50 text-left"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-indigo-400">✓</span>
                                {currentSessionOption?.fullName || currentSessionOption?.name || "Select session"}
                            </span>
                            <ChevronDown className="h-4 w-4" />
                        </button>

                        {showSessionDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-white/10 bg-zinc-900 shadow-xl z-10">
                                {sessions.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setSelectedSession(s.id);
                                            setShowSessionDropdown(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2",
                                            s.id === selectedSession && "bg-indigo-600/20"
                                        )}
                                    >
                                        {s.id === selectedSession && (
                                            <span className="text-indigo-400">✓</span>
                                        )}
                                        {s.fullName || s.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                        {error}
                    </div>
                )}

                {/* Slot Categories */}
                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    </div>
                ) : categories.length > 0 ? (
                    <div className="space-y-4">
                        {categories.map((category) => (
                            <div key={category.id} className="rounded-xl border border-white/10 overflow-hidden">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900/80 hover:bg-zinc-900 transition-colors"
                                >
                                    <span className="font-medium">{category.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-zinc-500">
                                            {category.courses.length} course{category.courses.length !== 1 ? "s" : ""}
                                        </span>
                                        <ChevronRight
                                            className={cn(
                                                "h-5 w-5 transition-transform",
                                                openCategories[category.id] && "rotate-90"
                                            )}
                                        />
                                    </div>
                                </button>

                                {/* Courses Table */}
                                {openCategories[category.id] && category.courses.length > 0 && (
                                    <table>
                                        <thead>
                                            <tr className="bg-zinc-800/50">
                                                <th className="w-12">#</th>
                                                <th className="text-left">Code</th>
                                                <th className="text-left">Course Name</th>
                                                <th className="text-left">L-T-P-S-C</th>
                                                <th className="text-left">Slot</th>
                                                <th className="text-left">Coordinator</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {category.courses.map((course, idx) => (
                                                <tr key={course.id}>
                                                    <td className="text-zinc-500">{idx + 1}</td>
                                                    <td>
                                                        <Link
                                                            href={`/courses/${course.code}`}
                                                            className="text-indigo-400 hover:text-indigo-300"
                                                        >
                                                            {course.code}
                                                        </Link>
                                                    </td>
                                                    <td>{course.name}</td>
                                                    <td className="text-zinc-400">{course.ltp}</td>
                                                    <td className="text-zinc-400">{course.slot}</td>
                                                    <td className="text-zinc-400">{course.coordinator}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center rounded-xl border border-white/10">
                        <p className="text-zinc-400">No slotwise courses found for this session.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
