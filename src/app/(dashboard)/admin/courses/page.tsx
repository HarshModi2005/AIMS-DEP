"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Plus,
    BookOpen,
    Users,
    Loader2,
    X,
    Edit,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
    id: string;
    courseCode: string;
    courseName: string;
    lectureHours: number;
    tutorialHours: number;
    practicalHours: number;
    selfStudyHours: number;
    credits: number;
    department: string;
    courseCategory: string;
    level: string;
}

const categoryLabels: Record<string, string> = {
    "SC": "Science Core",
    "PC": "Program Core",
    "PE": "Program Elective",
    "OE": "Open Elective",
    "HC": "Humanities Core",
    "GR": "General Requirement",
    "NN": "Non-Credit",
    "CP": "Capstone Project",
    "DE": "Department Elective",
};

export default function CourseManagementPage() {
    const { data: session } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCourse, setNewCourse] = useState({
        courseCode: "",
        courseName: "",
        lectureHours: 3,
        tutorialHours: 1,
        practicalHours: 0,
        selfStudyHours: 5,
        credits: 3,
        department: "Computer Science and Engineering",
        courseCategory: "PC",
    });

    // Redirect non-admin users
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        redirect("/");
    }

    useEffect(() => {
        async function fetchCourses() {
            setLoading(true);
            try {
                const response = await fetch("/api/admin/courses");
                if (response.ok) {
                    const data = await response.json();
                    setCourses(data.courses || []);
                }
            } catch (err) {
                console.error("Error fetching courses:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCourses();
    }, []);

    // Mock data for demonstration
    const mockCourses: Course[] = [
        { id: "1", courseCode: "CS301", courseName: "Databases", lectureHours: 3, tutorialHours: 1, practicalHours: 2, selfStudyHours: 6, credits: 4, department: "Computer Science and Engineering", courseCategory: "PC", level: "UNDERGRADUATE" },
        { id: "2", courseCode: "CS302", courseName: "Analysis and Design of Algorithms", lectureHours: 3, tutorialHours: 1, practicalHours: 0, selfStudyHours: 5, credits: 3, department: "Computer Science and Engineering", courseCategory: "PC", level: "UNDERGRADUATE" },
        { id: "3", courseCode: "CS303", courseName: "Operating Systems", lectureHours: 3, tutorialHours: 1, practicalHours: 2, selfStudyHours: 6, credits: 4, department: "Computer Science and Engineering", courseCategory: "PC", level: "UNDERGRADUATE" },
        { id: "4", courseCode: "HS301", courseName: "Industrial Management", lectureHours: 3, tutorialHours: 1, practicalHours: 0, selfStudyHours: 5, credits: 3, department: "Humanities and Social Sciences", courseCategory: "HC", level: "UNDERGRADUATE" },
        { id: "5", courseCode: "EE510", courseName: "High Voltage Engineering", lectureHours: 3, tutorialHours: 1, practicalHours: 4, selfStudyHours: 7, credits: 5, department: "Electrical Engineering", courseCategory: "PE", level: "POSTGRADUATE" },
    ];

    const displayCourses = courses.length > 0 ? courses : mockCourses;
    const filteredCourses = displayCourses.filter(course => {
        const matchesSearch = searchQuery === "" ||
            course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.courseName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDepartment === "all" || course.department === selectedDepartment;
        const matchesCat = selectedCategory === "all" || course.courseCategory === selectedCategory;
        return matchesSearch && matchesDept && matchesCat;
    });

    const departments = [...new Set(displayCourses.map(c => c.department))];

    const handleAddCourse = async () => {
        try {
            const response = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCourse),
            });
            if (response.ok) {
                setShowAddModal(false);
                // Refresh courses
            }
        } catch (err) {
            console.error("Error adding course:", err);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 rounded-lg hover:bg-white/5">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Course Management</h1>
                        <p className="text-zinc-400">Create and manage courses</p>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by code or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-zinc-900 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-white/10 bg-zinc-900"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-white/10 bg-zinc-900"
                        >
                            <option value="all">All Categories</option>
                            {Object.entries(categoryLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Add Course
                    </button>
                </div>

                {/* Courses Table */}
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr className="bg-zinc-900/80">
                                    <th className="text-left">Code</th>
                                    <th className="text-left">Course Name</th>
                                    <th className="text-left">L-T-P-S-C</th>
                                    <th className="text-left">Credits</th>
                                    <th className="text-left">Department</th>
                                    <th className="text-left">Category</th>

                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course) => (
                                    <tr key={course.id}>
                                        <td className="font-medium text-indigo-400">{course.courseCode}</td>
                                        <td>{course.courseName}</td>
                                        <td className="text-zinc-400">
                                            {course.lectureHours}-{course.tutorialHours}-{course.practicalHours}-{course.selfStudyHours}-{course.credits}
                                        </td>
                                        <td className="text-zinc-400">{course.credits}</td>
                                        <td className="text-zinc-400 text-sm">
                                            {course.department.split(" ").map(w => w[0]).join("")}
                                        </td>
                                        <td>
                                            <span className="px-2 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-400">
                                                {categoryLabels[course.courseCategory] || course.courseCategory}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="mt-4 text-sm text-zinc-500">
                    Showing {filteredCourses.length} courses
                </div>

                {/* Add Course Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 w-full max-w-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Add New Course</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Course Code</label>
                                        <input
                                            type="text"
                                            value={newCourse.courseCode}
                                            onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                                            placeholder="e.g., CS301"
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Credits</label>
                                        <input
                                            type="number"
                                            value={newCourse.credits}
                                            onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Course Name</label>
                                    <input
                                        type="text"
                                        value={newCourse.courseName}
                                        onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                                        placeholder="e.g., Databases"
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">L</label>
                                        <input
                                            type="number"
                                            value={newCourse.lectureHours}
                                            onChange={(e) => setNewCourse({ ...newCourse, lectureHours: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">T</label>
                                        <input
                                            type="number"
                                            value={newCourse.tutorialHours}
                                            onChange={(e) => setNewCourse({ ...newCourse, tutorialHours: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">P</label>
                                        <input
                                            type="number"
                                            value={newCourse.practicalHours}
                                            onChange={(e) => setNewCourse({ ...newCourse, practicalHours: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">S</label>
                                        <input
                                            type="number"
                                            value={newCourse.selfStudyHours}
                                            onChange={(e) => setNewCourse({ ...newCourse, selfStudyHours: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Category</label>
                                    <select
                                        value={newCourse.courseCategory}
                                        onChange={(e) => setNewCourse({ ...newCourse, courseCategory: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                    >
                                        {Object.entries(categoryLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddCourse}
                                        className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium"
                                    >
                                        Add Course
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
