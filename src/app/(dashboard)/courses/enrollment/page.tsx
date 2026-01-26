"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search, Filter, X, CheckCircle, Clock, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import RazorpayButton from "@/components/payments/RazorpayButton";

interface CourseForEnrollment {
    id: string;
    code: string;
    name: string;
    ltp: string;
    credits: number;
    department: string;
    status: string;
    maxStrength: number;
    currentStrength: number;
    isEnrolled: boolean;
    isPending: boolean;
    enrollmentStatus: string | null;
    instructor: string;
    fee: number;
    enrollmentType: string | null;
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
    { id: "OPEN_FOR_ENROLLMENT", label: "Open for Enrollment" },
    { id: "ENROLLMENT_CLOSED", label: "Enrollment Closed" },
];

export default function EnrollmentPage() {
    const { data: session } = useSession();
    const [courses, setCourses] = useState<CourseForEnrollment[]>([]);
    const [currentSessionName, setCurrentSessionName] = useState<string>("");
    const [searchCode, setSearchCode] = useState("");
    const [searchTitle, setSearchTitle] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalCourse, setModalCourse] = useState<CourseForEnrollment | null>(null);
    const [modalEnrollType, setModalEnrollType] = useState<string>("");

    // Fetch courses
    useEffect(() => {
        async function fetchCourses() {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (searchCode) params.append("code", searchCode);
                if (searchTitle) params.append("title", searchTitle);
                if (selectedDepartment !== "All Departments") params.append("department", selectedDepartment);

                const response = await fetch(`/api/enrollments?${params.toString()}`);
                if (!response.ok) throw new Error("Failed to fetch courses");
                const data = await response.json();

                setCourses(data.courses || []);
                setCurrentSessionName(data.session || "");
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError("Failed to load courses. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchCourses();
        }
    }, [session, searchCode, searchTitle, selectedDepartment]);

    const filteredCourses = courses.filter((course) => {
        const matchesStatus = selectedStatus === "all" || course.status === selectedStatus;
        return matchesStatus;
    });

    const handleEnroll = async (courseId: string, enrollmentType: string = "CREDIT") => {
        setEnrollingCourseId(courseId);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch("/api/enrollments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseOfferingId: courseId, enrollmentType }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to enroll");
            }

            setSuccessMessage("Enrollment request submitted! Awaiting faculty approval.");

            // Update the course in the list - mark as pending, not enrolled
            setCourses((prev) =>
                prev.map((c) =>
                    c.id === courseId
                        ? { ...c, isPending: true, enrollmentType }
                        : c
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to enroll");
        } finally {
            setEnrollingCourseId(null);
        }
    };

    const clearFilters = () => {
        setSearchCode("");
        setSearchTitle("");
        setSelectedDepartment("All Departments");
        setSelectedStatus("all");
    };

    const getStatusBadge = (status: string, isEnrolled: boolean, isPending: boolean, enrollmentStatus: string | null) => {
        if (isEnrolled) {
            return (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    Enrolled
                </span>
            );
        }
        if (isPending) {
            const isAdvisorPending = enrollmentStatus === "PENDING_ADVISOR";
            return (
                <span className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    isAdvisorPending ? "bg-amber-500/20 text-amber-500" : "bg-amber-500/10 text-amber-400"
                )}>
                    <Clock className="h-3 w-3" />
                    {isAdvisorPending ? "Pending Advisor Approval" : "Pending Faculty Approval"}
                </span>
            );
        }
        switch (status) {
            case "OPEN_FOR_ENROLLMENT":
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Open
                    </span>
                );
            case "ENROLLMENT_CLOSED":
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        Closed
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-500/20 text-zinc-400 text-xs">
                        <Clock className="h-3 w-3" />
                        Unknown
                    </span>
                );
        }
    };

    if (loading && !courses.length) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Courses for Enrollment</h1>

                {/* Notice */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-6">
                    <p className="text-amber-400 text-sm">
                        <strong>NOTE:</strong> Enrollment is open for the current session {currentSessionName}.
                        Please ensure you meet the prerequisites before enrolling.
                        Contact your faculty advisor for course recommendations.
                    </p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="mb-6 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Course Code</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="e.g., CS304"
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Course Title</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search by title..."
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Department</label>
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
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                        >
                            <X className="h-4 w-4" />
                            Clear Filters
                        </button>
                        <div className="text-sm text-zinc-500">
                            Showing {filteredCourses.length} of {courses.length} courses
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <table>
                            <thead>
                                <tr className="bg-zinc-900/80">
                                    <th className="w-12">#</th>
                                    <th>Course</th>
                                    <th>Department</th>
                                    <th>Instructor</th>
                                    <th>Seats</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course, idx) => (
                                    <tr key={course.id}>
                                        <td className="text-zinc-500">{idx + 1}</td>
                                        <td>
                                            <Link href={`/courses/offerings/${course.id}`} className="block group">
                                                <div>
                                                    <span className="font-medium text-indigo-400 group-hover:underline">{course.code}</span>
                                                    <span className="text-zinc-400"> - {course.name}</span>
                                                </div>
                                                <div className="text-sm text-zinc-500">
                                                    L-T-P-S-C: {course.ltp} | Credits: {course.credits}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="text-sm text-zinc-400">{course.department}</td>
                                        <td className="text-zinc-400">{course.instructor || "TBA"}</td>
                                        <td>
                                            <div className="text-sm">
                                                <span className={cn(
                                                    course.currentStrength >= course.maxStrength ? "text-red-400" : "text-zinc-400"
                                                )}>
                                                    {course.currentStrength}
                                                </span>
                                                <span className="text-zinc-500"> / {course.maxStrength}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-1">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        course.currentStrength >= course.maxStrength
                                                            ? "bg-red-500"
                                                            : course.currentStrength >= course.maxStrength * 0.8
                                                                ? "bg-amber-500"
                                                                : "bg-emerald-500"
                                                    )}
                                                    style={{ width: `${Math.min((course.currentStrength / course.maxStrength) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="text-zinc-400">
                                            {course.fee > 0 ? `₹${course.fee}` : "Free"}
                                        </td>
                                        <td>{getStatusBadge(course.status, course.isEnrolled, course.isPending, course.enrollmentStatus)}</td>
                                        <td>
                                            {course.fee > 0 && !course.isEnrolled && !course.isPending ? (
                                                <RazorpayButton
                                                    courseOfferingId={course.id}
                                                    amount={course.fee}
                                                    userEmail={session?.user?.email || ""}
                                                    userName={session?.user?.name || ""}
                                                    onSuccess={() => handleEnroll(course.id, "CREDIT")}
                                                    disabled={course.status !== "OPEN_FOR_ENROLLMENT"}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {(!course.isEnrolled && !course.isPending && course.status === "OPEN_FOR_ENROLLMENT") ? (
                                                        <div className="relative group">
                                                            <button
                                                                className={cn(
                                                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2",
                                                                    (enrollingCourseId === course.id) && "opacity-70 cursor-wait"
                                                                )}
                                                                disabled={enrollingCourseId === course.id}
                                                            >
                                                                {enrollingCourseId === course.id ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                        Processing...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Enroll
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    </>
                                                                )}
                                                            </button>

                                                            {/* Dropdown Menu */}
                                                            {enrollingCourseId !== course.id && (
                                                                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-white/10 bg-zinc-900 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                                                                    <button
                                                                        onClick={() => {
                                                                            setModalCourse(course);
                                                                            setModalEnrollType("CREDIT");
                                                                            setShowConfirmModal(true);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors border-b border-white/5"
                                                                    >
                                                                        Credit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setModalCourse(course);
                                                                            setModalEnrollType("CREDIT_FOR_MINOR");
                                                                            setShowConfirmModal(true);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors border-b border-white/5"
                                                                    >
                                                                        Credit for Minor
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setModalCourse(course);
                                                                            setModalEnrollType("CREDIT_FOR_SPECIALIZATION");
                                                                            setShowConfirmModal(true);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors border-b border-white/5"
                                                                    >
                                                                        Credit for Specialization
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setModalCourse(course);
                                                                            setModalEnrollType("AUDIT");
                                                                            setShowConfirmModal(true);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                                                                    >
                                                                        Audit
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className={cn(
                                                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                                                                course.isEnrolled
                                                                    ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" // Grey for enrolled/pending
                                                                    : course.isPending
                                                                        ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" // Grey for enrolled/pending
                                                                        : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                                                            )}
                                                        >
                                                            {course.isEnrolled || course.isPending ? (
                                                                course.enrollmentType ? (
                                                                    course.enrollmentType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
                                                                ) : (
                                                                    "Enrolled"
                                                                )
                                                            ) : (
                                                                "Closed"
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center">
                            <Filter className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-400">No courses found matching your criteria.</p>
                            <button
                                onClick={clearFilters}
                                className="mt-4 px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
                {/* Confirmation Modal */}
                {showConfirmModal && modalCourse && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-zinc-900 rounded-2xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                    Confirm Enrollment
                                </h3>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                <div className="mb-6">
                                    <p className="text-zinc-400 text-sm mb-1">You are about to enroll in:</p>
                                    <p className="text-white font-medium text-lg leading-snug">
                                        <span className="text-indigo-400">{modalCourse.code}</span> - {modalCourse.name}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-zinc-800/50 mb-6">
                                    <div>
                                        <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Enrollment Type</p>
                                        <p className="text-indigo-300 font-medium">
                                            {modalEnrollType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Credits</p>
                                        <p className="text-white font-medium">{modalCourse.credits}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-zinc-400 mb-6 italic">
                                    * Your enrollment request will be sent to the instructor and advisor for approval.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleEnroll(modalCourse.id, modalEnrollType);
                                            setShowConfirmModal(false);
                                        }}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                                    >
                                        Confirm Enrollment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
