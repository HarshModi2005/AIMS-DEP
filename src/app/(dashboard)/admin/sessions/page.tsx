"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    Calendar,
    CheckCircle,
    Clock,
    Loader2,
    X,
    Edit,
    Play,
    Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import CalendarUpload from "@/components/admin/CalendarUpload";

interface AcademicSession {
    id: string;
    name: string;
    fullName: string;
    type: string;
    academicYear: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    isUpcoming: boolean;
    isArchived: boolean;
}

const sessionTypeColors: Record<string, string> = {
    "ODD": "bg-blue-500/20 text-blue-400",
    "EVEN": "bg-emerald-500/20 text-emerald-400",
    "SUMMER": "bg-amber-500/20 text-amber-400",
};

export default function SessionManagementPage() {
    const { data: session } = useSession();
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [newSession, setNewSession] = useState({
        name: "",
        fullName: "",
        type: "EVEN",
        academicYear: "2025-26",
        startDate: "",
        endDate: "",
        isCurrent: false,
        isUpcoming: false,
    });

    // Redirect non-admin users
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        redirect("/");
    }

    useEffect(() => {
        async function fetchSessions() {
            setLoading(true);
            try {
                const response = await fetch("/api/sessions?includeArchived=true");
                if (response.ok) {
                    const data = await response.json();
                    setSessions(data.sessions || []);
                }
            } catch (err) {
                console.error("Error fetching sessions:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchSessions();
    }, []);

    // Mock data for demonstration
    const mockSessions: AcademicSession[] = [
        { id: "1", name: "2025-II", fullName: "2025-II : current session", type: "EVEN", academicYear: "2025-26", startDate: "2025-12-04", endDate: "2026-05-30", isCurrent: true, isUpcoming: false, isArchived: false },
        { id: "2", name: "2025-S", fullName: "2025-S : summer session", type: "SUMMER", academicYear: "2025-26", startDate: "2026-05-15", endDate: "2026-07-15", isCurrent: false, isUpcoming: true, isArchived: false },
        { id: "3", name: "2025-I", fullName: "2025-I : previous session", type: "ODD", academicYear: "2025-26", startDate: "2025-07-20", endDate: "2025-12-01", isCurrent: false, isUpcoming: false, isArchived: false },
        { id: "4", name: "2024-II", fullName: "2024-II : archived", type: "EVEN", academicYear: "2024-25", startDate: "2024-12-04", endDate: "2025-05-30", isCurrent: false, isUpcoming: false, isArchived: true },
    ];

    const displaySessions = sessions.length > 0 ? sessions : mockSessions;

    const handleAddSession = async () => {
        try {
            const response = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSession),
            });
            if (response.ok) {
                const data = await response.json();
                setSessions([...sessions, data.session]);
                setShowAddModal(false);
            }
        } catch (err) {
            console.error("Error adding session:", err);
        }
    };

    const handleSetCurrent = async (sessionId: string) => {
        // TODO: Implement API call to set session as current
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 rounded-lg hover:bg-white/5">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Session Management</h1>
                        <p className="text-zinc-400">Manage academic sessions and calendar</p>
                    </div>
                </div>

                {/* Add Session Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Add Session
                    </button>
                </div>

                {/* Sessions List */}
                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displaySessions.map((sess) => (
                            <div
                                key={sess.id}
                                className={cn(
                                    "rounded-xl border p-6 transition-colors",
                                    sess.isCurrent
                                        ? "border-emerald-500/50 bg-emerald-500/5"
                                        : sess.isUpcoming
                                            ? "border-amber-500/50 bg-amber-500/5"
                                            : sess.isArchived
                                                ? "border-white/5 bg-zinc-900/30 opacity-60"
                                                : "border-white/10 bg-zinc-900/50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-lg",
                                            sess.isCurrent ? "bg-emerald-500/20" : "bg-zinc-800"
                                        )}>
                                            <Calendar className={cn(
                                                "h-6 w-6",
                                                sess.isCurrent ? "text-emerald-400" : "text-zinc-400"
                                            )} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold">{sess.name}</h3>
                                                <span className={cn("px-2 py-0.5 rounded-full text-xs", sessionTypeColors[sess.type])}>
                                                    {sess.type}
                                                </span>
                                                {sess.isCurrent && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Current
                                                    </span>
                                                )}
                                                {sess.isUpcoming && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">
                                                        <Clock className="h-3 w-3" />
                                                        Upcoming
                                                    </span>
                                                )}
                                                {sess.isArchived && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-500/20 text-zinc-400">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-400">{sess.fullName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right text-sm">
                                            <p className="text-zinc-400">
                                                {new Date(sess.startDate).toLocaleDateString()} - {new Date(sess.endDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-zinc-500">Academic Year: {sess.academicYear}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!sess.isCurrent && !sess.isArchived && (
                                                <button
                                                    onClick={() => handleSetCurrent(sess.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-sm"
                                                >
                                                    <Play className="h-3 w-3" />
                                                    Set Current
                                                </button>
                                            )}
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedSessionId(sess.id)}
                                                className="px-3 py-1.5 rounded-lg border border-white/10 text-sm hover:bg-white/5"
                                            >
                                                Upload Calendar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Session Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 w-full max-w-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Add New Session</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Session Name</label>
                                        <input
                                            type="text"
                                            value={newSession.name}
                                            onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                                            placeholder="e.g., 2026-I"
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Type</label>
                                        <select
                                            value={newSession.type}
                                            onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        >
                                            <option value="ODD">Odd Semester</option>
                                            <option value="EVEN">Even Semester</option>
                                            <option value="SUMMER">Summer</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={newSession.fullName}
                                        onChange={(e) => setNewSession({ ...newSession, fullName: e.target.value })}
                                        placeholder="e.g., 2026-I : Odd Semester"
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Academic Year</label>
                                    <input
                                        type="text"
                                        value={newSession.academicYear}
                                        onChange={(e) => setNewSession({ ...newSession, academicYear: e.target.value })}
                                        placeholder="e.g., 2026-27"
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={newSession.startDate}
                                            onChange={(e) => setNewSession({ ...newSession, startDate: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={newSession.endDate}
                                            onChange={(e) => setNewSession({ ...newSession, endDate: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newSession.isCurrent}
                                            onChange={(e) => setNewSession({ ...newSession, isCurrent: e.target.checked })}
                                            className="rounded border-white/20 bg-zinc-800"
                                        />
                                        <span className="text-sm">Set as current session</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newSession.isUpcoming}
                                            onChange={(e) => setNewSession({ ...newSession, isUpcoming: e.target.checked })}
                                            className="rounded border-white/20 bg-zinc-800"
                                        />
                                        <span className="text-sm">Mark as upcoming</span>
                                    </label>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddSession}
                                        className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium"
                                    >
                                        Create Session
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Calendar Modal */}
                {selectedSessionId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 w-full max-w-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Upload Academic Calendar</h2>
                                <button onClick={() => setSelectedSessionId(null)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <CalendarUpload
                                sessionId={selectedSessionId}
                                onUploadComplete={(data) => {
                                    // Refresh sessions if needed, or just close
                                    // ideally we'd trigger a re-fetch of session details if we were showing calendar data here
                                    setSelectedSessionId(null);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
