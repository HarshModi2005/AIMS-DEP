"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Plus,
    Filter,
    MoreVertical,
    UserPlus,
    Mail,
    Shield,
    Loader2,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    rollNumber: string | null;
    role: string;
    createdAt: string;
    student?: {
        department: string;
        degreeType: string;
        currentStatus: string;
    } | null;
}

const roleColors: Record<string, string> = {
    "STUDENT": "bg-blue-500/20 text-blue-400",
    "FACULTY": "bg-emerald-500/20 text-emerald-400",
    "ADMIN": "bg-amber-500/20 text-amber-400",
    "SUPER_ADMIN": "bg-red-500/20 text-red-400",
};

export default function UserManagementPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);

    // Redirect non-admin users
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        redirect("/");
    }

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.append("search", searchQuery);
                if (selectedRole !== "all") params.append("role", selectedRole);

                const response = await fetch(`/api/admin/users?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data.users || []);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [searchQuery, selectedRole]);

    // Mock data for demonstration
    const mockUsers: User[] = [
        { id: "1", email: "2023csb1001@iitrpr.ac.in", firstName: "Rahul", lastName: "Sharma", rollNumber: "2023CSB1001", role: "STUDENT", createdAt: "2023-08-01", student: { department: "Computer Science and Engineering", degreeType: "B.Tech", currentStatus: "REGISTERED" } },
        { id: "2", email: "2023csb1002@iitrpr.ac.in", firstName: "Priya", lastName: "Patel", rollNumber: "2023CSB1002", role: "STUDENT", createdAt: "2023-08-01", student: { department: "Computer Science and Engineering", degreeType: "B.Tech", currentStatus: "REGISTERED" } },
        { id: "3", email: "faculty@iitrpr.ac.in", firstName: "Dr. Amit", lastName: "Kumar", rollNumber: null, role: "FACULTY", createdAt: "2022-01-15", student: null },
        { id: "4", email: "admin@iitrpr.ac.in", firstName: "System", lastName: "Admin", rollNumber: null, role: "ADMIN", createdAt: "2021-06-01", student: null },
    ];

    const displayUsers = users.length > 0 ? users : mockUsers;
    const filteredUsers = displayUsers.filter(user => {
        const matchesSearch = searchQuery === "" ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.rollNumber && user.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = selectedRole === "all" || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 rounded-lg hover:bg-white/5">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-zinc-400">Manage students, faculty, and admin accounts</p>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or roll number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-zinc-900 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-white/10 bg-zinc-900"
                        >
                            <option value="all">All Roles</option>
                            <option value="STUDENT">Students</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="ADMIN">Admins</option>
                            <option value="SUPER_ADMIN">Super Admins</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add User
                    </button>
                </div>

                {/* Users Table */}
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr className="bg-zinc-900/80">
                                    <th className="text-left">User</th>
                                    <th className="text-left">Roll Number</th>
                                    <th className="text-left">Department</th>
                                    <th className="text-left">Role</th>
                                    <th className="text-left">Status</th>

                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-medium">
                                                    {user.firstName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                                    <p className="text-sm text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-indigo-400">{user.rollNumber || "N/A"}</td>
                                        <td className="text-zinc-400 text-sm">
                                            {user.student?.department?.split(" ").map(w => w[0]).join("") || "N/A"}
                                        </td>
                                        <td>
                                            <span className={cn("px-2 py-1 rounded-full text-xs", roleColors[user.role])}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                                                {user.student?.currentStatus || "Active"}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Stats Footer */}
                <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
                    <span>Showing {filteredUsers.length} users</span>
                    <div className="flex items-center gap-4">
                        <span>Students: {filteredUsers.filter(u => u.role === "STUDENT").length}</span>
                        <span>Faculty: {filteredUsers.filter(u => u.role === "FACULTY").length}</span>
                        <span>Admins: {filteredUsers.filter(u => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length}</span>
                    </div>
                </div>

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Add New User</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        placeholder="user@iitrpr.ac.in"
                                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Role</label>
                                    <select className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800">
                                        <option value="STUDENT">Student</option>
                                        <option value="FACULTY">Faculty</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium">
                                        Add User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
