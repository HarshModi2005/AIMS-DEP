"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
    BookOpen,
    Calendar,
    ChevronDown,
    GraduationCap,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Plus,
    Shield,
    User,
    Users,
    CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Role = "STUDENT" | "FACULTY" | "ADMIN" | "SUPER_ADMIN" | "FACULTY_ADVISOR";

interface NavChild {
    label: string;
    href: string;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: Role[]; // If undefined, visible to all
    children?: NavChild[];
}

// Student-specific nav items
const studentNavItems: NavItem[] = [
    {
        label: "Courses",
        href: "/courses/enrollment",
        icon: BookOpen,
        roles: ["STUDENT"],
        children: [
            { label: "Courses for Enrollment", href: "/courses/enrollment" },
            { label: "Courses Available for Offering", href: "/courses/offerings" },
        ],
    },
    {
        label: "Slotwise Courses",
        href: "/courses/slotwise",
        icon: LayoutDashboard,
        roles: ["STUDENT"],
    },
    {
        label: "Course Feedback",
        href: "/feedback",
        icon: MessageSquare,
        roles: ["STUDENT"],
    },
    {
        label: "Fees",
        href: "/fees",
        icon: CreditCard,
        roles: ["STUDENT"],
    },
];

// Faculty-specific nav items
const facultyNavItems: NavItem[] = [
    {
        label: "My Courses",
        href: "/faculty",
        icon: BookOpen,
        roles: ["FACULTY"],
    },
    {
        label: "Float Course",
        href: "/faculty/float-course",
        icon: Plus,
        roles: ["FACULTY"],
    },

];

// Advisor-specific nav items
const advisorNavItems: NavItem[] = [
    {
        label: "View Students",
        href: "/advisor",
        icon: Users,
        roles: ["FACULTY_ADVISOR"],
    },
    {
        label: "Manage Enrollments",
        href: "/advisor/enrollments",
        icon: GraduationCap,
        roles: ["FACULTY_ADVISOR"],
    },
];

// Admin-specific nav items - EMPTY: All navigation is through dashboard
const adminNavItems: NavItem[] = [];

// Common nav items
const commonNavItems: NavItem[] = [
    {
        label: "Help",
        href: "/help",
        icon: HelpCircle,
    },
];

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [pendingFeedback, setPendingFeedback] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const userRole = session?.user?.role as Role | undefined;

    const handleMouseEnter = (label: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setOpenDropdown(label);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
        }, 150);
    };

    // Get nav items based on role
    const getNavItems = (): NavItem[] => {
        if (userRole === "FACULTY_ADVISOR") {
            return [...advisorNavItems, ...commonNavItems];
        }
        if (userRole === "FACULTY") {
            return [...facultyNavItems, ...commonNavItems];
        }
        if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
            return []; // Empty navbar for admins - all navigation through dashboard
        }
        // Default to student
        return [...studentNavItems, ...commonNavItems];
    };

    const navItems = getNavItems();

    // Fetch pending feedback count for notification dot (students only)
    useEffect(() => {
        async function fetchPendingFeedback() {
            if (userRole === "STUDENT" || !userRole) {
                try {
                    const res = await fetch("/api/student/feedback");
                    if (res.ok) {
                        const data = await res.json();
                        setPendingFeedback(data.pendingCount || 0);
                    }
                } catch {
                    // Silently fail
                }
            }
        }
        if (session?.user) {
            fetchPendingFeedback();
        }
    }, [session, userRole]);

    // Determine home link based on role
    const homeHref = userRole === "FACULTY_ADVISOR" ? "/advisor" : userRole === "FACULTY" ? "/faculty" : userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? "/admin" : "/";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-lg">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href={homeHref} className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500">
                            <span className="text-sm font-bold text-white">A</span>
                        </div>
                        <span className="text-lg font-semibold text-white">AIMS</span>
                    </Link>

                    {/* Navigation Items */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <div
                                key={item.href + item.label}
                                className="relative"
                                onMouseEnter={() =>
                                    item.children && handleMouseEnter(item.label)
                                }
                                onMouseLeave={() => item.children && handleMouseLeave()}
                            >
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative",
                                        pathname === item.href ||
                                            pathname.startsWith(item.href + "/")
                                            ? "text-white bg-white/10"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {item.label}
                                    {/* Notification dot for feedback */}
                                    {item.href === "/feedback" && pendingFeedback > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                    )}
                                    {item.children && (
                                        <ChevronDown className="h-4 w-4 transition-transform" />
                                    )}
                                </Link>

                                {/* Dropdown */}
                                {item.children && openDropdown === item.label && (
                                    <div className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-white/10 bg-zinc-900 py-2 shadow-xl">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center gap-4">
                        {session?.user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-zinc-400">
                                    {session.user.rollNumber} ({session.user.role?.toLowerCase()})
                                </span>
                                <div className="relative group">
                                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-medium">
                                        {session.user.name?.charAt(0) || "U"}
                                    </button>

                                    {/* Profile Dropdown */}
                                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-zinc-900 py-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                        {(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-white/5"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Admin Panel
                                            </Link>
                                        )}
                                        {(session.user.role === "FACULTY" || session.user.role === "FACULTY_ADVISOR") && (
                                            <Link
                                                href={session.user.role === "FACULTY_ADVISOR" ? "/advisor" : "/faculty"}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-white/5"
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                {session.user.role === "FACULTY_ADVISOR" ? "Advisor Panel" : "Faculty Panel"}
                                            </Link>
                                        )}
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/login" })}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-white/5"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button asChild variant="outline" size="sm">
                                <Link href="/login">Sign In</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
