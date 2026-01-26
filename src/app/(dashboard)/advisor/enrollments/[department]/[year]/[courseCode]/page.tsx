
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Download,
    CheckCircle,
    XCircle,
    Loader2,
    Users,
    Filter,
    ChevronDown,
    Clock,
} from "lucide-react";

interface Enrollment {
    id: string;
    studentName: string;
    rollNumber: string;
    courseCode: string;
    courseName: string;
    status: string;
    credits: number;
    requestedAt: string;
}

export default function CourseEnrollmentPage() {
    const params = useParams();
    const rawDepartment = params.department as string;
    const rawCourseCode = params.courseCode as string;
    const year = params.year as string;

    const department = decodeURIComponent(rawDepartment);
    const courseCode = decodeURIComponent(rawCourseCode);

    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"rollNumber" | "requestTime">("requestTime");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                // courseCode and department are already decoded here
                const res = await fetch(
                    `/api/advisor/enrollments?department=${encodeURIComponent(department)}&year=${year}&courseCode=${encodeURIComponent(courseCode)}&mode=students`
                );
                const data = await res.json();
                if (data.enrollments) {
                    setEnrollments(data.enrollments);
                }
            } catch (error) {
                console.error("Failed to fetch enrollments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [department, year, courseCode]);

    const filteredEnrollments = useMemo(() => {
        let result = [...enrollments];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                e =>
                    e.studentName.toLowerCase().includes(query) ||
                    e.rollNumber.toLowerCase().includes(query)
            );
        }

        result.sort((a, b) => {
            if (sortBy === "rollNumber") {
                return a.rollNumber.localeCompare(b.rollNumber);
            } else {
                return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
            }
        });

        return result;
    }, [enrollments, searchQuery, sortBy]);

    const handleAction = async (ids: string[], action: "APPROVE" | "REJECT") => {
        setProcessing(true);
        try {
            const res = await fetch("/api/advisor/enrollments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enrollmentIds: ids, action })
            });

            if (res.ok) {
                const targetStatus = action === "APPROVE" ? "ENROLLED" : "ADVISOR_REJECTED";
                setEnrollments(prev =>
                    prev.map(e => (ids.includes(e.id) ? { ...e, status: targetStatus } : e))
                );
                setSelectedIds(new Set());
            }
        } catch (error) {
            console.error("Failed to process action", error);
        } finally {
            setProcessing(false);
        }
    };

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        const pendingInFiltered = filteredEnrollments.filter(e => e.status === "PENDING_ADVISOR");
        if (selectedIds.size === pendingInFiltered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pendingInFiltered.map(e => e.id)));
        }
    };

    const handleExport = () => {
        const headers = ["Roll Number", "Name", "Course Code", "Course Name", "Credits", "Status", "Requested At"];
        const rows = filteredEnrollments.map(e => [
            e.rollNumber,
            e.studentName,
            e.courseCode,
            e.courseName,
            e.credits,
            e.status,
            e.requestedAt
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `enrollments_${courseCode}_${department}_${year}.csv`;
        a.click();
    };

    const handleFilteredAction = async (action: "APPROVE" | "REJECT") => {
        const pendingIds = filteredEnrollments
            .filter(e => e.status === "PENDING_ADVISOR")
            .map(e => e.id);

        if (pendingIds.length === 0) return;

        if (confirm(`Are you sure you want to ${action.toLowerCase()} all ${pendingIds.length} pending requests in the current filtered view?`)) {
            await handleAction(pendingIds, action);
        }
    };

    const pendingCount = enrollments.filter(e => e.status === "PENDING_ADVISOR").length;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            <span className="text-indigo-400">{courseCode}</span> Enrollment Requests
                        </h1>
                        <p className="text-zinc-400 text-sm">{department} - Batch {year}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by student or roll number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-800 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm"
                            />
                        </div>

                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="pl-10 pr-8 py-2 rounded-lg bg-zinc-800 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="requestTime">Sort by Request Time</option>
                                <option value="rollNumber">Sort by Roll Number</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        </div>

                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </button>

                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                                Actions
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-56 bg-zinc-800 border border-white/10 rounded-lg shadow-xl hidden group-hover:block z-20">
                                <div className="p-1">
                                    <button
                                        onClick={() => handleFilteredAction("APPROVE")}
                                        disabled={filteredEnrollments.filter(e => e.status === "PENDING_ADVISOR").length === 0}
                                        className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 text-emerald-400 rounded text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve Filtered ({filteredEnrollments.filter(e => e.status === "PENDING_ADVISOR").length})
                                    </button>
                                    <button
                                        onClick={() => handleFilteredAction("REJECT")}
                                        disabled={filteredEnrollments.filter(e => e.status === "PENDING_ADVISOR").length === 0}
                                        className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 rounded text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Reject Filtered ({filteredEnrollments.filter(e => e.status === "PENDING_ADVISOR").length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-6 flex items-center justify-between">
                        <span className="text-indigo-300 text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {selectedIds.size} request(s) selected
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleAction(Array.from(selectedIds), "REJECT")}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors"
                            >
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                Reject Selected
                            </button>
                            <button
                                onClick={() => handleAction(Array.from(selectedIds), "APPROVE")}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-colors"
                            >
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                Approve Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-zinc-400 font-medium">
                                <tr>
                                    <th className="py-3 px-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-zinc-700 bg-zinc-800"
                                            checked={filteredEnrollments.filter(e => e.status === "PENDING_ADVISOR").length > 0 && selectedIds.size === filteredEnrollments.filter(e => e.status === "PENDING_ADVISOR").length}
                                            onChange={toggleAll}
                                        />
                                    </th>
                                    <th className="py-3 px-4">Student</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredEnrollments.map(e => (
                                    <tr key={e.id} className="hover:bg-white/5">
                                        <td className="py-3 px-4">
                                            {e.status === "PENDING_ADVISOR" && (
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-zinc-700 bg-zinc-800"
                                                    checked={selectedIds.has(e.id)}
                                                    onChange={() => toggleSelection(e.id)}
                                                />
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-white">{e.studentName}</div>
                                            <div className="text-xs text-zinc-500 font-mono">{e.rollNumber}</div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {e.status === "PENDING_ADVISOR" ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                                                    Pending Advisor
                                                </span>
                                            ) : e.status === "ENROLLED" ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                                                    Rejected
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {e.status === "PENDING_ADVISOR" && (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAction([e.id], "APPROVE")}
                                                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction([e.id], "REJECT")}
                                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredEnrollments.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-zinc-500">
                                            No enrollment requests found for this course.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
