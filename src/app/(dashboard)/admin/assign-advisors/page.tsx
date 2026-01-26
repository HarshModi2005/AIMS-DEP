
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Search, UserCheck, Edit2, X } from "lucide-react";
import ConfirmationModal from "@/components/ui/confirmation-modal";

interface Advisor {
    id: string;
    department: string;
    batchYear: number;
    userId: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        rollNumber: string;
    };
}

interface Faculty {
    id: string;
    userId: string;
    name: string;
    email: string;
    department: string;
}

const DEPARTMENTS = [
    "Computer Science and Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Mathematics",
    "Humanities and Social Sciences",
];

const YEARS = [2021, 2022, 2023, 2024, 2025];

export default function AssignAdvisorsPage() {
    const { data: session } = useSession();
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [facultyLoading, setFacultyLoading] = useState(false);

    // Form State
    const [department, setDepartment] = useState(DEPARTMENTS[0]);
    const [batchYear, setBatchYear] = useState(YEARS[2]);
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
    const [facultySearch, setFacultySearch] = useState("");
    const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    // Edit Mode
    const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);

    useEffect(() => {
        fetchAdvisors();
    }, []);

    // Fetch faculty with debounced search
    const fetchFaculty = useCallback(async (query: string) => {
        setFacultyLoading(true);
        try {
            const res = await fetch(`/api/admin/faculty?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.faculty) {
                setFacultyList(data.faculty);
            }
        } catch (error) {
            console.error("Failed to fetch faculty", error);
        } finally {
            setFacultyLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (facultySearch.length > 0 || showFacultyDropdown) {
                fetchFaculty(facultySearch);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [facultySearch, showFacultyDropdown, fetchFaculty]);

    const fetchAdvisors = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/assign-advisor");
            const data = await res.json();
            if (data.advisors) {
                setAdvisors(data.advisors);
            }
        } catch (error) {
            console.error("Failed to fetch advisors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFaculty) {
            setMessage("Please select a faculty member");
            return;
        }
        setShowConfirm(true);
    };

    const confirmAssign = async () => {
        setSubmitting(true);
        setMessage("");
        setShowConfirm(false);

        try {
            const res = await fetch("/api/admin/assign-advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    department: editingAdvisor ? editingAdvisor.department : department,
                    batchYear: editingAdvisor ? editingAdvisor.batchYear : batchYear,
                    facultyEmail: selectedFaculty.email
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("Advisor assigned successfully!");
                setSelectedFaculty(null);
                setFacultySearch("");
                setEditingAdvisor(null);
                fetchAdvisors();
            } else {
                setMessage(data.error || "Failed to assign advisor");
            }
        } catch (error) {
            setMessage("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (advisor: Advisor) => {
        setEditingAdvisor(advisor);
        setDepartment(advisor.department);
        setBatchYear(advisor.batchYear);
        setSelectedFaculty(null);
        setFacultySearch("");
    };

    const cancelEdit = () => {
        setEditingAdvisor(null);
        setSelectedFaculty(null);
        setFacultySearch("");
    };

    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        return <div className="p-10 text-white">Unauthorized</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Manage Faculty Advisors</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-1 rounded-xl border border-white/10 bg-zinc-900/50 p-6 h-fit">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            {editingAdvisor ? (
                                <><Edit2 className="h-5 w-5 text-amber-400" /> Change Advisor</>
                            ) : (
                                <><Plus className="h-5 w-5 text-indigo-400" /> Assign New Advisor</>
                            )}
                        </h2>

                        {editingAdvisor && (
                            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-400">Changing advisor for:</p>
                                        <p className="font-medium">{editingAdvisor.department}</p>
                                        <p className="text-sm text-zinc-400">Batch {editingAdvisor.batchYear}</p>
                                    </div>
                                    <button onClick={cancelEdit} className="p-1 hover:bg-white/10 rounded">
                                        <X className="h-4 w-4 text-zinc-400" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleAssign} className="space-y-4">
                            {!editingAdvisor && (
                                <>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Department</label>
                                        <select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-white"
                                        >
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Batch Year</label>
                                        <select
                                            value={batchYear}
                                            onChange={(e) => setBatchYear(Number(e.target.value))}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-white"
                                        >
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Faculty Search Dropdown */}
                            <div className="relative">
                                <label className="block text-sm text-zinc-400 mb-1">Select Faculty</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={selectedFaculty ? selectedFaculty.name : facultySearch}
                                        onChange={(e) => {
                                            setFacultySearch(e.target.value);
                                            setSelectedFaculty(null);
                                        }}
                                        onFocus={() => {
                                            setShowFacultyDropdown(true);
                                            if (facultyList.length === 0) fetchFaculty("");
                                        }}
                                        placeholder="Search by name or email..."
                                        className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {showFacultyDropdown && !selectedFaculty && (
                                    <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {facultyLoading ? (
                                            <div className="p-3 text-zinc-500 text-sm">Loading...</div>
                                        ) : facultyList.length === 0 ? (
                                            <div className="p-3 text-zinc-500 text-sm">No faculty found</div>
                                        ) : (
                                            facultyList.map(f => (
                                                <button
                                                    key={f.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFaculty(f);
                                                        setShowFacultyDropdown(false);
                                                        setFacultySearch("");
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="font-medium">{f.name}</div>
                                                    <div className="text-xs text-zinc-500">{f.email}</div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}

                                {selectedFaculty && (
                                    <div className="mt-2 p-2 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-indigo-300">{selectedFaculty.name}</div>
                                            <div className="text-xs text-zinc-500">{selectedFaculty.email}</div>
                                        </div>
                                        <button type="button" onClick={() => setSelectedFaculty(null)} className="p-1 hover:bg-white/10 rounded">
                                            <X className="h-4 w-4 text-zinc-400" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {message && (
                                <div className={`p-3 rounded-lg text-sm ${message.includes("success") ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || !selectedFaculty}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? "Assigning..." : <><UserCheck className="h-4 w-4" /> {editingAdvisor ? "Update Advisor" : "Assign Advisor"}</>}
                            </button>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="md:col-span-2 rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Search className="h-5 w-5 text-indigo-400" /> Current Assignments
                        </h2>

                        {loading ? (
                            <p className="text-zinc-500">Loading...</p>
                        ) : advisors.length === 0 ? (
                            <p className="text-zinc-500">No advisors assigned yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs uppercase text-zinc-500 border-b border-white/5">
                                        <tr>
                                            <th className="py-3 px-2">Batch</th>
                                            <th className="py-3 px-2">Department</th>
                                            <th className="py-3 px-2">Advisor</th>
                                            <th className="py-3 px-2">Email</th>
                                            <th className="py-3 px-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {advisors.map((advisor) => (
                                            <tr key={advisor.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-2 text-indigo-400 font-mono">{advisor.batchYear}</td>
                                                <td className="py-3 px-2">{advisor.department}</td>
                                                <td className="py-3 px-2 font-medium">{advisor.user.firstName} {advisor.user.lastName}</td>
                                                <td className="py-3 px-2 text-zinc-400 text-sm">{advisor.user.email}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <button
                                                        onClick={() => startEdit(advisor)}
                                                        className="px-3 py-1.5 text-sm font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded transition-colors"
                                                    >
                                                        Change
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showFacultyDropdown && (
                <div className="fixed inset-0 z-0" onClick={() => setShowFacultyDropdown(false)} />
            )}

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmAssign}
                title={editingAdvisor ? "Confirm Change Advisor" : "Confirm Advisor Assignment"}
                message={`Are you sure you want to assign ${selectedFaculty?.name} as the faculty advisor for ${editingAdvisor ? editingAdvisor.department : department} batch ${editingAdvisor ? editingAdvisor.batchYear : batchYear}?`}
                confirmLabel={editingAdvisor ? "Confirm Change" : "Confirm Assignment"}
            />
        </div>
    );
}
