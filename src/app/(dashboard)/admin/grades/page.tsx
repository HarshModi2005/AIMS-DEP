
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2, Calendar, Save, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AcademicDate {
    id: string;
    sessionId: string;
    startDate: string; // ISO
    endDate: string; // ISO
    isVisible: boolean;
}



export default function AdminGradesPage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [globalDate, setGlobalDate] = useState<AcademicDate | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");



    useEffect(() => {
        if (status === "authenticated" && (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN")) {
            fetchGlobalSettings();
        }
    }, [status, session]);

    const fetchGlobalSettings = async () => {
        try {
            const res = await fetch("/api/admin/grade-window");
            if (res.ok) {
                const data = await res.json();
                if (data.window) {
                    setGlobalDate(data.window);
                    // Convert to datetime-local format: YYYY-MM-DDTHH:MM
                    setStartDate(new Date(data.window.startDate).toISOString().slice(0, 16));
                    setEndDate(new Date(data.window.endDate).toISOString().slice(0, 16));
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const saveGlobalSettings = async () => {
        setProcessing(true);
        try {
            const res = await fetch("/api/admin/grade-window", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString()
                }),
            });

            if (res.ok) {
                alert("Global grade submission window updated.");
                fetchGlobalSettings();
            } else {
                alert("Failed to update settings.");
            }
        } catch (error) {
            console.error("Error saving settings", error);
        } finally {
            setProcessing(false);
        }
    };



    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Grade Submission Control</h1>
                    <p className="text-zinc-400">Manage global submission window and course-specific overrides.</p>
                </div>

                {/* Global Settings */}
                <div className="bg-zinc-900 rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-400" />
                        Global Submission Window
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Start Date & Time</label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">End Date & Time</label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                        <button
                            onClick={saveGlobalSettings}
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Update Global Window
                        </button>
                        {globalDate && (
                            <p className="text-sm text-zinc-500">
                                Current window: <span className="text-zinc-300">{format(new Date(globalDate.startDate), "PP p")}</span> to <span className="text-zinc-300">{format(new Date(globalDate.endDate), "PP p")}</span>
                            </p>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
}
