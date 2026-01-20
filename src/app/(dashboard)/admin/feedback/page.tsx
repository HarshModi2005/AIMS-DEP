"use client";

import { useState, useEffect } from "react";
import { Search, Download, Loader2, ToggleLeft, ToggleRight, BookOpen, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Instructor {
    name: string;
    isPrimary: boolean;
}

interface CourseOffering {
    id: string;
    courseCode: string;
    courseName: string;
    credits: number;
    department: string;
    session: string;
    isCurrent: boolean;
    feedbackOpen: boolean;
    instructors: Instructor[];
    feedbackCount: number;
}

export default function AdminFeedbackPage() {
    const { data: session } = useSession();
    const [offerings, setOfferings] = useState<CourseOffering[]>([]);
    const [filteredOfferings, setFilteredOfferings] = useState<CourseOffering[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Fetch course offerings
    useEffect(() => {
        async function fetchOfferings() {
            try {
                const res = await fetch("/api/admin/feedback/courses");
                if (res.ok) {
                    const data = await res.json();
                    setOfferings(data.offerings);
                    setFilteredOfferings(data.offerings);
                    setDepartments(data.departments);
                }
            } catch (error) {
                console.error("Error fetching offerings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOfferings();
    }, []);

    // Filter offerings based on search and department
    useEffect(() => {
        let filtered = offerings;

        if (searchQuery) {
            filtered = filtered.filter(
                (o) =>
                    o.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.courseName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedDepartment) {
            filtered = filtered.filter((o) => o.department === selectedDepartment);
        }

        setFilteredOfferings(filtered);
    }, [searchQuery, selectedDepartment, offerings]);

    // Toggle feedback status
    const handleToggleFeedback = async (offeringId: string, currentStatus: boolean) => {
        setTogglingId(offeringId);
        try {
            const res = await fetch("/api/admin/feedback/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    offeringId,
                    feedbackOpen: !currentStatus,
                }),
            });

            if (res.ok) {
                // Update local state
                setOfferings((prev) =>
                    prev.map((o) =>
                        o.id === offeringId ? { ...o, feedbackOpen: !currentStatus } : o
                    )
                );
            } else {
                alert("Failed to toggle feedback status");
            }
        } catch (error) {
            console.error("Error toggling feedback:", error);
            alert("An error occurred");
        } finally {
            setTogglingId(null);
        }
    };

    // Download feedback CSV
    const handleDownloadFeedback = async (offeringId: string, courseCode: string) => {
        try {
            const res = await fetch(`/api/admin/feedback/download/${offeringId}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `feedback_${courseCode}.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert("Failed to download feedback");
            }
        } catch (error) {
            console.error("Error downloading feedback:", error);
            alert("An error occurred");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Course Feedback Management</h1>
                    <p className="text-zinc-400 mt-1">
                        Toggle feedback status and download anonymous student responses
                    </p>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by course code or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-zinc-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Department Filter */}
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-zinc-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 text-zinc-400">
                    Showing {filteredOfferings.length} course{filteredOfferings.length !== 1 ? "s" : ""}
                </div>

                {/* Course Offerings Table */}
                <div className="space-y-4">
                    {filteredOfferings.map((offering) => (
                        <div
                            key={offering.id}
                            className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 hover:border-white/20 transition-colors"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* Course Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-indigo-400">
                                            {offering.courseCode}
                                        </h3>
                                        {offering.isCurrent && (
                                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white mb-3">{offering.courseName}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{offering.department}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{offering.session}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {offering.instructors
                                                    .filter((i) => i.isPrimary)
                                                    .map((i) => i.name)
                                                    .join(", ") || "No instructor"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 lg:items-end">
                                    {/* Feedback Count */}
                                    <div className="text-sm text-zinc-400">
                                        {offering.feedbackCount} feedback{offering.feedbackCount !== 1 ? "s" : ""}
                                    </div>

                                    <div className="flex gap-3">
                                        {/* Toggle Button */}
                                        <button
                                            onClick={() => handleToggleFeedback(offering.id, offering.feedbackOpen)}
                                            disabled={togglingId === offering.id}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${offering.feedbackOpen
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                                : "bg-zinc-800 text-zinc-400 border border-white/10 hover:bg-zinc-700"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {togglingId === offering.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : offering.feedbackOpen ? (
                                                <ToggleRight className="h-4 w-4" />
                                            ) : (
                                                <ToggleLeft className="h-4 w-4" />
                                            )}
                                            {offering.feedbackOpen ? "Open" : "Closed"}
                                        </button>

                                        {/* Download Button */}
                                        <Button
                                            onClick={() => handleDownloadFeedback(offering.id, offering.courseCode)}
                                            variant="outline"
                                            size="sm"
                                            disabled={offering.feedbackCount === 0}
                                            className="bg-indigo-600 hover:bg-indigo-700 border-0"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download TXT
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredOfferings.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            No courses found matching your filters
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
