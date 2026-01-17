"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Camera, Mail, Phone, MapPin, Building, Calendar, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentProfile {
    user: {
        firstName: string;
        lastName: string;
        email: string;
        rollNumber: string;
    };
    student: {
        department: string;
        yearOfEntry: number;
        degreeType: string;
        degree: string;
        category: string | null;
        currentStatus: string;
        currentSGPA: number | null;
        cgpa: number | null;
    } | null;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<StudentProfile | null>(null);

    // Local editable state
    const [editableProfile, setEditableProfile] = useState({
        firstName: "",
        lastName: "",
        phone: "+91 98765 43210",
        hostel: "Narmada Hostel",
        room: "B-202",
        permanentAddress: "123 Main Street, City, State - 123456",
    });

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            try {
                const response = await fetch("/api/students/record");
                if (!response.ok) throw new Error("Failed to fetch profile");
                const data = await response.json();
                setProfileData(data);

                // Set editable fields
                setEditableProfile((prev) => ({
                    ...prev,
                    firstName: data.user?.firstName || "",
                    lastName: data.user?.lastName || "",
                }));
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchProfile();
        }
    }, [session]);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call - in production, this would call a profile update API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSaving(false);
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const user = profileData?.user || {
        firstName: session?.user?.name?.split(" ")[0] || "Student",
        lastName: session?.user?.name?.split(" ").slice(1).join(" ") || "",
        email: session?.user?.email || "",
        rollNumber: session?.user?.rollNumber || "",
    };
    const student = profileData?.student;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={isSaving}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                            isEditing
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        )}
                    >
                        {isEditing ? (
                            <>
                                <Save className="h-4 w-4" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </>
                        ) : (
                            "Edit Profile"
                        )}
                    </button>
                </div>

                {/* Profile Header */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
                    <div className="flex items-start gap-6">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-3xl font-bold">
                                {user.firstName.charAt(0)}
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-700">
                                    <Camera className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="text-indigo-400 font-medium">{user.rollNumber}</p>
                            <p className="text-zinc-400 mt-1">{student?.department || "Department not assigned"}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="flex items-center gap-1 text-sm text-zinc-500">
                                    <Mail className="h-4 w-4" />
                                    {user.email}
                                </span>
                                <span className="flex items-center gap-1 text-sm text-zinc-500">
                                    <Building className="h-4 w-4" />
                                    {student?.degreeType || "N/A"}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                                {student?.currentStatus || "REGISTERED"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">First Name</label>
                            <input
                                type="text"
                                value={isEditing ? editableProfile.firstName : user.firstName}
                                onChange={(e) => setEditableProfile({ ...editableProfile, firstName: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 disabled:bg-zinc-800/50 disabled:text-zinc-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={isEditing ? editableProfile.lastName : user.lastName}
                                onChange={(e) => setEditableProfile({ ...editableProfile, lastName: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 disabled:bg-zinc-800/50 disabled:text-zinc-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Email</label>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-zinc-500" />
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Phone</label>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-zinc-500" />
                                <input
                                    type="tel"
                                    value={editableProfile.phone}
                                    onChange={(e) => setEditableProfile({ ...editableProfile, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 disabled:bg-zinc-800/50 disabled:text-zinc-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Roll Number</label>
                            <input
                                type="text"
                                value={user.rollNumber}
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Department</label>
                            <input
                                type="text"
                                value={student?.department || "Not assigned"}
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Degree Type</label>
                            <input
                                type="text"
                                value={student?.degreeType || "N/A"}
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Year of Entry</label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={student?.yearOfEntry || "N/A"}
                                    disabled
                                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Category</label>
                            <input
                                type="text"
                                value={student?.category || "N/A"}
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">CGPA</label>
                            <input
                                type="text"
                                value={student?.cgpa?.toFixed(2) || "N/A"}
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800/50 text-emerald-400 cursor-not-allowed font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Hostel Information */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Hostel Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Hostel</label>
                            <input
                                type="text"
                                value={editableProfile.hostel}
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Room Number</label>
                            <input
                                type="text"
                                value={editableProfile.room}
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                    <h3 className="text-lg font-semibold mb-4">Permanent Address</h3>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-zinc-500 mt-1" />
                        <textarea
                            value={editableProfile.permanentAddress}
                            onChange={(e) => setEditableProfile({ ...editableProfile, permanentAddress: e.target.value })}
                            disabled={!isEditing}
                            rows={2}
                            className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 disabled:bg-zinc-800/50 disabled:text-zinc-400 resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
