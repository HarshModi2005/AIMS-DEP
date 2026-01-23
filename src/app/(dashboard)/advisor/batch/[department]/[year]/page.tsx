
"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Search, Mail, User } from "lucide-react";
import Link from "next/link";

interface Student {
    id: string;
    department: string;
    yearOfEntry: number;
    user: {
        firstName: string;
        lastName: string;
        rollNumber: string;
        email: string;
    }
}

export default function BatchStudentsPage({ params }: { params: Promise<{ department: string; year: string }> }) {
    const unwrappedParams = use(params);
    const department = decodeURIComponent(unwrappedParams.department);
    const year = unwrappedParams.year;

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchStudents() {
            try {
                const res = await fetch(`/api/advisor/students?department=${encodeURIComponent(department)}&year=${year}&q=${search}`);
                const data = await res.json();
                if (data.students) {
                    setStudents(data.students);
                }
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        }
        // Debounce ideally, but for now simple
        const timeout = setTimeout(fetchStudents, 300);
        return () => clearTimeout(timeout);
    }, [department, year, search]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/advisor" className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">{department}</h1>
                        <p className="text-zinc-400">Batch of {year} • {students.length} Students</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                {loading ? <div className="text-zinc-500">Loading...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {students.map(student => (
                            <div key={student.id} className="p-4 rounded-xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <User className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{student.user.firstName} {student.user.lastName}</h3>
                                        <p className="text-xs font-mono text-indigo-400 mb-1">{student.user.rollNumber}</p>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                                            <Mail className="h-3 w-3" />
                                            {student.user.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {students.length === 0 && (
                            <div className="col-span-full py-10 text-center text-zinc-500">No students found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
