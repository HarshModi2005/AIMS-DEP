import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const faculty = await prisma.faculty.findUnique({
            where: { userId: session.user.id },
        });

        if (!faculty) {
            return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 });
        }

        const body = await req.json();
        const { updates } = body; // Expecting { updates: { enrollmentId: string, grade: string }[] }

        if (!updates || !Array.isArray(updates)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // We should verify that the faculty is the instructor for these enrollments, 
        // but for bulk efficiency we might rely on the fact that they can only see enrollments for their course.
        // A stricter check would be to fetch all courseOfferingIds for these enrollments and check faculty mapping.
        // For now, let's assume valid enrollmentIds passed from the frontend which guards this.
        // We can do a quick check if desired, but let's proceed with the update transaction.

        // Group updates by enrollment to fetch related course data efficiently
        // Actually, we can fetch all enrollments with their course offerings first
        const enrollmentIds = updates.map((u: any) => u.enrollmentId);
        const enrollments = await prisma.enrollment.findMany({
            where: {
                id: { in: enrollmentIds },
                courseOffering: {
                    instructors: { some: { facultyId: faculty.id } }
                }
            },
            include: {
                courseOffering: true
            }
        });

        // Group by courseOffering to validate window once per course
        const updatesByCourse: Record<string, typeof updates> = {};
        const enrollmentsMap = new Map(enrollments.map(e => [e.id, e]));

        for (const update of updates) {
            const enrollment = enrollmentsMap.get(update.enrollmentId);
            if (!enrollment) continue; // Skip unauthorized or not found

            const cid = enrollment.courseOfferingId;
            if (!updatesByCourse[cid]) updatesByCourse[cid] = [];
            updatesByCourse[cid].push(update);
        }

        const now = new Date();
        const validUpdates = [];

        for (const [courseId, courseUpdates] of Object.entries(updatesByCourse)) {
            // we have the course offering in enrollments, usually identical for the group
            const sampleEnrollment = enrollments.find(e => e.courseOfferingId === courseId);
            if (!sampleEnrollment) continue;

            const offering = sampleEnrollment.courseOffering;
            let isOpen = false;

            // 1. Override Check - Disabled due to DB sync issues
            // if (offering.gradeSubmissionEnabled === true) { ... }

            // 2. Global Window Only
            const globalWindow = await prisma.academicDate.findFirst({
                where: {
                    eventType: "GRADES_SUBMISSION",
                    sessionId: offering.sessionId,
                    startDate: { lte: now },
                    endDate: { gte: now }
                }
            });
            if (globalWindow) isOpen = true;

            if (!isOpen) {
                // Only fail these specific updates or return partial error?
                // For simplicity, if any course is closed, we might error out or just skip.
                // Let's error out to be explicit to the user.
                return NextResponse.json({
                    error: `Grade submission is closed for course ${offering?.offeringDepartment || "unknown"}`
                }, { status: 403 });
            }

            validUpdates.push(...courseUpdates);
        }

        if (validUpdates.length === 0 && updates.length > 0) {
            return NextResponse.json({ error: "No valid enrollments found or authorized" }, { status: 403 });
        }

        const updatePromises = validUpdates.map((update: any) =>
            prisma.enrollment.update({
                where: { id: update.enrollmentId },
                data: { grade: update.grade }
            })
        );

        await prisma.$transaction(updatePromises);

        return NextResponse.json({ message: "Grades updated successfully" });

    } catch (error) {
        console.error("Error updating grades:", error);
        return NextResponse.json({ error: "Failed to update grades" }, { status: 500 });
    }
}
