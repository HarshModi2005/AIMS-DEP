"use client";

import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Filter,
    Download,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    Users,
    ChevronDown,
    Clock,
    X,
} from "lucide-react";

interface Student {
    enrollmentId: string;
    studentId: string;
    rollNumber: string;
    name: string;
    email: string;
    department: string;
    departmentCode: string;
    year: number;
    enrollmentType: string;
    enrollmentStatus: string;
    requestedAt: string;
}

interface OfferingData {
    id: string;
    courseCode: string;
    courseName: string;
    maxStrength: number;
    currentStrength: number;
}

interface FilterOptions {
    departments: string[];
    years: number[];
}

export default function StudentManagementPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const offeringId = params.offeringId as string;

    const [offering, setOffering] = useState<OfferingData | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ departments: [], years: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<string>("");
    const [yearFilter, setYearFilter] = useState<string>("");

    // Action states
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [bulkApproving, setBulkApproving] = useState(false);
    const [showBulkMenu, setShowBulkMenu] = useState(false);
    const [showBulkConfirm, setShowBulkConfirm] = useState<{ type: string; value?: string; count: number } | null>(null);

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/faculty/offerings/${offeringId}/students`);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to fetch");
                }
                const data = await res.json();
                setOffering(data.offering);
                setStudents(data.students);
                setFilterOptions(data.filterOptions);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated" && session?.user?.role === "FACULTY") {
            fetchData();
        }
    }, [session, status, offeringId]);

    // Auth check
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

    // Filtered students
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                !searchQuery ||
                student.name.toLowerCase().includes(searchLower) ||
                student.rollNumber.toLowerCase().includes(searchLower) ||
                student.email.toLowerCase().includes(searchLower);

            // Department filter
            const matchesDepartment =
                !departmentFilter || student.departmentCode === departmentFilter;

            // Year filter
            const matchesYear =
                !yearFilter || student.year.toString() === yearFilter;

            return matchesSearch && matchesDepartment && matchesYear;
        });
    }, [students, searchQuery, departmentFilter, yearFilter]);

    // Separate pending and enrolled
    const pendingStudents = filteredStudents.filter((s) => s.enrollmentStatus === "PENDING");
    const enrolledStudents = filteredStudents.filter(
        (s) => s.enrollmentStatus === "ENROLLED" || s.enrollmentStatus === "PENDING_ADVISOR"
    );
    const otherStudents = filteredStudents.filter(
        (s) => s.enrollmentStatus !== "PENDING" &&
            s.enrollmentStatus !== "ENROLLED" &&
            s.enrollmentStatus !== "PENDING_ADVISOR"
    );

    // Handle individual approval/rejection
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
            setStudents((prev) =>
                prev.map((s) =>
                    s.enrollmentId === enrollmentId
                        ? { ...s, enrollmentStatus: action === "APPROVE" ? "PENDING_ADVISOR" : "DROPPED" }
                        : s
                )
            );

            // Update offering strength
            if (action === "APPROVE" && offering) {
                setOffering({ ...offering, currentStrength: offering.currentStrength + 1 });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to process");
        } finally {
            setProcessingId(null);
        }
    };

    // Handle bulk approval
    const handleBulkApprove = async (type: "ALL" | "DEPARTMENT" | "YEAR", value?: string) => {
        setBulkApproving(true);
        setShowBulkConfirm(null);
        setShowBulkMenu(false);

        try {
            const res = await fetch(`/api/faculty/offerings/${offeringId}/bulk-approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, value }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to bulk approve");
            }

            // Refresh data
            const refreshRes = await fetch(`/api/faculty/offerings/${offeringId}/students`);
            const refreshData = await refreshRes.json();
            setOffering(refreshData.offering);
            setStudents(refreshData.students);

            // Show success message briefly
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to bulk approve");
        } finally {
            setBulkApproving(false);
        }
    };

    // Calculate pending count for bulk approve options
    const getPendingCountFor = (type: "ALL" | "DEPARTMENT" | "YEAR", value?: string) => {
        const pending = students.filter((s) => s.enrollmentStatus === "PENDING");
        if (type === "ALL") return pending.length;
        if (type === "DEPARTMENT") return pending.filter((s) => s.departmentCode === value).length;
        if (type === "YEAR") return pending.filter((s) => s.year.toString() === value).length;
        return 0;
    };

    // CSV Export
    const handleExport = () => {
        const headers = ["Roll Number", "Name", "Email", "Department", "Year", "Type", "Status"];
        const rows = filteredStudents.map((s) => [
            s.rollNumber,
            s.name,
            s.email,
            s.department,
            s.year.toString(),
            s.enrollmentType,
            s.enrollmentStatus,
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${offering?.courseCode || "students"}_enrollments.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Clear filters
    const clearFilters = () => {
        setSearchQuery("");
        setDepartmentFilter("");
        setYearFilter("");
    };

    const hasActiveFilters = searchQuery || departmentFilter || yearFilter;

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!offering) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-lg">Course not found</p>
                    <Link href="/faculty" className="text-indigo-400 hover:underline mt-2 block">
                        Go back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const availableSeats = offering.maxStrength - offering.currentStrength;
    const totalPending = students.filter((s) => s.enrollmentStatus === "PENDING").length;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/faculty"
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                <span className="text-indigo-400">{offering.courseCode}</span> - Students
                            </h1>
                            <p className="text-zinc-400 text-sm">{offering.courseName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-zinc-400">Capacity</p>
                            <p className="font-semibold">
                                {offering.currentStrength} / {offering.maxStrength}
                                <span className="text-sm text-zinc-500 ml-2">
                                    ({availableSeats} seats left)
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Search and Filter Bar */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by name, roll number, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-800 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm"
                            />
                        </div>

                        {/* Department Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 rounded-lg bg-zinc-800 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="">All Departments</option>
                                {filterOptions.departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        </div>

                        {/* Year Filter */}
                        <div className="relative">
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="pl-4 pr-8 py-2 rounded-lg bg-zinc-800 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="">All Years</option>
                                {filterOptions.years.map((year) => (
                                    <option key={year} value={year.toString()}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-auto">
                            {/* Bulk Approve Dropdown */}
                            {totalPending > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowBulkMenu(!showBulkMenu)}
                                        disabled={bulkApproving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-medium disabled:opacity-50 transition-colors"
                                    >
                                        {bulkApproving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4" />
                                        )}
                                        Bulk Approve
                                        <ChevronDown className="h-4 w-4" />
                                    </button>

                                    {showBulkMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-zinc-800 border border-white/10 shadow-xl z-50 overflow-hidden">
                                            {/* Approve All */}
                                            <button
                                                onClick={() => {
                                                    const count = getPendingCountFor("ALL");
                                                    setShowBulkConfirm({ type: "ALL", count });
                                                    setShowBulkMenu(false);
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-white/5 text-sm flex justify-between items-center"
                                            >
                                                <span>Approve All Pending</span>
                                                <span className="text-xs text-zinc-500">
                                                    {getPendingCountFor("ALL")}
                                                </span>
                                            </button>

                                            {/* By Department */}
                                            <div className="border-t border-white/10">
                                                <p className="px-4 py-2 text-xs text-zinc-500 uppercase">
                                                    By Department
                                                </p>
                                                {filterOptions.departments.map((dept) => {
                                                    const count = getPendingCountFor("DEPARTMENT", dept);
                                                    if (count === 0) return null;
                                                    return (
                                                        <button
                                                            key={dept}
                                                            onClick={() => {
                                                                setShowBulkConfirm({
                                                                    type: "DEPARTMENT",
                                                                    value: dept,
                                                                    count,
                                                                });
                                                                setShowBulkMenu(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left hover:bg-white/5 text-sm flex justify-between items-center"
                                                        >
                                                            <span>{dept}</span>
                                                            <span className="text-xs text-zinc-500">{count}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* By Year */}
                                            <div className="border-t border-white/10">
                                                <p className="px-4 py-2 text-xs text-zinc-500 uppercase">
                                                    By Year
                                                </p>
                                                {filterOptions.years.map((year) => {
                                                    const count = getPendingCountFor("YEAR", year.toString());
                                                    if (count === 0) return null;
                                                    return (
                                                        <button
                                                            key={year}
                                                            onClick={() => {
                                                                setShowBulkConfirm({
                                                                    type: "YEAR",
                                                                    value: year.toString(),
                                                                    count,
                                                                });
                                                                setShowBulkMenu(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left hover:bg-white/5 text-sm flex justify-between items-center"
                                                        >
                                                            <span>Batch {year}</span>
                                                            <span className="text-xs text-zinc-500">{count}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Export Button */}
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Download CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Approve Confirmation Modal */}
                {showBulkConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Confirm Bulk Approval</h3>
                            <p className="text-zinc-400 mb-4">
                                You are about to approve{" "}
                                <span className="text-white font-semibold">
                                    {Math.min(showBulkConfirm.count, availableSeats)}
                                </span>{" "}
                                pending enrollment(s)
                                {showBulkConfirm.type !== "ALL" && (
                                    <>
                                        {" "}for{" "}
                                        <span className="text-white font-semibold">
                                            {showBulkConfirm.type === "DEPARTMENT"
                                                ? `${showBulkConfirm.value} department`
                                                : `Batch ${showBulkConfirm.value}`}
                                        </span>
                                    </>
                                )}
                                .
                            </p>
                            {showBulkConfirm.count > availableSeats && (
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm mb-4">
                                    <AlertCircle className="h-4 w-4 inline mr-2" />
                                    Only {availableSeats} seats available. {showBulkConfirm.count - availableSeats}{" "}
                                    student(s) will remain pending (FIFO order).
                                </div>
                            )}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowBulkConfirm(null)}
                                    className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() =>
                                        handleBulkApprove(
                                            showBulkConfirm.type as "ALL" | "DEPARTMENT" | "YEAR",
                                            showBulkConfirm.value
                                        )
                                    }
                                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-medium"
                                >
                                    Confirm Approval
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                            <Users className="h-4 w-4" />
                            Total Shown
                        </div>
                        <p className="text-2xl font-bold">{filteredStudents.length}</p>
                    </div>
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <div className="flex items-center gap-2 text-amber-400 text-sm mb-1">
                            <Clock className="h-4 w-4" />
                            Pending Approval
                        </div>
                        <p className="text-2xl font-bold text-amber-400">{pendingStudents.length}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                            <CheckCircle className="h-4 w-4" />
                            Enrolled
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">{enrolledStudents.length}</p>
                    </div>
                </div>

                {/* Pending Requests Section */}
                {pendingStudents.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="h-5 w-5 text-amber-400" />
                            <h2 className="text-lg font-semibold text-amber-400">Pending Requests</h2>
                        </div>
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-amber-500/10 text-zinc-300">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Roll Number</th>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Department</th>
                                        <th className="px-4 py-3 font-medium">Year</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Requested</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-amber-500/10">
                                    {pendingStudents.map((student) => (
                                        <tr key={student.enrollmentId} className="hover:bg-amber-500/5">
                                            <td className="px-4 py-3 font-mono">{student.rollNumber}</td>
                                            <td className="px-4 py-3 font-medium">{student.name}</td>
                                            <td className="px-4 py-3 text-zinc-400">{student.departmentCode}</td>
                                            <td className="px-4 py-3 text-zinc-400">{student.year}</td>
                                            <td className="px-4 py-3 text-zinc-400 capitalize">
                                                {student.enrollmentType.toLowerCase()}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400">
                                                {new Date(student.requestedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAction(student.enrollmentId, "APPROVE")}
                                                        disabled={processingId === student.enrollmentId || availableSeats <= 0}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm disabled:opacity-50"
                                                    >
                                                        {processingId === student.enrollmentId ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="h-3 w-3" />
                                                        )}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(student.enrollmentId, "REJECT")}
                                                        disabled={processingId === student.enrollmentId}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50"
                                                    >
                                                        <XCircle className="h-3 w-3" />
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Enrolled Students Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-indigo-400" />
                        <h2 className="text-lg font-semibold">Enrolled Students</h2>
                    </div>
                    {enrolledStudents.length > 0 ? (
                        <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-zinc-400">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Roll Number</th>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Email</th>
                                        <th className="px-4 py-3 font-medium">Department</th>
                                        <th className="px-4 py-3 font-medium">Year</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {enrolledStudents.map((student) => (
                                        <tr key={student.enrollmentId} className="hover:bg-white/5">
                                            <td className="px-4 py-3 font-mono">{student.rollNumber}</td>
                                            <td className="px-4 py-3 font-medium">{student.name}</td>
                                            <td className="px-4 py-3 text-zinc-400">{student.email}</td>
                                            <td className="px-4 py-3 text-zinc-400">{student.departmentCode}</td>
                                            <td className="px-4 py-3 text-zinc-400">{student.year}</td>
                                            <td className="px-4 py-3 text-zinc-400 capitalize">
                                                {student.enrollmentType.toLowerCase()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {student.enrollmentStatus === "ENROLLED" ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400 font-medium">
                                                        Enrolled
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-400 font-medium whitespace-nowrap">
                                                        Pending Advisor Approval
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/30 p-8 text-center text-zinc-500">
                            No enrolled students {hasActiveFilters && "matching your filters"}
                        </div>
                    )}
                </div>

                {/* Other Status Students (Dropped, Withdrawn, etc.) */}
                {otherStudents.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <XCircle className="h-5 w-5 text-zinc-500" />
                            <h2 className="text-lg font-semibold text-zinc-500">Other Status</h2>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden opacity-60">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-zinc-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Roll Number</th>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Department</th>
                                        <th className="px-4 py-3 font-medium">Year</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {otherStudents.map((student) => (
                                        <tr key={student.enrollmentId}>
                                            <td className="px-4 py-3 font-mono">{student.rollNumber}</td>
                                            <td className="px-4 py-3">{student.name}</td>
                                            <td className="px-4 py-3">{student.departmentCode}</td>
                                            <td className="px-4 py-3">{student.year}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-zinc-500/20 px-2 py-1 text-xs text-zinc-400">
                                                    {student.enrollmentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
