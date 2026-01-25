
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const gradeSchema = z.array(z.object({
    name: z.string(),
    enrollmentNumber: z.string(),
    grade: z.string()
}));

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { offeringId, grades } = body;

        if (!offeringId || !grades) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const parsedGrades = gradeSchema.safeParse(grades);
        if (!parsedGrades.success) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // Verify faculty owns the offering
        const faculty = await prisma.faculty.findFirst({
            where: { userId: session.user.id }
        });

        if (!faculty) {
            return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 });
        }

        const offering = await prisma.courseOffering.findUnique({
            where: { id: offeringId },
            include: {
                instructors: true,
                enrollments: {
                    include: {
                        student: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        if (!offering) {
            return NextResponse.json({ error: "Course offering not found" }, { status: 404 });
        }

        const isInstructor = offering.instructors.some(i => i.facultyId === faculty.id);
        if (!isInstructor) {
            return NextResponse.json({ error: "Unauthorized for this course" }, { status: 403 });
        }

        // Check Grade Submission Window
        let submissionOpen = false;
        let message = "Grade submission is closed.";

        // 1. Override Check - Disabled due to DB sync issues
        // if (offering.gradeSubmissionEnabled === true) { ... }

        // 2. Check Global Window Only
        const now = new Date();
        const globalWindow = await prisma.academicDate.findFirst({
            where: {
                eventType: "GRADES_SUBMISSION",
                sessionId: offering.sessionId,
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });

        if (globalWindow) {
            submissionOpen = true;
        } else {
            // Check if future or past
            const upcoming = await prisma.academicDate.findFirst({
                where: {
                    eventType: "GRADES_SUBMISSION",
                    sessionId: offering.sessionId,
                    startDate: { gt: now }
                }
            });
            if (upcoming) {
                message = "Grade submission is yet to start.";
            } else {
                message = "Grade submission deadline has passed.";
            }
        }

        if (!submissionOpen) {
            return NextResponse.json({ error: message }, { status: 403 });
        }

        const results = [];
        const updates = [];

        for (const row of parsedGrades.data) {
            const enrollment = offering.enrollments.find(e =>
                e.student.user.rollNumber.toLowerCase() === row.enrollmentNumber.toLowerCase()
            );

            if (!enrollment) {
                results.push({
                    enrollmentNumber: row.enrollmentNumber,
                    name: row.name,
                    status: "ERROR",
                    message: "Student not found in this course"
                });
                continue;
            }

            // Name check (fuzzy or exact? Let's do simple contains or exact for safety)
            const dbName = `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`;
            if (!dbName.toLowerCase().includes(row.name.toLowerCase()) && !row.name.toLowerCase().includes(dbName.toLowerCase())) {
                results.push({
                    enrollmentNumber: row.enrollmentNumber,
                    name: row.name,
                    status: "WARNING",
                    message: `Name mismatch. Expected: ${dbName}, Got: ${row.name}`
                });
                // We permit it but warn? Or block? requirement says "checked whether name and enrollment matches"
                // Let's return error for safety.
                results[results.length - 1].status = "ERROR";
                continue;
            }

            if (enrollment.enrollmentStatus !== "ENROLLED" && enrollment.enrollmentStatus !== "COMPLETED") {
                results.push({
                    enrollmentNumber: row.enrollmentNumber,
                    name: row.name,
                    status: "ERROR",
                    message: `Student not enrolled (Status: ${enrollment.enrollmentStatus})`
                });
                continue;
            }

            updates.push(prisma.enrollment.update({
                where: { id: enrollment.id },
                data: {
                    grade: row.grade,
                    isCompleted: true, // Mark as completed when grade is uploaded? Maybe not yet.
                    // Actually, usually grade upload implies completion.
                    // But let's just set the grade field for now.
                }
            }));

            results.push({
                enrollmentNumber: row.enrollmentNumber,
                name: row.name,
                status: "SUCCESS",
                message: "Grade valid"
            });
        }

        // Apply valid updates
        if (updates.length > 0) {
            await prisma.$transaction(updates);
        }

        return NextResponse.json({
            message: `Processed ${results.length} rows. ${updates.length} updated.`,
            results
        });

    } catch (error) {
        console.error("Error processing grades:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
