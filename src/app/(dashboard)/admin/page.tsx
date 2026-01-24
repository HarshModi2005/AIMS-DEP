
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import {
    Users,
    BookOpen,
    MessageSquare,
    Calendar,
    Settings,
    BarChart3,
    TrendingUp,
    UserCheck,
    FileText,
    AlertCircle,
    CreditCard
} from "lucide-react";

export default async function AdminDashboard() {
    const session = await auth();

    // Redirect non-admin users
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
        redirect("/");
    }

    // Fetch actual database stats
    const totalStudents = await prisma.user.count({
        where: { role: "STUDENT" }
    });

    const totalUsers = await prisma.user.count();

    const activeFeedbackCycles = await prisma.feedbackCycle.count({
        where: { isActive: true }
    });

    // Count assigned advisors
    const assignedAdvisors = await prisma.facultyAdvisor.count();

    const quickStats = [
        { label: "Total Students", value: totalStudents.toString(), icon: Users, change: "+12%", trend: "up" },
        { label: "Total Users", value: totalUsers.toString(), icon: UserCheck, change: "+8%", trend: "up" },
        { label: "Active Feedback Cycles", value: activeFeedbackCycles.toString(), icon: MessageSquare, change: "-15%", trend: "down" },
        { label: "Documents Pending", value: "12", icon: FileText, change: "+2", trend: "up" },
    ];

    const adminModules = [
        {
            title: "User Management",
            description: "Manage students, faculty, and admin accounts",
            icon: Users,
            href: "/admin/users",
            color: "from-blue-500 to-cyan-500",
            stats: { label: "Total Users", value: totalUsers.toString() },
        },
        {
            title: "Advisor Management",
            description: "Assign faculty advisors to batches",
            icon: UserCheck,
            href: "/admin/assign-advisors",
            color: "from-purple-500 to-indigo-500",
            stats: { label: "Assigned", value: assignedAdvisors.toString() },
        },
        {
            title: "Course Approvals",
            description: "Review and approve faculty course offerings",
            icon: AlertCircle,
            href: "/admin/approvals",
            color: "from-yellow-500 to-amber-500",
            stats: { label: "Pending", value: "3" },
        },
        {
            title: "Course Management",
            description: "Create and manage courses, offerings, and slots",
            icon: BookOpen,
            href: "/admin/courses",
            color: "from-emerald-500 to-teal-500",
            stats: { label: "Active Courses", value: "156" },
        },
        {
            title: "Session Management",
            description: "Academic sessions and calendar events",
            icon: Calendar,
            href: "/admin/sessions",
            color: "from-amber-500 to-orange-500",
            stats: { label: "Current Session", value: "2025-II" },
        },
        {
            title: "Fee Management",
            description: "Check student fee status and payment history",
            icon: CreditCard,
            href: "/admin/fees",
            color: "from-indigo-500 to-violet-500",
            stats: { label: "Pending Dues", value: "12" }, // Placeholder
        },
        {
            title: "Feedback Cycles",
            description: "Create and manage feedback cycles and questions",
            icon: MessageSquare,
            href: "/admin/feedback-cycles",
            color: "from-purple-500 to-pink-500",
            stats: { label: "Active Cycles", value: activeFeedbackCycles.toString() },
        },
        {
            title: "Reports & Analytics",
            description: "View enrollment statistics and feedback reports",
            icon: BarChart3,
            href: "/admin/reports",
            color: "from-rose-500 to-red-500",
            stats: { label: "Reports Generated", value: "24" },
        },
        {
            title: "System Settings",
            description: "Configure system parameters and permissions",
            icon: Settings,
            href: "/admin/settings",
            color: "from-zinc-500 to-slate-500",
            stats: { label: "Last Updated", value: "Today" },
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-zinc-400 mt-1">Manage the AIMS portal</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <span className="text-sm text-amber-400">Admin Mode Active</span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {quickStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-white/10 bg-zinc-900/50 p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <stat.icon className="h-5 w-5 text-zinc-500" />
                                <span className={`flex items-center gap-1 text-xs ${stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                                    }`}>
                                    <TrendingUp className={`h-3 w-3 ${stat.trend === "down" ? "rotate-180" : ""}`} />
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-zinc-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Admin Modules */}
                <h2 className="text-xl font-semibold mb-4">Management Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminModules.map((module) => (
                        <Link
                            key={module.title}
                            href={module.href}
                            className="group rounded-xl border border-white/10 bg-zinc-900/50 p-6 hover:border-white/20 transition-all hover:bg-zinc-900/80"
                        >
                            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${module.color} mb-4`}>
                                <module.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
                                {module.title}
                            </h3>
                            <p className="text-sm text-zinc-400 mb-4">{module.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-xs text-zinc-500">{module.stats.label}</span>
                                <span className="text-sm font-medium text-indigo-400">{module.stats.value}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="mt-8 rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[
                            { action: "New user registered", user: "2023csb1028@iitrpr.ac.in", time: "5 minutes ago" },
                            { action: "Course offering created", user: "Admin", time: "1 hour ago" },
                            { action: "Feedback cycle started", user: "System", time: "2 hours ago" },
                            { action: "Session 2025-II activated", user: "Super Admin", time: "1 day ago" },
                        ].map((activity, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="font-medium">{activity.action}</p>
                                    <p className="text-sm text-zinc-500">By {activity.user}</p>
                                </div>
                                <span className="text-xs text-zinc-500">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
