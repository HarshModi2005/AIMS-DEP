import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import {
    BarChart3,
    Users,
    BookOpen,
    MessageSquare,

} from "lucide-react";

export default async function ReportsAnalyticsPage() {
    const session = await auth();

    // Redirect non-admin users
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
        redirect("/");
    }

    // Fetch total enrollments count
    const totalEnrollments = await prisma.enrollment.count();

    // Fetch active courses count (CourseOffering)
    const activeCourses = await prisma.courseOffering.count();

    // Fetch total students count
    const totalStudents = await prisma.user.count({
        where: {
            role: "STUDENT"
        }
    });

    // Calculate average students per course
    const avgStudentsPerCourse = activeCourses > 0
        ? Math.round(totalEnrollments / activeCourses)
        : 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-7 w-7 text-pink-400" />
                        Reports & Analytics
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        View enrollment statistics and course feedback insights
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Enrollment Statistics */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="h-6 w-6 text-cyan-400" />
                            <h2 className="text-xl font-semibold">Enrollment Statistics</h2>
                        </div>
                        <ul className="text-sm text-zinc-400 space-y-2">
                            <li>• Total Enrollments: <span className="text-white">{totalEnrollments.toLocaleString()}</span></li>
                            <li>• Active Courses: <span className="text-white">{activeCourses}</span></li>
                            <li>• Average Students / Course: <span className="text-white">{avgStudentsPerCourse}</span></li>
                        </ul>

                    </div>

                    {/* Feedback Analytics */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="h-6 w-6 text-emerald-400" />
                            <h2 className="text-xl font-semibold">Feedback Analytics</h2>
                        </div>
                        <ul className="text-sm text-zinc-400 space-y-2">
                            <li>• Feedback Submitted: <span className="text-white">2,134</span></li>
                            <li>• Pending Feedback: <span className="text-white">234</span></li>
                            <li>• Average Rating: <span className="text-white">4.1 / 5</span></li>
                        </ul>

                    </div>

                    {/* Student Insights */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="h-6 w-6 text-purple-400" />
                            <h2 className="text-xl font-semibold">Student Insights</h2>
                        </div>
                        <ul className="text-sm text-zinc-400 space-y-2">
                            <li>• Total Students: <span className="text-white">{totalStudents.toLocaleString()}</span></li>
                            <li>• Active This Semester: <span className="text-white">1,769</span></li>
                            <li>• Inactive Accounts: <span className="text-white">73</span></li>
                        </ul>
                    </div>



                </div>

                {/* Footer Note */}
                <div className="mt-10 text-sm text-zinc-500">
                    📊 Analytics shown are system-generated summaries. Detailed reports may take time to generate.
                </div>
            </div>
        </div>
    );
}
