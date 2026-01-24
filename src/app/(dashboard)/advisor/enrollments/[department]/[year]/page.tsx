
"use client";

import { useState, useEffect, use, useMemo } from "react";
import { ArrowLeft, Search, Loader2, BookOpen, User, GraduationCap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CourseSummary {
    courseCode: string;
    courseName: string;
    instructorName: string;
    lpstc: string;
    pendingCount: number;
}

export default function BatchCoursesPage({ params }: { params: Promise<{ department: string; year: string }> }) {
    const unwrappedParams = use(params);
    const department = decodeURIComponent(unwrappedParams.department);
    const year = unwrappedParams.year;
    const router = useRouter();

    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch(
                    `/api/advisor/enrollments?department=${encodeURIComponent(department)}&year=${year}&mode=courses`
                );
                const data = await res.json();
                if (data.courses) {
                    setCourses(data.courses);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [department, year]);

    const filteredCourses = useMemo(() => {
        if (!searchQuery) return courses;
        const query = searchQuery.toLowerCase();
        return courses.filter(
            c =>
                c.courseCode.toLowerCase().includes(query) ||
                c.courseName.toLowerCase().includes(query)
        );
    }, [courses, searchQuery]);

    const totalPending = courses.reduce((sum, c) => sum + c.pendingCount, 0);

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/advisor"
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Manage Enrollments - <span className="text-indigo-400">Batch {year}</span>
                        </h1>
                        <p className="text-zinc-400 text-sm">{department}</p>
                    </div>
                </div>

                {/* Search and Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <div className="lg:col-span-3 h-full">
                        <div className="relative h-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search courses by code or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-full pl-12 pr-4 py-3 rounded-xl bg-zinc-900/50 border border-white/10 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col justify-center">
                        <div className="text-amber-400 text-sm font-medium mb-1 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Total Pending Requests
                        </div>
                        <p className="text-3xl font-bold text-amber-500">{totalPending}</p>
                    </div>
                </div>

                {/* Course Grid */}
                {loading ? (
                    <div className="flex flex-center justify-center p-20">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <Link
                                key={course.courseCode}
                                href={`/advisor/enrollments/${encodeURIComponent(department)}/${year}/${course.courseCode}`}
                                className="group block rounded-2xl border border-white/10 bg-zinc-900/50 p-6 hover:border-indigo-500/50 hover:bg-zinc-900 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="h-5 w-5 text-indigo-400" />
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-mono text-indigo-400">{course.courseCode}</p>
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-300 transition-colors">
                                            {course.courseName}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <User className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{course.instructorName}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 text-xs text-zinc-300 border border-white/5">
                                        <span className="font-medium text-zinc-500">L-T-P-S-C:</span>
                                        {course.lpstc}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                        <span className="text-sm font-medium text-amber-500">
                                            {course.pendingCount} pending requests
                                        </span>
                                    </div>
                                    <span className="text-xs text-zinc-500 group-hover:text-indigo-400 transition-colors font-medium">
                                        View students
                                    </span>
                                </div>
                            </Link>
                        ))}

                        {filteredCourses.length === 0 && (
                            <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/20">
                                <BookOpen className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-zinc-400">No courses found</h3>
                                <p className="text-zinc-500">
                                    There are no pending enrollment requests for this batch at the moment.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
