import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
    BookOpen,
    Calendar,
    Users,
    Clock,
    User,
    LayoutDashboard,
    CheckCircle,
    AlertCircle,
    ArrowLeft
} from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CourseOfferingDetailPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Fetch Course Offering with all related info
    const offering = await prisma.courseOffering.findUnique({
        where: { id },
        include: {
            course: true,
            session: true,
            instructors: {
                include: {
                    faculty: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            },
            schedule: true,
        }
    });

    if (!offering) return notFound();

    // Fetch Slot Info (if any)
    const slotCourse = await prisma.slotCourse.findUnique({
        where: {
            courseId_sessionId_slot: {
                courseId: offering.courseId,
                sessionId: offering.sessionId,
                slot: "A" // Placeholder, ideally we need to find WHICH slot this course belongs to.
                // Actually, SlotCourse is defined by (courseId, sessionId, slot). 
                // A course might be in multiple slots? Schema says unique([courseId, sessionId, slot]).
                // But one course offering usually corresponds to one main slot in a session. 
                // Let's try to find ANY slot course for this course in this session.
            }
        }
    }).catch(() => null);

    // Better way to find slot:
    const slotInfo = await prisma.slotCourse.findFirst({
        where: {
            courseId: offering.courseId,
            sessionId: offering.sessionId
        },
        include: {
            coordinator: {
                include: {
                    user: { select: { firstName: true, lastName: true } }
                }
            }
        }
    });

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/courses/offerings"
                        className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Offerings
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                {offering.course.courseCode} :: {offering.course.courseName}
                            </h1>
                            <div className="flex items-center gap-4 text-zinc-400 text-sm">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {offering.course.credits} Credits
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <LayoutDashboard className="h-4 w-4" />
                                    L-T-P-S: {offering.course.lectureHours}-{offering.course.tutorialHours}-{offering.course.practicalHours}-{offering.course.selfStudyHours}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {offering.session.name}
                                </span>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium border ${offering.status === 'OPEN_FOR_ENROLLMENT'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}>
                            {offering.status.replace(/_/g, " ")}
                        </div>
                    </div>
                </div>

                {/* Main Content Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-indigo-400" />
                                Course Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-zinc-500 mb-1">Offering Department</label>
                                    <div className="text-white font-medium">{offering.offeringDepartment}</div>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-500 mb-1">Course Level</label>
                                    <div className="text-white font-medium">{offering.course.level}</div>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-500 mb-1">Category</label>
                                    <div className="text-white font-medium">{offering.course.courseCategory}</div>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-500 mb-1">Prerequisites</label>
                                    <div className="text-zinc-400 italic">None listed</div>
                                </div>
                            </div>
                        </div>

                        {/* Slot & Schedule */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-400" />
                                Slot & Schedule
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-zinc-500 mb-1">Slot</label>
                                    <div className="text-white font-medium">
                                        {slotInfo ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700">
                                                {slotInfo.slot}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-500">Not assigned</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-500 mb-1">Slot Category</label>
                                    <div className="text-white font-medium">
                                        {slotInfo ? slotInfo.slotCategory.replace(/_/g, " ") : "-"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Instructors & Stats */}
                    <div className="space-y-6">
                        {/* Instructors */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-cyan-400" />
                                Instructors
                            </h2>
                            <div className="space-y-4">
                                {offering.instructors.length > 0 ? (
                                    offering.instructors.map((inst) => (
                                        <div key={inst.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                                {inst.faculty.user.firstName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {inst.faculty.user.firstName} {inst.faculty.user.lastName}
                                                </div>
                                                <div className="text-xs text-zinc-400">
                                                    {inst.isPrimary ? "Primary Instructor" : "Instructor"}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-zinc-500 text-sm">No instructors assigned yet.</div>
                                )}

                                {slotInfo?.coordinator && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Course Coordinator</label>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-zinc-400" />
                                            <span className="text-sm font-medium">
                                                {slotInfo.coordinator.user.firstName} {slotInfo.coordinator.user.lastName}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Capacity Stats */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5 text-emerald-400" />
                                Capacity
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-zinc-400">Enrollment</span>
                                        <span className={
                                            offering.currentStrength >= offering.maxStrength ? "text-red-400" : "text-white"
                                        }>
                                            {offering.currentStrength} / {offering.maxStrength}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${offering.currentStrength >= offering.maxStrength ? "bg-red-500" : "bg-emerald-500"
                                                }`}
                                            style={{ width: `${Math.min((offering.currentStrength / offering.maxStrength) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
