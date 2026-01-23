import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import {
    BookOpen,
    Calendar,
    GraduationCap,
    MessageSquare,
    ClipboardList,
    FileText
} from "lucide-react";

const quickActions = [
    {
        title: "Student Record",
        description: "View your academic records, grades, and attendance",
        href: "/student-record",
        icon: GraduationCap,
        gradient: "from-indigo-500 to-purple-600",
    },
    {
        title: "Slotwise Courses",
        description: "Browse courses organized by time slots",
        href: "/courses/slotwise",
        icon: ClipboardList,
        gradient: "from-cyan-500 to-blue-600",
    },
    {
        title: "Course Enrollment",
        description: "Enroll in courses for the current semester",
        href: "/courses/enrollment",
        icon: BookOpen,
        gradient: "from-emerald-500 to-green-600",
    },
    {
        title: "Course Feedback",
        description: "Submit feedback for your courses",
        href: "/feedback",
        icon: MessageSquare,
        gradient: "from-pink-500 to-rose-600",
    },
    {
        title: "Documents",
        description: "Access and download your academic documents",
        href: "/student-record?tab=documents",
        icon: FileText,
        gradient: "from-violet-500 to-indigo-600",
    },
];

// Helper to format session type
function formatSessionType(type: string): string {
    const types: Record<string, string> = {
        ODD: "Odd Semester",
        EVEN: "Even Semester",
        SUMMER: "Summer Semester",
    };
    return types[type] || type;
}

// Helper to format date range
function formatDateRange(start: Date, end: Date): string {
    const formatMonth = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    return `${formatMonth(start)} - ${formatMonth(end)}`;
}

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Fetch current academic session from database
    const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
        select: {
            name: true,
            type: true,
            startDate: true,
            endDate: true,
        },
    });

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10" />
                <div className="relative mx-auto max-w-7xl px-4 py-16">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back,{" "}
                        <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            {session.user.name?.split(" ")[0] || "Student"}
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Academic Information Management System
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
                        <span>Roll No: {session.user.rollNumber}</span>
                        <span>•</span>
                        <span>{session.user.email}</span>
                    </div>
                </div>
            </div>

            {/* Important Notice */}
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-amber-400 text-sm">
                        <strong>NOTE:</strong> Please directly contact the course instructor
                        for any changes to your enrollment requests. Before contacting
                        @aims_help for any issues, please check the{" "}
                        <Link href="/help" className="underline hover:text-amber-300">
                            User Guide
                        </Link>{" "}
                        for solutions.
                    </p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="mx-auto max-w-7xl px-4 py-8">
                <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="group relative rounded-xl border border-white/10 bg-zinc-900/50 p-6 transition-all hover:border-white/20 hover:bg-zinc-900/80"
                        >
                            <div
                                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${action.gradient}`}
                            >
                                <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-medium mb-2 group-hover:text-indigo-400 transition-colors">
                                {action.title}
                            </h3>
                            <p className="text-sm text-zinc-500">{action.description}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Current Semester Info - Now Dynamic */}
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                    <h2 className="text-xl font-semibold mb-4">Current Session</h2>
                    {currentSession ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Academic Session</p>
                                <p className="text-lg font-medium">{currentSession.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Session Type</p>
                                <p className="text-lg font-medium">{formatSessionType(currentSession.type)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Duration</p>
                                <p className="text-lg font-medium">
                                    {formatDateRange(currentSession.startDate, currentSession.endDate)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Status</p>
                                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                                    Active
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-zinc-400">No active session found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

