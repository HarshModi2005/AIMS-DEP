
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { rawCourseData } from "./data";
import { CourseCategory, SlotCategory, CourseLevel } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        // Security check
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const lines = rawCourseData.split('\n');
        let currentDepartment = "";
        let isElectiveSection = false;

        // Ensure Session exists
        let targetSession = await prisma.academicSession.findUnique({
            where: { name: "2025-II" }
        });

        if (!targetSession) {
            targetSession = await prisma.academicSession.create({
                data: {
                    name: "2025-II",
                    fullName: "2025-II : Even Semester (Jan 2026 - May 2026)",
                    type: "EVEN",
                    academicYear: "2025-26",
                    startDate: new Date("2026-01-01"),
                    endDate: new Date("2026-05-30"),
                    isCurrent: false, // Don't verify this automatically
                    isUpcoming: true,
                }
            });
        }

        const stats = {
            coursesCreated: 0,
            offeringsCreated: 0,
            errors: [] as string[]
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Detect Department Header
            if (["AI", "CIVIL ENGINEERING", "CHEMICAL ENGINEERING", "COMPUTER SCIENCE AND ENGINEERING", "ELECTRICAL ENGINEERING", "ENGINEERING PHYSICS", "MCB", "MECHANICAL ENGINEERING", "MME"].includes(line)) {
                currentDepartment = line;
                continue;
            }

            // Detect Section Header
            if (line.includes("ELECTIVE COURSES")) {
                isElectiveSection = true;
                continue;
            }
            if (line === "COURSES") {
                isElectiveSection = false;
                continue;
            }
            if (line.startsWith("BATCH") || line.startsWith("COURSES FLOATED") || line.startsWith("S.No.")) {
                continue;
            }

            // Parse Course Line
            // Expected format: S.No. <tab> Code <tab> Description <tab> Slot <tab> L-T-P-S-C <tab> Prereq <tab> Instructor
            // Regex might be fragile due to variable whitespace. Let's try splitting by tab first, or multiple spaces.

            // Heuristic splitting: The data looks tab-separated or multi-space separated.
            // Let's assume tab delimited based on the "S.No." line structure which usually implies TSV from Excel copy.
            const parts = line.split(/\t+/);

            // If split by tab failed (length < 4), try splitting by 2+ spaces
            let effectiveParts = parts;
            if (parts.length < 4) {
                effectiveParts = line.split(/ {2,}/);
            }

            // We need at least Code, Description, L-T-P-S-C
            // But sometimes S.No is merged or missing. 
            // Let's identify the Code column. It usually matches /^[A-Z]{2,3}[0-9]{3}[A-Z]?$/

            let codeIndex = -1;
            for (let j = 0; j < effectiveParts.length; j++) {
                if (/^[A-Z]{2,3}\s?[0-9]{3}[A-Z]?$/.test(effectiveParts[j].trim())) {
                    codeIndex = j;
                    break;
                }
            }

            if (codeIndex === -1 && effectiveParts.length > 2) {
                // Fallback: assume column 1 (index 1) if first is S.No (digit)
                // Or column 0 if no S. No.
                if (/^\d+$/.test(effectiveParts[0])) {
                    codeIndex = 1;
                } else {
                    codeIndex = 0;
                }
            }

            if (codeIndex === -1 || codeIndex >= effectiveParts.length) {
                // stats.errors.push(`Skipping line (no code found): ${line}`);
                continue;
            }

            const courseCode = effectiveParts[codeIndex].trim().replace(/\s+/g, ""); // Remove spaces in code e.g. HS 301 -> HS301
            const courseName = effectiveParts[codeIndex + 1]?.trim();
            const slot = effectiveParts[codeIndex + 2]?.trim(); // Might be Slot or Description if columns shifted
            // Wait, standard order: S.No., Code, Desc, Slot, L-T-P-S-C...
            // Let's assume standard order relative to Code.
            // Code is at codeIndex.
            // Name is codeIndex + 1.
            // Slot is codeIndex + 2.
            // LTPSC is codeIndex + 3.

            let ltpscString = effectiveParts[codeIndex + 3]?.trim();

            // Validation: Does slot look like a slot? Single char or short string. 
            // Does LTPSC look like "3-0-0-6-3"?
            // If not, maybe Shift?

            // Check if LTPSC is actually at codeIndex + 2 (sometimes Slot is missing/merged?)
            // Or maybe Name is long and took two cols?
            // Use Regex to find LTPSC pattern: \d+(?:\.\d+)?-\d+(?:\.\d+)?-\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)+

            let ltpscIndex = -1;
            for (let j = codeIndex + 1; j < effectiveParts.length; j++) {
                if (/^[\d./\- ]+$/.test(effectiveParts[j]) && effectiveParts[j].includes("-")) {
                    ltpscIndex = j;
                    break;
                }
            }

            if (ltpscIndex !== -1) {
                ltpscString = effectiveParts[ltpscIndex];
                // If there's a column between Desc and LTPSC, it's the Slot.
                // If LTPSC is immediately after Name, Slot might be missing or N/A
            }

            if (!ltpscString) {
                stats.errors.push(`Skipping line (no LTPSC found) for ${courseCode}: ${line}`);
                continue;
            }

            // Parse LTPSC
            // Normalize: remove parens
            const cleanLtpsc = ltpscString.replace(/[()]/g, "").trim();
            const vals = cleanLtpsc.split(/[-\s]+/).map(v => parseFloat(v));
            if (vals.some(isNaN)) {
                stats.errors.push(`Invalid LTPSC for ${courseCode}: ${ltpscString}`);
                continue;
            }

            // Mapping: L-T-P-S-C (5 values)
            // Sometimes it might be L-T-P-C (4 values).
            // Usually 5 values in this dataset: 3-0-0-6-3
            let l = 0, t = 0, p = 0, s = 0, c = 0;
            if (vals.length >= 5) {
                [l, t, p, s, c] = vals;
            } else if (vals.length === 4) {
                // Assume L-T-P-C, S=0? Or L-T-P-S?
                // Standard IIT notation is usually L-T-P-C or L-T-P-S-C with S (Self study)
                // Let's assume last is Credit.
                c = vals[vals.length - 1];
                l = vals[0];
                t = vals[1];
                p = vals[2];
            } else if (vals.length === 3) {
                // L-T-P only? C missing?
                [l, t, p] = vals;
                c = l + t + p / 2; // rough guess
            }

            // Create/Update Course
            let courseCategory: CourseCategory = "PC"; // Default
            if (isElectiveSection) courseCategory = "PE";
            if (courseCode.startsWith("HS")) courseCategory = "HC"; // Humanities
            if (courseCode.startsWith("CP")) courseCategory = "CP"; // Project
            if (courseCode.startsWith("GE")) courseCategory = "SC"; // Science Core roughly

            try {
                await prisma.course.upsert({
                    where: { courseCode },
                    create: {
                        courseCode,
                        courseName: courseName || "Unknown Course",
                        department: currentDepartment || "General",
                        lectureHours: l,
                        tutorialHours: t,
                        practicalHours: p,
                        selfStudyHours: s,
                        credits: c,
                        courseCategory,
                    },
                    update: {
                        courseName: courseName || undefined,
                        lectureHours: l,
                        tutorialHours: t,
                        practicalHours: p,
                        selfStudyHours: s,
                        credits: c,
                        department: currentDepartment || undefined
                    }
                });
                stats.coursesCreated++;

                // Create Offering
                const courseRecord = await prisma.course.findUnique({ where: { courseCode } });
                if (courseRecord) {
                    await prisma.courseOffering.upsert({
                        where: {
                            courseId_sessionId: {
                                courseId: courseRecord.id,
                                sessionId: targetSession.id
                            }
                        },
                        create: {
                            courseId: courseRecord.id,
                            sessionId: targetSession.id,
                            offeringDepartment: currentDepartment || "General",
                            status: "OPEN_FOR_ENROLLMENT",
                            maxStrength: 100
                        },
                        update: {
                            status: "OPEN_FOR_ENROLLMENT"
                        }
                    });
                    stats.offeringsCreated++;

                    // Slot course - only if we have a valid slot
                    // This is tricky without coordinators. We omit this for now to avoid crashes.
                    // If the user really needs slots for timetable, we will need dummy faculty.
                    // Let's skip slotCourse creation for now.
                }

            } catch (err: any) {
                stats.errors.push(`DB Error for ${courseCode}: ${err.message}`);
            }
        }

        return NextResponse.json({ success: true, stats });

    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
