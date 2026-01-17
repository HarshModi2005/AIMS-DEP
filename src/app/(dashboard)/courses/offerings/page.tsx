"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search, Filter, X, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Instructor {
    id: string;
    name: string;
    isPrimary: boolean;
}

interface CourseOffering {
    id: string;
    code: string;
    name: string;
    ltp: string;
    credits: number;
    department: string;
    session: string;
    status: string;
    maxStrength: number;
    currentStrength: number;
    instructors: Instructor[];
}

interface SessionOption {
    id: string;
    name: string;
    fullName: string;
    isCurrent: boolean;
    isUpcoming: boolean;
}

const departments = [
    "All Departments",
    "Computer Science and Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Humanities and Social Sciences",
    "Mathematics",
    "Physics",
    "Chemistry",
];

const statusOptions = [
    { id: "all", label: "All Status" },
    { id: "PLANNED", label: "Planned" },
    { id: "OPEN_FOR_ENROLLMENT", label: "Open for Enrollment" },
    { id: "ENROLLMENT_CLOSED", label: "Enrollment Closed" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "COMPLETED", label: "Completed" },
];

export default function OfferingsPage() {
    const { data: session } = useSession();
    const [sessions, setSessions] = useState<SessionOption[]>([]);
    const [offerings, setOfferings] = useState<CourseOffering[]>([]);
    const [searchCode, setSearchCode] = useState("");
    const [searchTitle, setSearchTitle] = useState("");
    const [searchLTP, setSearchLTP] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
    const [selectedSession, setSelectedSession] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchInstructor, setSearchInstructor] = useState("");
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

    // Fetch offerings
    useEffect(() => {
        async function fetchOfferings() {
            if (!selectedSession) return;

            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                params.append("sessionId", selectedSession);
                if (searchCode) params.append("code", searchCode);
                if (searchTitle) params.append("title", searchTitle);
                if (selectedDepartment !== "All Departments") params.append("department", selectedDepartment);
                if (selectedStatus !== "all") params.append("status", selectedStatus);
                if (searchInstructor) params.append("instructor", searchInstructor);

                const response = await fetch(`/api/courses/offerings?${params.toString()}`);
                if (!response.ok) throw new Error("Failed to fetch offerings");
                const data = await response.json();

                setOfferings(data.offerings || []);
            } catch (err) {
                console.error("Error fetching offerings:", err);
                setError("Failed to load course offerings. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        if (selectedSession) {
            fetchOfferings();
        }
    }, [selectedSession, searchCode, searchTitle, selectedDepartment, selectedStatus, searchInstructor]);

    // Filter by LTP in memory
    const filteredOfferings = searchLTP
        ? offerings.filter((o) => o.ltp.includes(searchLTP))
        : offerings;

    const clearFilters = () => {
        setSearchCode("");
        setSearchTitle("");
        setSearchLTP("");
        setSelectedDepartment("All Departments");
        setSelectedStatus("all");
        setSearchInstructor("");
    };

    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
            "PLANNED": "bg-zinc-500/20 text-zinc-400",
            "OPEN_FOR_ENROLLMENT": "bg-emerald-500/20 text-emerald-400",
            "ENROLLMENT_CLOSED": "bg-amber-500/20 text-amber-400",
            "IN_PROGRESS": "bg-blue-500/20 text-blue-400",
            "COMPLETED": "bg-purple-500/20 text-purple-400",
        };
        const statusLabels: Record<string, string> = {
            "PLANNED": "Planned",
            "OPEN_FOR_ENROLLMENT": "Open",
            "ENROLLMENT_CLOSED": "Closed",
            "IN_PROGRESS": "Ongoing",
            "COMPLETED": "Completed",
        };
        return (
            <span className={cn("px-2 py-1 rounded-full text-xs", statusStyles[status] || "bg-zinc-500/20 text-zinc-400")}>
                {statusLabels[status] || status}
            </span>
        );
    };

    if (loading && !offerings.length) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Courses Available for Offering</h1>

                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Offering Department</label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Code</label>
                            <input
                                type="text"
                                placeholder="e.g., CS301"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Title</label>
                            <input
                                type="text"
                                placeholder="Search by title..."
                                value={searchTitle}
                                onChange={(e) => setSearchTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Acad Session</label>
                            <select
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.isCurrent ? "(Current)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">L-T-P</label>
                            <input
                                type="text"
                                placeholder="e.g., 3-1-2"
                                value={searchLTP}
                                onChange={(e) => setSearchLTP(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Instructor</label>
                            <input
                                type="text"
                                placeholder="Search instructor..."
                                value={searchInstructor}
                                onChange={(e) => setSearchInstructor(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </button>
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </button>
                    </div>
                </div>

                {/* Results Table */}
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        </div>
                    ) : filteredOfferings.length > 0 ? (
                        <table>
                            <thead>
                                <tr className="bg-zinc-900/80">
                                    <th className="w-12">#</th>
                                    <th>Offering Dept.</th>
                                    <th>Code</th>
                                    <th>Title</th>
                                    <th>L-T-P-S-C</th>
                                    <th>Instructor</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOfferings.map((course, idx) => (
                                    <tr key={course.id}>
                                        <td className="text-zinc-500">{idx + 1}</td>
                                        <td className="text-sm text-zinc-400">
                                            {course.department?.split(" ").map(w => w[0]).join("") || "N/A"}
                                        </td>
                                        <td>
                                            <span className="font-medium text-indigo-400">{course.code}</span>
                                        </td>
                                        <td className="text-zinc-300">{course.name}</td>
                                        <td className="text-zinc-400 text-sm">{course.ltp}</td>
                                        <td className="text-zinc-400 text-sm">
                                            {course.instructors?.map(i => i.name).join(", ") || "TBA"}
                                        </td>
                                        <td>{getStatusBadge(course.status)}</td>
                                        <td>
                                            <Link
                                                href={`/courses/${course.code}`}
                                                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center">
                            <Filter className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-lg text-zinc-400 mb-2">Nothing to show yet!</p>
                            <p className="text-sm text-zinc-500">Try adjusting your search filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
