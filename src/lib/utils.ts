import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function formatDateTime(date: Date | string | null): string {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatGrade(grade: string | null): string {
    if (!grade || grade === "NA") return "NA";
    return grade;
}

export function getGradeColor(grade: string | null): string {
    if (!grade || grade === "NA") return "text-muted-foreground";
    if (grade.startsWith("A")) return "text-emerald-500";
    if (grade.startsWith("B")) return "text-blue-500";
    if (grade.startsWith("C")) return "text-yellow-500";
    if (grade.startsWith("D")) return "text-orange-500";
    return "text-red-500";
}

export function formatCredits(credits: number | null): string {
    if (credits === null) return "0";
    return credits.toFixed(1);
}

export function formatLTP(l: number, t: number, p: number, s: number, c: number): string {
    return `${l}-${t}-${p}-${s}-${c}`;
}

export function parseRollNumber(email: string): string | null {
    // Extract roll number from email like 2023csb1122@iitrpr.ac.in
    const match = email.match(/^(\d{4}[a-z]{2,4}\d{4})@/i);
    return match ? match[1].toUpperCase() : null;
}

export function getAcademicYear(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    // Academic year starts in July
    if (month >= 6) {
        return `${year}-${(year + 1).toString().slice(2)}`;
    }
    return `${year - 1}-${year.toString().slice(2)}`;
}

export function getCurrentSemesterType(date: Date = new Date()): "ODD" | "EVEN" | "SUMMER" {
    const month = date.getMonth();
    if (month >= 6 && month <= 11) return "ODD";
    if (month >= 0 && month <= 4) return "EVEN";
    return "SUMMER";
}
