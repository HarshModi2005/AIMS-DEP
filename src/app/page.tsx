"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  Users,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";

const quickActions = [
  { label: "Student Record", href: "/student-record", icon: GraduationCap, color: "from-blue-500 to-cyan-500" },
  { label: "Course Enrollment", href: "/courses/enrollment", icon: BookOpen, color: "from-emerald-500 to-teal-500" },
  { label: "Course Feedback", href: "/feedback", icon: MessageSquare, color: "from-purple-500 to-pink-500" },
];

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-500/20" />
          <div className="relative max-w-7xl mx-auto px-4 py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-8">
                <CheckCircle className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-indigo-300">IIT Ropar Academic Portal</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AIMS Portal
                </span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
                Academic Information Management System - Your one-stop solution for course enrollment,
                academic records, and course feedback at IIT Ropar.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Sign In with Google
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <div
                key={action.label}
                className="rounded-xl border border-white/10 bg-zinc-900/50 p-6"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{action.label}</h3>
                <p className="text-sm text-zinc-400">
                  Access and manage your academic information seamlessly.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // Redirect based on role
  if (session.user?.role === "FACULTY") {
    redirect("/faculty");
  }

  if (session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  // Logged in - show student dashboard
  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {session.user?.name || "Student"}!</h1>
          <p className="text-zinc-400 mt-1">
            {session.user?.rollNumber} • {session.user?.role}
          </p>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group rounded-xl border border-white/10 bg-zinc-900/50 p-6 hover:border-white/20 transition-all"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-400">
                {action.label}
              </h3>
              <div className="flex items-center text-sm text-zinc-400 group-hover:text-indigo-400">
                Go to {action.label}
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
