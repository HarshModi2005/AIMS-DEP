"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, CheckCircle, AlertCircle, Loader2, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
    id: string;
    number: number;
    text: string;
    type: string;
    options: string[];
    isMandatory: boolean;
}

interface CourseInstructor {
    id: string;
    courseCode: string;
    courseName: string;
    instructorId: string;
    instructorName: string;
    isSubmitted: boolean;
}

interface FeedbackCycle {
    id: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
}

interface FeedbackData {
    active: boolean;
    message?: string;
    cycle?: FeedbackCycle;
    questions?: Question[];
    courseInstructors?: CourseInstructor[];
    submittedCount?: number;
    totalCount?: number;
}

// Simple feedback course from faculty-controlled API
interface SimpleFeedbackCourse {
    offeringId: string;
    courseCode: string;
    courseName: string;
    instructor: string;
    hasSubmitted: boolean;
}

export default function FeedbackPage() {
    const { data: session } = useSession();
    const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
    const [selectedFeedbackType, setSelectedFeedbackType] = useState<"MID_SEM" | "END_SEM">("MID_SEM");
    const [selectedCourseInstructor, setSelectedCourseInstructor] = useState<string>("");
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [additionalComments, setAdditionalComments] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Simple feedback state
    const [simpleCourses, setSimpleCourses] = useState<SimpleFeedbackCourse[]>([]);
    const [simpleLoading, setSimpleLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSimpleCourse, setSelectedSimpleCourse] = useState<SimpleFeedbackCourse | null>(null);
    const [simpleFeedbackText, setSimpleFeedbackText] = useState("");
    const [simpleSubmitting, setSimpleSubmitting] = useState(false);
    const [simpleSuccess, setSimpleSuccess] = useState(false);

    // Fetch feedback data
    useEffect(() => {
        async function fetchFeedback() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/feedback?type=${selectedFeedbackType}`);
                if (!response.ok) throw new Error("Failed to fetch feedback data");
                const data = await response.json();
                setFeedbackData(data);

                // Reset form
                setResponses({});
                setAdditionalComments("");
                setSelectedCourseInstructor("");
            } catch (err) {
                console.error("Error fetching feedback:", err);
                setError("Failed to load feedback data. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchFeedback();
        }
    }, [session, selectedFeedbackType]);

    // Fetch simple faculty-controlled feedback courses
    useEffect(() => {
        async function fetchSimpleCourses() {
            try {
                const res = await fetch("/api/student/feedback");
                if (res.ok) {
                    const data = await res.json();
                    setSimpleCourses(data.courses || []);
                }
            } catch (err) {
                console.error("Error fetching simple feedback:", err);
            } finally {
                setSimpleLoading(false);
            }
        }

        if (session?.user) {
            fetchSimpleCourses();
        }
    }, [session]);

    // Open modal for simple feedback
    const openFeedbackModal = (course: SimpleFeedbackCourse) => {
        setSelectedSimpleCourse(course);
        setSimpleFeedbackText("");
        setSimpleSuccess(false);
        setShowModal(true);
    };

    // Submit simple feedback
    const submitSimpleFeedback = async () => {
        if (!selectedSimpleCourse || simpleFeedbackText.length < 10) return;

        setSimpleSubmitting(true);
        try {
            const res = await fetch("/api/student/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    offeringId: selectedSimpleCourse.offeringId,
                    feedback: simpleFeedbackText,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit");
            }

            // Mark as submitted
            setSimpleCourses(prev =>
                prev.map(c =>
                    c.offeringId === selectedSimpleCourse.offeringId
                        ? { ...c, hasSubmitted: true }
                        : c
                )
            );
            setSimpleSuccess(true);
            setTimeout(() => setShowModal(false), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit");
        } finally {
            setSimpleSubmitting(false);
        }
    };

    const handleResponseChange = (questionId: string, value: string) => {
        setResponses((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedCourseInstructor || !feedbackData?.cycle) return;

        // Validate mandatory questions
        const mandatoryQuestions = feedbackData.questions?.filter(q => q.isMandatory) || [];
        const unanswered = mandatoryQuestions.filter(q => !responses[q.id]);

        if (unanswered.length > 0) {
            setError(`Please answer all mandatory questions (${unanswered.length} remaining)`);
            return;
        }

        const [courseOfferingId, instructorId] = selectedCourseInstructor.split("-");

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cycleId: feedbackData.cycle.id,
                    courseOfferingId,
                    instructorId,
                    responses,
                    additionalComments,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit feedback");
            }

            setSuccess(true);

            // Remove submitted course from list
            setFeedbackData((prev) => prev ? {
                ...prev,
                courseInstructors: prev.courseInstructors?.filter(ci => ci.id !== selectedCourseInstructor),
                submittedCount: (prev.submittedCount || 0) + 1,
            } : null);

            // Reset form
            setResponses({});
            setAdditionalComments("");
            setSelectedCourseInstructor("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit feedback");
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

    // Feedback not active - but may have simple feedback courses
    if (!feedbackData?.active) {
        const pendingSimpleCourses = simpleCourses.filter(c => !c.hasSubmitted);

        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Course Feedback</h1>

                    {/* Simple Feedback Section */}
                    {pendingSimpleCourses.length > 0 && (
                        <div className="mb-8">
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 mb-4">
                                <h2 className="text-lg font-semibold text-emerald-400 mb-2">
                                    Instructor Feedback Available
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Your instructors have enabled feedback collection for the following courses.
                                </p>
                            </div>
                            <div className="space-y-3">
                                {pendingSimpleCourses.map((course) => (
                                    <div
                                        key={course.offeringId}
                                        className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                <span className="text-indigo-400">{course.courseCode}</span>
                                                {" - "}{course.courseName}
                                            </p>
                                            <p className="text-sm text-zinc-500">
                                                Instructor: {course.instructor}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => openFeedbackModal(course)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium transition-colors"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            Give Feedback
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No feedback message if nothing available */}
                    {pendingSimpleCourses.length === 0 && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
                            <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-amber-400 mb-2">No Feedback Available</h2>
                            <p className="text-zinc-400">
                                {feedbackData?.message || "Course feedback is currently not open. Please check back later."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Feedback Modal */}
                {showModal && selectedSimpleCourse && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-zinc-900 rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">Course Feedback</h3>
                                    <p className="text-sm text-zinc-400">
                                        {selectedSimpleCourse.courseCode} - {selectedSimpleCourse.courseName}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                {simpleSuccess ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-emerald-400">Feedback Submitted!</p>
                                        <p className="text-sm text-zinc-400 mt-2">Thank you for your feedback.</p>
                                    </div>
                                ) : (
                                    <>
                                        <label className="block text-sm font-medium mb-2">
                                            Your Feedback
                                        </label>
                                        <textarea
                                            value={simpleFeedbackText}
                                            onChange={(e) => setSimpleFeedbackText(e.target.value)}
                                            placeholder="Share your thoughts about this course..."
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        />
                                        <p className="text-xs text-zinc-500 mt-2">
                                            Minimum 10 characters. Your feedback is anonymous.
                                        </p>

                                        {error && (
                                            <p className="text-sm text-red-400 mt-3">{error}</p>
                                        )}

                                        <button
                                            onClick={submitSimpleFeedback}
                                            disabled={simpleSubmitting || simpleFeedbackText.length < 10}
                                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {simpleSubmitting ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Submit Feedback
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Course Feedback</h1>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-emerald-400 mb-2">Feedback Submitted!</h2>
                        <p className="text-zinc-400 mb-6">
                            Thank you for your feedback. Your response has been recorded anonymously.
                        </p>

                        {(feedbackData?.courseInstructors?.length || 0) > 0 ? (
                            <button
                                onClick={() => setSuccess(false)}
                                className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium"
                            >
                                Submit More Feedback ({feedbackData?.courseInstructors?.length} remaining)
                            </button>
                        ) : (
                            <p className="text-emerald-400 font-medium">
                                You have submitted feedback for all your courses!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Course Feedback</h1>

                {/* Cycle Info */}
                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-indigo-400">{feedbackData.cycle?.name}</h2>
                            <p className="text-sm text-zinc-400">
                                Open until {new Date(feedbackData.cycle?.endDate || "").toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-zinc-400">Progress:</span>
                            <p className="font-medium">
                                {feedbackData.submittedCount || 0} / {feedbackData.totalCount || 0} submitted
                            </p>
                        </div>
                    </div>
                </div>

                {/* Anonymous Notice */}
                <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 mb-6">
                    <p className="text-sm text-zinc-400">
                        <strong className="text-zinc-300">🔒 Anonymous Feedback:</strong> Your identity will NOT be revealed to instructors.
                        Please provide honest and constructive feedback.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                        {error}
                    </div>
                )}

                {/* Feedback Type Selector */}
                <div className="mb-6">
                    <label className="block text-sm text-zinc-400 mb-2">Feedback Type</label>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setSelectedFeedbackType("MID_SEM")}
                            className={cn(
                                "px-4 py-2 rounded-lg font-medium transition-colors",
                                selectedFeedbackType === "MID_SEM"
                                    ? "bg-indigo-600 text-white"
                                    : "border border-white/10 text-zinc-400 hover:text-white"
                            )}
                        >
                            Mid-Semester
                        </button>
                        <button
                            onClick={() => setSelectedFeedbackType("END_SEM")}
                            className={cn(
                                "px-4 py-2 rounded-lg font-medium transition-colors",
                                selectedFeedbackType === "END_SEM"
                                    ? "bg-indigo-600 text-white"
                                    : "border border-white/10 text-zinc-400 hover:text-white"
                            )}
                        >
                            End-Semester
                        </button>
                    </div>
                </div>

                {/* Course-Instructor Selector */}
                {(feedbackData?.courseInstructors?.length || 0) > 0 ? (
                    <div className="mb-6">
                        <label className="block text-sm text-zinc-400 mb-2">Select Course & Instructor</label>
                        <select
                            value={selectedCourseInstructor}
                            onChange={(e) => setSelectedCourseInstructor(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">-- Select a course --</option>
                            {feedbackData?.courseInstructors?.map((ci) => (
                                <option key={ci.id} value={ci.id}>
                                    {ci.courseCode} - {ci.courseName} ({ci.instructorName})
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="p-8 text-center rounded-xl border border-white/10">
                        <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                        <p className="text-zinc-400">No pending feedback for this type.</p>
                    </div>
                )}

                {/* Questions */}
                {selectedCourseInstructor && feedbackData?.questions && (
                    <div className="space-y-6">
                        {feedbackData.questions.map((question) => (
                            <div key={question.id} className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                                <p className="font-medium mb-4">
                                    {question.number}. {question.text}
                                    {question.isMandatory && <span className="text-red-400 ml-1">*</span>}
                                </p>

                                {question.type === "YES_NO" && (
                                    <div className="flex gap-4">
                                        {question.options.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleResponseChange(question.id, option)}
                                                className={cn(
                                                    "px-6 py-2 rounded-lg border transition-colors",
                                                    responses[question.id] === option
                                                        ? "bg-indigo-600 border-indigo-500 text-white"
                                                        : "border-white/10 text-zinc-400 hover:border-white/30"
                                                )}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {question.type === "LIKERT_5" && (
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                        {question.options.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleResponseChange(question.id, option)}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg border text-sm transition-colors",
                                                    responses[question.id] === option
                                                        ? "bg-indigo-600 border-indigo-500 text-white"
                                                        : "border-white/10 text-zinc-400 hover:border-white/30"
                                                )}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {question.type === "TEXT" && (
                                    <textarea
                                        value={responses[question.id] || ""}
                                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                        placeholder="Enter your response..."
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500"
                                    />
                                )}
                            </div>
                        ))}

                        {/* Additional Comments */}
                        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                            <p className="font-medium mb-4">Additional Comments (Optional)</p>
                            <textarea
                                value={additionalComments}
                                onChange={(e) => setAdditionalComments(e.target.value)}
                                placeholder="Any other feedback for the instructor..."
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="h-5 w-5" />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
