"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    MessageSquare,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
    X,
    Edit,
    Eye,
    Play,
    Pause
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackCycle {
    id: string;
    name: string;
    type: string;
    sessionId: string;
    sessionName?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    questionsCount?: number;
    responsesCount?: number;
}

interface FeedbackQuestion {
    id: string;
    questionNumber: number;
    questionText: string;
    questionType: string;
    options: string[];
    isMandatory: boolean;
}

const typeColors: Record<string, string> = {
    "MID_SEM": "bg-amber-500/20 text-amber-400",
    "END_SEM": "bg-purple-500/20 text-purple-400",
};

const questionTypes = [
    { value: "YES_NO", label: "Yes/No" },
    { value: "LIKERT_5", label: "5-Point Likert Scale" },
    { value: "TEXT", label: "Free Text" },
    { value: "RATING", label: "1-10 Rating" },
];

export default function FeedbackManagementPage() {
    const { data: session } = useSession();
    const [cycles, setCycles] = useState<FeedbackCycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddCycleModal, setShowAddCycleModal] = useState(false);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState<FeedbackCycle | null>(null);
    const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
    const [newCycle, setNewCycle] = useState({
        name: "",
        type: "MID_SEM",
        sessionId: "",
        startDate: "",
        endDate: "",
        isActive: false,
    });

    // Redirect non-admin users
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        redirect("/");
    }

    useEffect(() => {
        async function fetchCycles() {
            setLoading(true);
            try {
                const response = await fetch("/api/admin/feedback/cycles");
                if (response.ok) {
                    const data = await response.json();
                    setCycles(data.cycles || []);
                }
            } catch (err) {
                console.error("Error fetching cycles:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCycles();
    }, []);

    // Mock data for demonstration
    const mockCycles: FeedbackCycle[] = [
        { id: "1", name: "Mid-Sem Feedback 2025-II", type: "MID_SEM", sessionId: "2025-II", sessionName: "2025-II", startDate: "2026-02-01", endDate: "2026-02-15", isActive: true, questionsCount: 6, responsesCount: 432 },
        { id: "2", name: "End-Sem Feedback 2025-I", type: "END_SEM", sessionId: "2025-I", sessionName: "2025-I", startDate: "2025-11-15", endDate: "2025-11-30", isActive: false, questionsCount: 8, responsesCount: 1250 },
        { id: "3", name: "Mid-Sem Feedback 2025-I", type: "MID_SEM", sessionId: "2025-I", sessionName: "2025-I", startDate: "2025-09-01", endDate: "2025-09-15", isActive: false, questionsCount: 6, responsesCount: 1180 },
    ];

    const mockQuestions: FeedbackQuestion[] = [
        { id: "q1", questionNumber: 1, questionText: "Instructor informed the evaluation criteria at the beginning of the course.", questionType: "YES_NO", options: ["Yes", "No"], isMandatory: true },
        { id: "q2", questionNumber: 2, questionText: "Number of Lectures taken by the instructor was sufficient.", questionType: "YES_NO", options: ["Yes", "No"], isMandatory: true },
        { id: "q3", questionNumber: 3, questionText: "The instructor adapted proper teaching methodology and was audible and clear etc. in the class.", questionType: "LIKERT_5", options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree"], isMandatory: true },
        { id: "q4", questionNumber: 4, questionText: "The instructor was sincere (timely returning the quizzes/exam answer-scripts, etc).", questionType: "LIKERT_5", options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree"], isMandatory: true },
        { id: "q5", questionNumber: 5, questionText: "The instructor was approachable and helpful.", questionType: "LIKERT_5", options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree"], isMandatory: true },
        { id: "q6", questionNumber: 6, questionText: "Overall, I am satisfied with the course.", questionType: "LIKERT_5", options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree"], isMandatory: true },
    ];

    const displayCycles = cycles.length > 0 ? cycles : mockCycles;

    const handleViewQuestions = (cycle: FeedbackCycle) => {
        setSelectedCycle(cycle);
        setQuestions(mockQuestions);
        setShowQuestionsModal(true);
    };

    const handleToggleActive = async (cycleId: string, isActive: boolean) => {
        try {
            // TODO: Implement API call to toggle active status
        } catch (err) {
            console.error("Error toggling cycle:", err);
        }
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
                        <h1 className="text-2xl font-bold">Feedback Cycle Management</h1>
                        <p className="text-zinc-400">Create and manage feedback cycles and questions</p>
                    </div>
                </div>

                {/* Add Cycle Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowAddCycleModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Create Feedback Cycle
                    </button>
                </div>

                {/* Cycles List */}
                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayCycles.map((cycle) => (
                            <div
                                key={cycle.id}
                                className={cn(
                                    "rounded-xl border p-6 transition-colors",
                                    cycle.isActive
                                        ? "border-emerald-500/50 bg-emerald-500/5"
                                        : "border-white/10 bg-zinc-900/50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-lg",
                                            cycle.isActive ? "bg-emerald-500/20" : "bg-zinc-800"
                                        )}>
                                            <MessageSquare className={cn(
                                                "h-6 w-6",
                                                cycle.isActive ? "text-emerald-400" : "text-zinc-400"
                                            )} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold">{cycle.name}</h3>
                                                <span className={cn("px-2 py-0.5 rounded-full text-xs", typeColors[cycle.type])}>
                                                    {cycle.type === "MID_SEM" ? "Mid-Sem" : "End-Sem"}
                                                </span>
                                                {cycle.isActive ? (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-zinc-500/20 text-zinc-400">
                                                        <Clock className="h-3 w-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-400">Session: {cycle.sessionName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right text-sm">
                                            <p className="text-zinc-400">
                                                {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-zinc-500">
                                                {cycle.questionsCount} questions • {cycle.responsesCount} responses
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleActive(cycle.id, cycle.isActive)}
                                                className={cn(
                                                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm",
                                                    cycle.isActive
                                                        ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                                        : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                                                )}
                                            >
                                                {cycle.isActive ? (
                                                    <>
                                                        <Pause className="h-3 w-3" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-3 w-3" />
                                                        Activate
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleViewQuestions(cycle)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-sm hover:bg-white/5"
                                            >
                                                <Eye className="h-3 w-3" />
                                                Questions
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Cycle Modal */}
                {showAddCycleModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 w-full max-w-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Create Feedback Cycle</h2>
                                <button onClick={() => setShowAddCycleModal(false)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Cycle Name</label>
                                    <input
                                        type="text"
                                        value={newCycle.name}
                                        onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                                        placeholder="e.g., Mid-Sem Feedback 2026-I"
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Type</label>
                                        <select
                                            value={newCycle.type}
                                            onChange={(e) => setNewCycle({ ...newCycle, type: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        >
                                            <option value="MID_SEM">Mid-Semester</option>
                                            <option value="END_SEM">End-Semester</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Session</label>
                                        <select
                                            value={newCycle.sessionId}
                                            onChange={(e) => setNewCycle({ ...newCycle, sessionId: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        >
                                            <option value="">Select session</option>
                                            <option value="2025-II">2025-II (Current)</option>
                                            <option value="2025-S">2025-S (Upcoming)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={newCycle.startDate}
                                            onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={newCycle.endDate}
                                            onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowAddCycleModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium">
                                        Create Cycle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Questions Modal */}
                {showQuestionsModal && selectedCycle && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold">Feedback Questions</h2>
                                    <p className="text-sm text-zinc-400">{selectedCycle.name}</p>
                                </div>
                                <button onClick={() => setShowQuestionsModal(false)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {questions.map((q) => (
                                    <div key={q.id} className="rounded-lg border border-white/10 bg-zinc-800/50 p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-indigo-400 font-medium">Q{q.questionNumber}</span>
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-700 text-zinc-300">
                                                        {questionTypes.find(t => t.value === q.questionType)?.label}
                                                    </span>
                                                    {q.isMandatory && (
                                                        <span className="text-red-400 text-xs">* Required</span>
                                                    )}
                                                </div>
                                                <p className="text-sm">{q.questionText}</p>
                                                {q.options.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {q.options.map((opt, idx) => (
                                                            <span key={idx} className="px-2 py-1 rounded bg-zinc-700/50 text-xs text-zinc-400">
                                                                {opt}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button className="p-1 hover:bg-white/5 rounded">
                                                <Edit className="h-4 w-4 text-zinc-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-between">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5">
                                    <Plus className="h-4 w-4" />
                                    Add Question
                                </button>
                                <button
                                    onClick={() => setShowQuestionsModal(false)}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
