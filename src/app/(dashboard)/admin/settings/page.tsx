"use client";

import {
    Settings,
    Calendar,
    ToggleLeft,
    ToggleRight,
    Users,
    ShieldAlert,
} from "lucide-react";

export default function SystemSettingsPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Settings className="h-7 w-7 text-indigo-400" />
                        System Settings
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Configure global settings for the Academic Information Management System
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Academic Session */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="h-6 w-6 text-cyan-400" />
                            <h2 className="text-xl font-semibold">Academic Session</h2>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">
                            Manage the currently active academic session.
                        </p>
                        <div className="text-zinc-300">
                            • Current Session: <span className="font-medium">Odd Semester 2025</span>
                        </div>
                        <button className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition">
                            Change Session
                        </button>
                    </div>

                    {/* Enrollment Control */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <ToggleRight className="h-6 w-6 text-emerald-400" />
                            <h2 className="text-xl font-semibold">Enrollment Control</h2>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">
                            Enable or disable course enrollment portal-wide.
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-300">Course Enrollment</span>
                            <span className="text-emerald-400 font-medium">Enabled</span>
                        </div>
                    </div>

                    {/* User & Role Policies */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="h-6 w-6 text-purple-400" />
                            <h2 className="text-xl font-semibold">User & Role Policies</h2>
                        </div>
                        <ul className="text-sm text-zinc-400 space-y-2">
                            <li>• Default Role: Student</li>
                            <li>• Faculty Self-Registration: Disabled</li>
                            <li>• Admin Approval Required: Enabled</li>
                        </ul>
                        <button className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition">
                            Manage Roles
                        </button>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldAlert className="h-6 w-6 text-amber-400" />
                            <h2 className="text-xl font-semibold">Maintenance Mode</h2>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">
                            Temporarily restrict student access during system updates.
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-300">Status</span>
                            <span className="text-zinc-400">Off</span>
                        </div>
                    </div>

                </div>

                {/* Footer Note */}
                <div className="mt-10 text-sm text-zinc-500">
                    ⚠️ Changes here affect the entire portal. Only Super Admins should modify critical settings.
                </div>
            </div>
        </div>
    );
}
