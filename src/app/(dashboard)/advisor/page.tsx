
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, BookOpen, GraduationCap, ArrowRight } from "lucide-react";

interface Batch {
    department: string;
    batchYear: number;
}

export default function AdvisorDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBatches() {
            try {
                const res = await fetch("/api/advisor/batches");
                const data = await res.json();
                if (data.batches) {
                    setBatches(data.batches);
                    // Automatic redirect if only one batch
                    if (data.batches.length === 1) {
                        const batch = data.batches[0];
                        router.replace(`/advisor/batch/${encodeURIComponent(batch.department)}/${batch.batchYear}`);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch batches", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBatches();
    }, []);

    if (loading) return <div className="p-10 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Advisor Dashboard</h1>
                    <p className="text-zinc-400">Manage your assigned student batches</p>
                </header>

                <h2 className="text-xl font-semibold mb-4">My Batches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map((batch) => (
                        <div key={`${batch.department}-${batch.batchYear}`} className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-lg">
                                    <GraduationCap className="h-6 w-6 text-indigo-400" />
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-white/5 rounded text-zinc-300">
                                    Class of {batch.batchYear}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold mb-1">{batch.department}</h3>
                            <p className="text-sm text-zinc-400 mb-6">Batch {batch.batchYear}</p>

                            <div className="mt-auto space-y-3">
                                <Link
                                    href={`/advisor/batch/${encodeURIComponent(batch.department)}/${batch.batchYear}`}
                                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm font-medium"
                                >
                                    <span>View Students</span>
                                    <Users className="h-4 w-4 text-zinc-400" />
                                </Link>

                                <Link
                                    href={`/advisor/enrollments/${encodeURIComponent(batch.department)}/${batch.batchYear}`}
                                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium"
                                >
                                    <span>Manage Enrollments</span>
                                    <BookOpen className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {batches.length === 0 && (
                        <div className="col-span-3 text-center py-10 text-zinc-500">
                            No batches assigned.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
