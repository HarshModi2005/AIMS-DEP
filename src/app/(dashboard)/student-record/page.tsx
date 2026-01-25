"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, GraduationCap, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Enrollment {
    id: string;
    courseCode: string;
    courseName: string;
    ltp: string;
    credits: number;
    enrollmentType: string;
    enrollmentStatus: string;
    courseCategory: string;
    grade: string;
    attendancePercent: number;
    isCompleted: boolean;
    completionStatus: string | null;
    session: string;
    instructors: string[];
}

interface SemesterRecord {
    session: string;
    sgpa: number | null;
    creditsRegistered: number;
    creditsEarned: number;
}

interface StudentData {
    user: {
        firstName: string;
        lastName: string;
        email: string;
        rollNumber: string;
    };
    student: {
        department: string;
        yearOfEntry: number;
        degreeType: string;
        degree: string;
        category: string | null;
        minorSpecialization: string | null;
        concentrationSpecialization: string | null;
        currentStatus: string;
        currentSGPA: number | null;
        cgpa: number | null;
        creditsRegistered: number;
        creditsEarned: number;
        cumulativeCreditsEarned: number;
    } | null;
    enrollments: Enrollment[];
    semesterRecords: SemesterRecord[];
}

export default function StudentRecordPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"academics" | "documents">("academics");
    const [showOnlyEnrolled, setShowOnlyEnrolled] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
            router.push("/admin");
        }
    }, [session, router]);

    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStudentRecord() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/students/record");
                if (!response.ok) throw new Error("Failed to fetch student record");
                const data = await response.json();
                setStudentData(data);
            } catch (err) {
                console.error("Error fetching student record:", err);
                setError("Failed to load student record. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchStudentRecord();
        }
    }, [session]);

    // Group enrollments by session
    const enrollmentsBySession = studentData?.enrollments.reduce((acc, enrollment) => {
        const sessionName = enrollment.session;
        if (!acc[sessionName]) {
            acc[sessionName] = [];
        }
        acc[sessionName].push(enrollment);
        return acc;
    }, {} as Record<string, Enrollment[]>) || {};

    const filteredEnrollments = showOnlyEnrolled
        ? Object.entries(enrollmentsBySession).reduce((acc, [session, enrollments]) => {
            const filtered = enrollments.filter(e => e.enrollmentStatus === "ENROLLED" || e.enrollmentStatus === "COMPLETED");
            if (filtered.length > 0) {
                acc[session] = filtered;
            }
            return acc;
        }, {} as Record<string, Enrollment[]>)
        : enrollmentsBySession;

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="p-6 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    const user = studentData?.user;
    const student = studentData?.student;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Student Record</h1>

                {/* Student Info Card */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <span className="text-sm text-zinc-500">Name</span>
                            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        </div>
                        <div>
                            <span className="text-sm text-zinc-500">Roll Number</span>
                            <p className="font-medium text-indigo-400">{user?.rollNumber}</p>
                        </div>
                        <div>
                            <span className="text-sm text-zinc-500">Email</span>
                            <p className="font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <span className="text-sm text-zinc-500">Department</span>
                            <p className="font-medium">{student?.department || "Not assigned"}</p>
                        </div>
                        <div>
                            <span className="text-sm text-zinc-500">Degree</span>
                            <p className="font-medium">{student?.degreeType || "N/A"} - {student?.degree || "N/A"}</p>
                        </div>
                        <div>
                            <span className="text-sm text-zinc-500">Year of Entry</span>
                            <p className="font-medium">{student?.yearOfEntry || "N/A"}</p>
                        </div>
                        <div>
                            <span className="text-sm text-zinc-500">CGPA</span>
                            <p className="font-medium text-emerald-400">{student?.cgpa?.toFixed(2) || "N/A"}</p>
                        </div>
                        <div>
                            <span className="text-sm text-zinc-500">Credits Earned</span>
                            <p className="font-medium">{student?.cumulativeCreditsEarned || 0}</p>
                        </div>
                        <div>
                            <span className="text-sm text-zinc-500">Status</span>
                            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
                                {student?.currentStatus || "REGISTERED"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("academics")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                            activeTab === "academics"
                                ? "bg-indigo-600 text-white"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <GraduationCap className="h-4 w-4" />
                        Academics
                    </button>
                    <button
                        onClick={() => setActiveTab("documents")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                            activeTab === "documents"
                                ? "bg-indigo-600 text-white"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <FileText className="h-4 w-4" />
                        Documents
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "academics" ? (
                    <div>
                        {/* Filter */}
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="showEnrolled"
                                checked={showOnlyEnrolled}
                                onChange={(e) => setShowOnlyEnrolled(e.target.checked)}
                                className="rounded border-white/20 bg-zinc-800"
                            />
                            <label htmlFor="showEnrolled" className="text-sm text-zinc-400">
                                Show only Enrolled courses
                            </label>
                        </div>

                        {/* Semester Records */}
                        {Object.keys(filteredEnrollments).length > 0 ? (
                            Object.entries(filteredEnrollments).map(([sessionName, enrollments]) => {
                                const semRecord = studentData?.semesterRecords.find(sr => sr.session === sessionName);

                                const currentSessionEnrollments = enrollmentsBySession[sessionName] || [];

                                const computedRegistered = currentSessionEnrollments
                                    .filter(e => ["ENROLLED", "COMPLETED", "FAILED"].includes(e.enrollmentStatus))
                                    .reduce((sum, e) => sum + e.credits, 0);

                                const computedEarned = currentSessionEnrollments
                                    .filter(e => e.enrollmentStatus === "COMPLETED")
                                    .reduce((sum, e) => sum + e.credits, 0);

                                return (
                                    <div key={sessionName} className="mb-6">
                                        {/* Semester Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-semibold">{sessionName}</h3>
                                            <div className="flex gap-4 text-sm">
                                                <span className="text-zinc-400">
                                                    SGPA: <span className="text-emerald-400 font-medium">{semRecord?.sgpa?.toFixed(2) || "N/A"}</span>
                                                </span>
                                                <span className="text-zinc-400">
                                                    Credits Registered: <span className="font-medium text-white">{computedRegistered}</span>
                                                </span>
                                                <span className="text-zinc-400">
                                                    Credits Earned: <span className="font-medium text-emerald-400">{computedEarned}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Courses Table */}
                                        <div className="rounded-xl border border-white/10 overflow-hidden">
                                            <table>
                                                <thead>
                                                    <tr className="bg-zinc-900/80">
                                                        <th className="w-12">#</th>
                                                        <th className="text-left">Course</th>
                                                        <th className="text-left">Category</th>
                                                        <th className="text-left">Credits</th>
                                                        <th className="text-left">Grade</th>
                                                        <th className="text-left">Attendance</th>
                                                        <th className="text-left">Status</th>
                                                        <th className="text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {enrollments.map((enrollment, idx) => (
                                                        <tr key={enrollment.id}>
                                                            <td className="text-zinc-500">{idx + 1}</td>
                                                            <td>
                                                                <div>
                                                                    <span className="text-indigo-400">{enrollment.courseCode}</span>
                                                                    <span className="text-zinc-400"> - {enrollment.courseName}</span>
                                                                </div>
                                                                <div className="text-xs text-zinc-500">
                                                                    {enrollment.instructors?.join(", ") || "TBA"}
                                                                </div>
                                                            </td>
                                                            <td className="text-zinc-400">{enrollment.courseCategory}</td>
                                                            <td className="text-zinc-400">{enrollment.credits}</td>
                                                            <td>
                                                                <span className={cn(
                                                                    "font-medium",
                                                                    enrollment.grade === "NA" ? "text-zinc-500" : "text-emerald-400"
                                                                )}>
                                                                    {enrollment.grade || "NA"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn(
                                                                        enrollment.attendancePercent < 75 ? "text-red-400" : "text-zinc-400"
                                                                    )}>
                                                                        {enrollment.attendancePercent?.toFixed(0) || 0}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={cn(
                                                                    "px-2 py-1 rounded-full text-xs",
                                                                    enrollment.enrollmentStatus === "ENROLLED"
                                                                        ? "bg-blue-500/20 text-blue-400"
                                                                        : enrollment.enrollmentStatus === "COMPLETED"
                                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                                            : ["INSTRUCTOR_REJECTED", "ADVISOR_REJECTED"].includes(enrollment.enrollmentStatus)
                                                                                ? "bg-red-500/20 text-red-400"
                                                                                : "bg-zinc-500/20 text-zinc-400"
                                                                )}>
                                                                    {enrollment.enrollmentStatus === "INSTRUCTOR_REJECTED"
                                                                        ? "Instructor Rejected"
                                                                        : enrollment.enrollmentStatus === "ADVISOR_REJECTED"
                                                                            ? "Advisor Rejected"
                                                                            : enrollment.enrollmentStatus === "DROPPED"
                                                                                ? "Dropped by Student"
                                                                                : enrollment.enrollmentStatus.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                                </span>
                                                            </td>
                                                            <td className="text-right">
                                                                {["ENROLLED", "PENDING"].includes(enrollment.enrollmentStatus) && (
                                                                    <div className="relative group inline-block text-left">
                                                                        <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                                                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                                                                        </button>
                                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl hidden group-hover:block z-20 overflow-hidden">
                                                                            <button
                                                                                onClick={async () => {
                                                                                    if (!confirm("Are you sure you want to drop this course?")) return;
                                                                                    try {
                                                                                        const res = await fetch(`/api/enrollments/${enrollment.id}`, {
                                                                                            method: "PATCH",
                                                                                            headers: { "Content-Type": "application/json" },
                                                                                            body: JSON.stringify({ action: "DROP" })
                                                                                        });
                                                                                        if (res.ok) window.location.reload();
                                                                                    } catch (e) {
                                                                                        console.error(e);
                                                                                        alert("Failed to drop course");
                                                                                    }
                                                                                }}
                                                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                                            >
                                                                                Drop Course
                                                                            </button>
                                                                            <button
                                                                                onClick={async () => {
                                                                                    if (!confirm("Are you sure you want to withdraw from this course?")) return;
                                                                                    try {
                                                                                        const res = await fetch(`/api/enrollments/${enrollment.id}`, {
                                                                                            method: "PATCH",
                                                                                            headers: { "Content-Type": "application/json" },
                                                                                            body: JSON.stringify({ action: "WITHDRAW" })
                                                                                        });
                                                                                        if (res.ok) window.location.reload();
                                                                                    } catch (e) {
                                                                                        console.error(e);
                                                                                        alert("Failed to withdraw");
                                                                                    }
                                                                                }}
                                                                                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
                                                                            >
                                                                                Withdraw
                                                                            </button>
                                                                            {enrollment.enrollmentType !== "AUDIT" && (
                                                                                <button
                                                                                    onClick={async () => {
                                                                                        if (!confirm("Change enrollment to Audit?")) return;
                                                                                        try {
                                                                                            const res = await fetch(`/api/enrollments/${enrollment.id}`, {
                                                                                                method: "PATCH",
                                                                                                headers: { "Content-Type": "application/json" },
                                                                                                body: JSON.stringify({ action: "AUDIT" })
                                                                                            });
                                                                                            if (res.ok) window.location.reload();
                                                                                        } catch (e) {
                                                                                            console.error(e);
                                                                                            alert("Failed to change to audit");
                                                                                        }
                                                                                    }}
                                                                                    className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
                                                                                >
                                                                                    Audit Course
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center rounded-xl border border-white/10">
                                <GraduationCap className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                <p className="text-zinc-400">No enrollment records found.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-12 text-center rounded-xl border border-white/10">
                        <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-400">No documents available.</p>
                        <p className="text-sm text-zinc-500 mt-2">
                            Transcripts and certificates will appear here once generated.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
