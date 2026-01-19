"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Search, Loader2, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";

interface Course {
    id: string;
    courseCode: string;
    courseName: string;
    credits: number;
    department: string;
    courseCategory: string;
}

const departments = [
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

const categories = [
    { value: "PC", label: "Program Core" },
    { value: "PE", label: "Program Elective" },
    { value: "OE", label: "Open Elective" },
    { value: "HC", label: "Humanities Core" },
    { value: "SC", label: "Subject Core" },
    { value: "DE", label: "Department Elective" },
];

export default function FloatCoursePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [maxStrength, setMaxStrength] = useState(60);

    // Toggle between selecting existing or creating new
    const [mode, setMode] = useState<"select" | "create">("select");

    // New course form fields
    const [newCourse, setNewCourse] = useState({
        courseCode: "",
        courseName: "",
        credits: 4,
        lectureHours: 3,
        tutorialHours: 1,
        practicalHours: 0,
        selfStudyHours: 5,
        department: "Computer Science and Engineering",
        courseCategory: "PC",
    });

    // Fetch available courses
    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch("/api/admin/courses");
                if (!res.ok) throw new Error("Failed to fetch courses");
                const data = await res.json();
                setCourses(data.courses || []);
            } catch {
                // Don't show error, just means no existing courses
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated" && session?.user?.role === "FACULTY") {
            fetchCourses();
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

    const filteredCourses = courses.filter(
        (c) =>
            c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
            c.courseName.toLowerCase().includes(search.toLowerCase())
    );

    const updateLtps = (field: string, value: number) => {
        const updates: any = { [field]: value };
        let L = field === "lectureHours" ? value : newCourse.lectureHours;
        let T = field === "tutorialHours" ? value : newCourse.tutorialHours;
        let P = field === "practicalHours" ? value : newCourse.practicalHours;

        if (field === "lectureHours") {
            // T default = L/3
            T = Math.floor(L / 3);
            updates.tutorialHours = T;
        }

        // S = 2L + P/2 - T
        const S = (2 * L) + (P / 2) - T;
        updates.selfStudyHours = Math.max(0, S);

        // C = L + P/2
        const C = L + (P / 2);
        updates.credits = C;

        setNewCourse((prev) => ({ ...prev, ...updates }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            let courseId = selectedCourse?.id;
            let department = selectedCourse?.department;

            // If creating new course, create it first
            if (mode === "create") {
                if (!newCourse.courseCode || !newCourse.courseName) {
                    throw new Error("Course code and name are required");
                }

                const createRes = await fetch("/api/admin/courses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newCourse),
                });

                const createData = await createRes.json();

                if (!createRes.ok) {
                    throw new Error(createData.error || "Failed to create course");
                }

                courseId = createData.course.id;
                department = newCourse.department;
            }

            if (!courseId) {
                throw new Error("Please select or create a course");
            }

            // Now float the course
            const res = await fetch("/api/faculty/offerings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: courseId,
                    maxStrength: maxStrength,
                    offeringDepartment: department,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to float course");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/faculty");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to float course");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Course Floated Successfully!</h2>
                    <p className="text-zinc-400">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/faculty"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-2">Float a Course</h1>
                <p className="text-zinc-400 mb-8">
                    Select an existing course or create a new one to offer this semester
                </p>

                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                        {error}
                    </div>
                )}

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => { setMode("select"); setSelectedCourse(null); }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === "select"
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                    >
                        Select Existing
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode("create"); setSelectedCourse(null); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${mode === "create"
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                    >
                        <Plus className="h-4 w-4" />
                        Create New
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {mode === "select" ? (
                        /* Course Selection */
                        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                            <label className="block text-sm font-medium mb-4">
                                Select Course from Catalog
                            </label>

                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search by code or name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Course List */}
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {filteredCourses.length === 0 ? (
                                    <p className="text-zinc-500 text-center py-4">
                                        No courses found. Try creating a new one!
                                    </p>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <button
                                            key={course.id}
                                            type="button"
                                            onClick={() => setSelectedCourse(course)}
                                            className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedCourse?.id === course.id
                                                ? "border-indigo-500 bg-indigo-500/10"
                                                : "border-white/10 hover:border-white/20 hover:bg-white/5"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium text-indigo-400">
                                                        {course.courseCode}
                                                    </span>
                                                    <span className="text-zinc-400 ml-2">
                                                        {course.courseName}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-zinc-500">
                                                    {course.credits} credits
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Create New Course Form */
                        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 space-y-4">
                            <h3 className="font-medium mb-4">Create New Course</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">
                                        Course Code *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., CS401"
                                        value={newCourse.courseCode}
                                        onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">
                                        Credits
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={12}
                                        step="0.5"
                                        value={newCourse.credits}
                                        onChange={(e) => setNewCourse({ ...newCourse, credits: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">
                                    Course Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Advanced Machine Learning"
                                    value={newCourse.courseName}
                                    onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">
                                        Department
                                    </label>
                                    <select
                                        value={newCourse.department}
                                        onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {departments.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={newCourse.courseCategory}
                                        onChange={(e) => setNewCourse({ ...newCourse, courseCategory: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">L</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={newCourse.lectureHours}
                                        onChange={(e) => updateLtps("lectureHours", parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-zinc-800 text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">T</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={newCourse.tutorialHours}
                                        onChange={(e) => updateLtps("tutorialHours", parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-zinc-800 text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">P</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={newCourse.practicalHours}
                                        onChange={(e) => updateLtps("practicalHours", parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-zinc-800 text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">S</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={newCourse.selfStudyHours}
                                        readOnly
                                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-zinc-800 text-center opacity-75 cursor-not-allowed"
                                        title="Automatically calculated: S = 2L + P/2 - T"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">L-T-P-S: Lecture, Tutorial, Practical, Self-study hours</p>
                        </div>
                    )}

                    {/* Max Strength */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <label className="block text-sm font-medium mb-2">
                            Maximum Enrollment Capacity
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={500}
                            value={maxStrength}
                            onChange={(e) => setMaxStrength(parseInt(e.target.value) || 60)}
                            className="w-32 px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-sm text-zinc-500 mt-2">
                            Set the maximum number of students who can enroll
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={(mode === "select" && !selectedCourse) || submitting}
                        className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : mode === "create" ? (
                            "Create & Float Course"
                        ) : (
                            "Float Course"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
