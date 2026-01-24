
"use client";

import { useState, useEffect, use, useMemo } from "react";
import { ArrowLeft, CheckCircle, XCircle, Filter, Search, Loader2, ChevronDown, Clock, Users, Download } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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

export default function BatchEnrollmentsPage({ params }: { params: Promise<{ department: string; year: string }> }) {
    const unwrappedParams = use(params);
    const department = decodeURIComponent(unwrappedParams.department);
    const year = unwrappedParams.year;

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [processing, setProcessing] = useState(false);

    // Filters and Sorting
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING_ADVISOR");
    const [sortBy, setSortBy] = useState<"rollNumber" | "requestTime">("requestTime");

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/advisor/enrollments?department=${encodeURIComponent(department)}&year=${year}`);
            const data = await res.json();
            if (data.enrollments) {
                setEnrollments(data.enrollments);
                setSelectedIds(new Set()); // Reset selection
            }
        } catch (error) {
            console.error("Failed to fetch enrollments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, [department, year]);

    const filteredEnrollments = useMemo(() => {
        let filtered = enrollments.filter(e => {
            const matchesSearch =
                e.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        // Sorting
        return [...filtered].sort((a, b) => {
            if (sortBy === "rollNumber") {
                return a.rollNumber.localeCompare(b.rollNumber);
            } else {
                return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
            }
        });
    }, [enrollments, searchQuery, statusFilter, sortBy]);

    const pendingCount = enrollments.filter(e => e.status === "PENDING_ADVISOR").length;

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    // Only allow selecting PENDING_ADVISOR items
    const pendingFiltered = filteredEnrollments.filter(e => e.status === "PENDING_ADVISOR");

    const toggleAll = () => {
        if (selectedIds.size === pendingFiltered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pendingFiltered.map(e => e.id)));
        }
    };

    const handleAction = async (ids: string[], action: "APPROVE" | "REJECT") => {
        if (ids.length === 0) return;
        if (!confirm(`Are you sure you want to ${action} ${ids.length} request(s)?`)) return;

        setProcessing(true);
        try {
            const res = await fetch("/api/advisor/enrollments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    enrollmentIds: ids,
                    action
                })
            });

            if (res.ok) {
                await fetchEnrollments();
            } else {
                alert("Failed to process requests");
            }
        } catch (error) {
            console.error("Error", error);
        } finally {
            setProcessing(false);
        }
    };

    const handleExport = () => {
        const headers = ["Roll Number", "Name", "Course Code", "Course Name", "Credits", "Status"];
        const rows = filteredEnrollments.map(e => [
            e.rollNumber,
            e.studentName,
            e.courseCode,
            e.courseName,
            e.credits.toString(),
            e.status
        ]);

        const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `enrollments_${year}_${department}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/advisor"
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            <span className="text-indigo-400">Batch {year}</span> Enrollment Management
                        </h1>
                        <p className="text-zinc-400 text-sm">{department}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by student, roll number, or course..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-800 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 rounded-lg bg-zinc-800 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING_ADVISOR">Pending Review</option>
                                <option value="ENROLLED">Approved / Enrolled</option>
                                <option value="ADVISOR_REJECTED">Rejected</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        </div>

                        {/* Sorting */}
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

                        {/* Export */}
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium transition-colors ml-auto"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                            <Users className="h-4 w-4" />
                            Total Requests
                        </div>
                        <p className="text-2xl font-bold">{enrollments.length}</p>
                    </div>
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <div className="flex items-center gap-2 text-amber-400 text-sm mb-1">
                            <Clock className="h-4 w-4" />
                            Pending Review
                        </div>
                        <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                            <CheckCircle className="h-4 w-4" />
                            Approved
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">{enrollments.filter(e => e.status === "ENROLLED").length}</p>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
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

                {/* Data Table */}
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
                                            checked={pendingFiltered.length > 0 && selectedIds.size === pendingFiltered.length}
                                            onChange={toggleAll}
                                            disabled={pendingFiltered.length === 0}
                                        />
                                    </th>
                                    <th className="py-3 px-4">Student</th>
                                    <th className="py-3 px-4">Course</th>
                                    <th className="py-3 px-4 text-center">Credits</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredEnrollments.map(e => (
                                    <tr key={e.id} className="hover:bg-white/5 transition-colors">
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
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-indigo-400">{e.courseCode}</div>
                                            <div className="text-xs text-zinc-500">{e.courseName}</div>
                                        </td>
                                        <td className="py-3 px-4 text-center text-zinc-400">{e.credits}</td>
                                        <td className="py-3 px-4 text-center">
                                            {e.status === "PENDING_ADVISOR" ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAction([e.id], "APPROVE")}
                                                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction([e.id], "REJECT")}
                                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {e.status === "ENROLLED" && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                                            Approved
                                                        </span>
                                                    )}
                                                    {e.status === "ADVISOR_REJECTED" && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                                                            Rejected
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredEnrollments.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-zinc-500">
                                            No enrollments found matching your filters.
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
