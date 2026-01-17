"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import CalendarUpload from "@/components/admin/CalendarUpload";

interface AcademicDate {
    id: string;
    event: string;
    eventType: string;
    startDate: string;
    endDate: string;
}

interface Session {
    id: string;
    name: string;
    fullName: string;
    startDate: string;
    endDate: string;
}

interface SessionOption {
    id: string;
    name: string;
    fullName: string;
    isCurrent: boolean;
    isUpcoming: boolean;
}

export default function AcademicInfoPage() {
    const { data: session } = useSession();
    const [sessions, setSessions] = useState<SessionOption[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>("");
    const [showSessionDropdown, setShowSessionDropdown] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [academicDates, setAcademicDates] = useState<AcademicDate[]>([]);
    const [currentSessionInfo, setCurrentSessionInfo] = useState<Session | null>(null);
    const [calendarDoc, setCalendarDoc] = useState<{ url: string, name: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch available sessions
    useEffect(() => {
        async function fetchSessions() {
            try {
                const response = await fetch("/api/sessions");
                if (!response.ok) throw new Error("Failed to fetch sessions");
                const data = await response.json();
                setSessions(data.sessions || []);

                // Set default to current session
                const current = data.sessions?.find((s: SessionOption) => s.isCurrent);
                if (current) {
                    setSelectedSession(current.id);
                } else if (data.sessions?.length > 0) {
                    setSelectedSession(data.sessions[0].id);
                }
            } catch (err) {
                console.error("Error fetching sessions:", err);
            }
        }

        if (session?.user) {
            fetchSessions();
        }
    }, [session]);

    // Fetch academic dates when session changes
    useEffect(() => {
        async function fetchAcademicDates() {
            if (!selectedSession) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/academic-calendar?sessionId=${selectedSession}`);
                if (!response.ok) throw new Error("Failed to fetch academic dates");
                const data = await response.json();

                setAcademicDates(data.dates || []);
                setCurrentSessionInfo(data.session || null);
                setCalendarDoc(data.document || null);
            } catch (err) {
                console.error("Error fetching academic dates:", err);
                setError("Failed to load academic calendar. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        if (selectedSession) {
            fetchAcademicDates();
        }
    }, [selectedSession]);

    const currentSessionOption = sessions.find((s) => s.id === selectedSession);

    if (loading && !academicDates.length) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Academic Calendar</h1>

                {/* Session Selector */}
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-zinc-400">Load for session</span>
                    <div className="relative flex-1 max-w-2xl">
                        <button
                            onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/50 text-left"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-indigo-400">✓</span>
                                {currentSessionOption?.fullName || currentSessionOption?.name || "Select session"}
                            </span>
                            <ChevronDown className="h-4 w-4" />
                        </button>

                        {showSessionDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-white/10 bg-zinc-900 shadow-xl z-10">
                                {sessions.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setSelectedSession(s.id);
                                            setShowSessionDropdown(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2",
                                            s.id === selectedSession && "bg-indigo-600/20"
                                        )}
                                    >
                                        {s.id === selectedSession && (
                                            <span className="text-indigo-400">✓</span>
                                        )}
                                        {s.fullName || s.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5">
                        Other
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                        {error}
                    </div>
                )}

                {/* Header Actions */}
                <div className="flex justify-end gap-3 mb-4">
                    {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors"
                        >
                            <Upload className="h-4 w-4" />
                            Upload Calendar
                        </button>
                    )}

                    {calendarDoc && (
                        <a
                            href={calendarDoc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 font-medium text-sm transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            Download PDF
                        </a>
                    )}
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 w-full max-w-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Upload Academic Calendar</h2>
                                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <CalendarUpload
                                sessionId={selectedSession}
                                onUploadComplete={(data) => {
                                    setShowUploadModal(false);
                                    // Trigger re-fetch of dates
                                    // We can just toggle a refresh trigger or manually call the fetch function if extracted
                                    // For simplicity, we'll just reload the page for now or we could refactor fetchAcademicDates to be callable
                                    window.location.reload();
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Academic Dates Table */}
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        </div>
                    ) : academicDates.length > 0 ? (
                        <table>
                            <thead>
                                <tr className="bg-zinc-900/80">
                                    <th className="text-left">Event</th>
                                    <th className="text-left">Start Date</th>
                                    <th className="text-left">End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {academicDates.map((date) => (
                                    <tr key={date.id}>
                                        <td className="font-medium">{date.event}</td>
                                        <td>
                                            <div className="px-3 py-1 bg-zinc-800/50 rounded border border-white/5 inline-block min-w-[120px]">
                                                {date.startDate}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={cn(
                                                "px-3 py-1 rounded border inline-block min-w-[120px]",
                                                date.endDate === "N/A"
                                                    ? "bg-zinc-700/50 border-zinc-600 text-zinc-400"
                                                    : "bg-zinc-800/50 border-white/5"
                                            )}>
                                                {date.endDate}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-zinc-400">
                            No academic dates found for this session.
                        </div>
                    )}
                </div>

                {/* Admin Notice */}
                <div className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
                    <p className="text-sm text-zinc-400">
                        <strong className="text-zinc-300">Note:</strong> These dates are managed by the academic administration.
                        Contact aims_help@iitrpr.ac.in for any discrepancies.
                    </p>
                </div>
            </div>
        </div>
    );
}
