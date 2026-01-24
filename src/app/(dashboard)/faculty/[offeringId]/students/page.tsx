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
    Plus,
    Trash2,
    Save,
    RotateCcw,
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

interface Instructor {
    id: string;
    name: string;
    email: string;
    isCoordinator: boolean;
}

interface EnrollmentCriterion {
    id: string;
    degree: string;
    department: string;
    category: string;
    entryYears: string;
}

interface CourseDetails {
    offeringDepartment: string;
    status: string;
    academicSession: string;
    section: string;
    slot: string;
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

    // Tab state
    const [activeTab, setActiveTab] = useState("enrollments");

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Main Tab State
    const [courseDetails, setCourseDetails] = useState<CourseDetails>({
        offeringDepartment: "Computer Science and Engineering",
        status: "Proposed",
        academicSession: "2025-II",
        section: "",
        slot: "",
    });

    const [instructors, setInstructors] = useState<Instructor[]>([
        { id: "1", name: "Puneet (Faculty)", email: "puneet@example.com", isCoordinator: true }
    ]);
    const [instructorSearch, setInstructorSearch] = useState("");

    const [criteria, setCriteria] = useState<EnrollmentCriterion[]>([]);
    const [newCriterion, setNewCriterion] = useState<Omit<EnrollmentCriterion, "id">>({
        degree: "",
        department: "",
        category: "",
        entryYears: "",
    });

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

    // Filtered students for the unified view
    const displayedStudents = useMemo(() => {
        // Sort: Pending first, then Enrolled, then others
        return [...filteredStudents].sort((a, b) => {
            const statusOrder = { PENDING: 0, ENROLLED: 1, REJECTED: 2, DROPPED: 2 };
            const scoreA = statusOrder[a.enrollmentStatus as keyof typeof statusOrder] ?? 99;
            const scoreB = statusOrder[b.enrollmentStatus as keyof typeof statusOrder] ?? 99;
            return scoreA - scoreB;
        });
    }, [filteredStudents]);

    // Handle Selection
    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === displayedStudents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayedStudents.map(s => s.enrollmentId)));
        }
    };

    const handleBulkAction = async (action: "APPROVE" | "REJECT") => {
        if (selectedIds.size === 0) return;

        setBulkApproving(true);
        try {
            const promises = Array.from(selectedIds).map(id => {
                const student = students.find(s => s.enrollmentId === id);
                if (!student) return Promise.resolve();

                // Skip illogical actions
                if (action === "APPROVE" && student.enrollmentStatus !== "PENDING") return Promise.resolve();

                return fetch("/api/faculty/enrollments", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ enrollmentId: id, action }),
                }).then(async (res) => {
                    if (res.ok) {
                        setStudents((prev) =>
                            prev.map((s) => s.enrollmentId === id
                                ? { ...s, enrollmentStatus: action === "APPROVE" ? "ENROLLED" : "DROPPED" }
                                : s
                            )
                        );
                    }
                });
            });

            await Promise.all(promises);
            setSelectedIds(new Set());

            const refreshRes = await fetch(`/api/faculty/offerings/${offeringId}/students`);
            const refreshData = await refreshRes.json();
            setOffering(refreshData.offering);
            setStudents(refreshData.students);

        } catch (err) {
            setError("Failed to perform bulk action");
        } finally {
            setBulkApproving(false);
        }
    };

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



    // Separate pending and enrolled
    const pendingStudents = filteredStudents.filter((s) => s.enrollmentStatus === "PENDING");
    const enrolledStudents = filteredStudents.filter((s) => s.enrollmentStatus === "ENROLLED");
    const otherStudents = filteredStudents.filter(
        (s) => s.enrollmentStatus !== "PENDING" && s.enrollmentStatus !== "ENROLLED"
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
                        ? { ...s, enrollmentStatus: action === "APPROVE" ? "ENROLLED" : "DROPPED" }
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

    // Helper to format status display
    const formatStatus = (status: string) => {
        if (status === "DROPPED") return "Instructor Rejected";
        return status.toLowerCase().replace(/_/g, " ");
    };

    // Helper for status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "ENROLLED": return "bg-emerald-500/20 text-emerald-400";
            case "PENDING": return "bg-amber-500/20 text-amber-400";
            case "PENDING_ADVISOR": return "bg-blue-500/20 text-blue-400";
            case "DROPPED":
            case "ADVISOR_REJECTED":
                return "bg-red-500/20 text-red-400";
            default: return "bg-zinc-500/20 text-zinc-400";
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Breadcrumb style */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/faculty"
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="text-zinc-500 text-sm mb-1">
                                <Link href="/faculty" className="hover:text-indigo-400">Home</Link> /{" "}
                                <span className="text-zinc-300">Course Offering Details</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-white/10 mb-6">
                    {["Main", "Enrollments", "Stats", "Notes"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab.toLowerCase()
                                ? "text-indigo-400"
                                : "text-zinc-400 hover:text-zinc-300"
                                }`}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase() && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "main" ? (
                    <div className="space-y-8">
                        {/* Course Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/50 p-6 rounded-xl border border-white/10">
                            <div className="space-y-2">
                                <label className="text-zinc-400 text-sm">Course</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={`${offering.courseCode} :: ${offering.courseName}`}
                                        disabled
                                        className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-zinc-300"
                                    />
                                    <button className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg text-sm border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors">
                                        Lookup
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-zinc-400 text-sm">Offering Department</label>
                                <select
                                    value={courseDetails.offeringDepartment}
                                    onChange={(e) => setCourseDetails({ ...courseDetails, offeringDepartment: e.target.value })}
                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none appearance-none"
                                >
                                    <option>Computer Science and Engineering</option>
                                    <option>Electrical Engineering</option>
                                    <option>Mechanical Engineering</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-zinc-400 text-sm">Course Status</label>
                                <select
                                    value={courseDetails.status}
                                    onChange={(e) => setCourseDetails({ ...courseDetails, status: e.target.value })}
                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none appearance-none"
                                >
                                    <option>Proposed</option>
                                    <option>Enrolling</option>
                                    <option>Completed</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-zinc-400 text-sm">Section</label>
                                <select
                                    value={courseDetails.section}
                                    onChange={(e) => setCourseDetails({ ...courseDetails, section: e.target.value })}
                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none appearance-none"
                                >
                                    <option value="">Select Section</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-zinc-400 text-sm">Academic Session</label>
                                <select
                                    value={courseDetails.academicSession}
                                    onChange={(e) => setCourseDetails({ ...courseDetails, academicSession: e.target.value })}
                                    className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none appearance-none"
                                >
                                    <option>2025-II : current session</option>
                                    <option>2025-S : upcoming session</option>
                                    <option>2026-I : next session</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-zinc-400 text-sm">Slot</label>
                                <select
                                    value={courseDetails.slot}
                                    onChange={(e) => setCourseDetails({ ...courseDetails, slot: e.target.value })}
                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none appearance-none"
                                >
                                    <option value="">Select Slot</option>
                                    <option value="PCDE">PCDE</option>
                                    <option value="PCE1">PCE1</option>
                                    <option value="PCE2">PCE2</option>
                                    <option value="HSME">HSME</option>
                                </select>
                            </div>
                        </div>

                        {/* Instructors Section */}
                        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Lookup instructor by name"
                                        value={instructorSearch}
                                        onChange={(e) => setInstructorSearch(e.target.value)}
                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-zinc-300">
                                    <tr>
                                        <th className="px-4 py-2 font-semibold">S#</th>
                                        <th className="px-4 py-2 font-semibold">Instructor</th>
                                        <th className="px-4 py-2 font-semibold text-center">Is Coord.</th>
                                        <th className="px-4 py-2 font-semibold text-right">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {instructors.map((inst, idx) => (
                                        <tr key={inst.id} className="hover:bg-white/5">
                                            <td className="px-4 py-3 text-zinc-400 font-medium">{idx + 1}</td>
                                            <td className="px-4 py-3 text-zinc-300 font-medium">{inst.name}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className={`inline-block px-3 py-1 rounded text-xs font-semibold ${inst.isCoordinator ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-500/20 text-zinc-400"}`}>
                                                    {inst.isCoordinator ? "YES" : "NO"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Enrollment Criteria Section */}
                        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                <div className="space-y-1">
                                    <label className="text-zinc-500 text-xs uppercase font-bold">Degree</label>
                                    <input
                                        type="text"
                                        value={newCriterion.degree}
                                        onChange={e => setNewCriterion({ ...newCriterion, degree: e.target.value })}
                                        placeholder="B.Tech"
                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-500 text-xs uppercase font-bold">Department</label>
                                    <input
                                        type="text"
                                        value={newCriterion.department}
                                        onChange={e => setNewCriterion({ ...newCriterion, department: e.target.value })}
                                        placeholder="CSE"
                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-500 text-xs uppercase font-bold">Category</label>
                                    <input
                                        type="text"
                                        value={newCriterion.category}
                                        onChange={e => setNewCriterion({ ...newCriterion, category: e.target.value })}
                                        placeholder="General"
                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-500 text-xs uppercase font-bold">For Entry Years</label>
                                    <input
                                        type="text"
                                        value={newCriterion.entryYears}
                                        onChange={e => setNewCriterion({ ...newCriterion, entryYears: e.target.value })}
                                        placeholder="2022, 2023"
                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (newCriterion.degree) {
                                            setCriteria([...criteria, { id: Math.random().toString(), ...newCriterion }]);
                                            setNewCriterion({ degree: "", department: "", category: "", entryYears: "" });
                                        }
                                    }}
                                    className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 h-[38px]"
                                >
                                    <Plus className="h-4 w-4" /> Add
                                </button>
                            </div>

                            <div className="border border-white/5 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-5 p-3 bg-zinc-950 text-zinc-400 text-sm font-semibold border-b border-white/5">
                                    <div>Degree</div>
                                    <div>Department</div>
                                    <div>Category</div>
                                    <div>For Entry Years</div>
                                    <div className="text-right">Delete</div>
                                </div>
                                {criteria.length === 0 ? (
                                    <div className="p-4 text-center text-zinc-500 text-sm italic">
                                        Nothing added yet!
                                    </div>
                                ) : (
                                    criteria.map((c) => (
                                        <div key={c.id} className="grid grid-cols-5 p-3 hover:bg-white/5 text-sm items-center border-b border-white/5 last:border-0">
                                            <div>{c.degree}</div>
                                            <div>{c.department || "Any"}</div>
                                            <div>{c.category || "Any"}</div>
                                            <div>{c.entryYears || "All"}</div>
                                            <div className="text-right">
                                                <button
                                                    onClick={() => setCriteria(criteria.filter(x => x.id !== c.id))}
                                                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-medium transition-colors">
                                <Save className="h-4 w-4" />
                                Save
                            </button>
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition-colors">
                                <RotateCcw className="h-4 w-4" />
                                Clear
                            </button>
                        </div>
                    </div>
                ) : activeTab === "enrollments" ? (
                    <>
                        {/* Search and Filter Bar */}
                        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 mb-6">
                            <div className="flex flex-wrap items-center gap-4">
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

                                {/* Filters */}
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

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Combined List Table */}
                        <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-visible">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-zinc-300">
                                    <tr>
                                        <th className="px-4 py-3 font-medium w-12">S#</th>
                                        <th className="px-4 py-3 font-medium">Roll No.</th>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Course Title/Code</th>
                                        <th className="px-4 py-3 font-medium">Proposed Enrol. Req.</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Acad Session</th>
                                        <th className="px-4 py-3 font-medium">Attnd.</th>
                                        <th className="px-4 py-3 font-medium w-10">
                                            <input
                                                type="checkbox"
                                                checked={displayedStudents.length > 0 && selectedIds.size === displayedStudents.length}
                                                onChange={toggleSelectAll}
                                                className="rounded border-zinc-600 bg-zinc-800 cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            <div className="relative group inline-block">
                                                <button className="flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs transition-colors">
                                                    Action
                                                    <ChevronDown className="h-3 w-3" />
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-56 bg-zinc-800 border border-white/10 rounded-lg shadow-xl hidden group-hover:block z-20">
                                                    <div className="p-1">
                                                        <button
                                                            onClick={handleExport}
                                                            className="w-full text-left px-3 py-2 hover:bg-white/5 rounded text-sm flex items-center gap-2"
                                                        >
                                                            <Download className="h-4 w-4 text-zinc-400" />
                                                            Download Students List
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-3 py-2 hover:bg-white/5 rounded text-sm text-zinc-500 cursor-not-allowed flex items-center gap-2"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Download Grades
                                                        </button>

                                                        {selectedIds.size > 0 && (
                                                            <>
                                                                <div className="h-px bg-white/10 my-1" />
                                                                <button
                                                                    onClick={() => handleBulkAction("APPROVE")}
                                                                    className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 text-emerald-400 rounded text-sm flex items-center gap-2"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Accept Selected ({selectedIds.size})
                                                                </button>
                                                                <button
                                                                    onClick={() => handleBulkAction("REJECT")}
                                                                    className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 rounded text-sm flex items-center gap-2"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                    Reject Selected ({selectedIds.size})
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {displayedStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="px-4 py-8 text-center text-zinc-500">
                                                No students found {hasActiveFilters ? "matching filters" : ""}
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedStudents.map((student, idx) => (
                                            <tr key={student.enrollmentId} className={`hover:bg-white/5 ${selectedIds.has(student.enrollmentId) ? "bg-white/5" : ""}`}>
                                                <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                                                <td className="px-4 py-3 font-mono text-indigo-400 hover:underline cursor-pointer">{student.rollNumber}</td>
                                                <td className="px-4 py-3 font-medium uppercase">{student.name}</td>
                                                <td className="px-4 py-3 text-zinc-400">
                                                    <div className="text-xs">{offering.courseCode} {offering.courseName}</div>
                                                </td>
                                                <td className="px-4 py-3 text-zinc-400 capitalize">{student.enrollmentType}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs capitalize
                                                        ${getStatusColor(student.enrollmentStatus)}`}>
                                                        {formatStatus(student.enrollmentStatus)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-zinc-500">--</td>
                                                <td className="px-4 py-3 text-zinc-500">--</td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(student.enrollmentId)}
                                                        onChange={() => toggleSelection(student.enrollmentId)}
                                                        className="rounded border-zinc-600 bg-zinc-800 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-3"></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-zinc-500">
                        <p>Detailed View for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} is under construction.</p>
                    </div>
                )
                }


                {/* Error Message */}
                {
                    error && (
                        <div className="fixed bottom-6 right-6 p-4 rounded-lg border border-red-500/30 bg-zinc-900 shadow-xl text-red-400 flex items-center gap-2 z-50">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                            <button onClick={() => setError(null)} className="ml-auto">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )
                }

                {/* Bulk Approve Confirmation Modal logic preserved but hidden in UI structure above if needed, 
                     re-injecting it here to ensure it works if triggered from Pending section */}
                {
                    showBulkConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-6">
                                <h3 className="text-lg font-semibold mb-4">Confirm Bulk Approval</h3>
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
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }



            </div>
        </div >
    );
}
