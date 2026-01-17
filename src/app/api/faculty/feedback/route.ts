import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// PUT - Toggle feedback open/close for an offering
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { offeringId, feedbackOpen } = body;

        if (!offeringId || typeof feedbackOpen !== "boolean") {
            return NextResponse.json(
                { error: "offeringId and feedbackOpen (boolean) are required" },
                { status: 400 }
            );
        }

        // Get faculty profile
        const faculty = await prisma.faculty.findFirst({
            where: { user: { email: session.user.email } },
        });

        if (!faculty) {
            return NextResponse.json(
                { error: "Faculty profile not found" },
                { status: 404 }
            );
        }

        // Verify faculty is instructor for this offering
        const offering = await prisma.courseOffering.findUnique({
            where: { id: offeringId },
            include: {
                instructors: true,
                course: { select: { courseCode: true, courseName: true } },
            },
        });

        if (!offering) {
            return NextResponse.json(
                { error: "Offering not found" },
                { status: 404 }
            );
        }

        const isInstructor = offering.instructors.some(
            (i) => i.facultyId === faculty.id
        );

        if (!isInstructor) {
            return NextResponse.json(
                { error: "You are not an instructor for this course" },
                { status: 403 }
            );
        }

        // Update feedback status
        await prisma.courseOffering.update({
            where: { id: offeringId },
            data: { feedbackOpen },
        });

        return NextResponse.json({
            message: feedbackOpen ? "Feedback enabled" : "Feedback disabled",
            offering: {
                id: offering.id,
                courseCode: offering.course.courseCode,
                courseName: offering.course.courseName,
                feedbackOpen,
            },
        });
    } catch (error) {
        console.error("Error toggling feedback:", error);
        return NextResponse.json(
            { error: "Failed to toggle feedback" },
            { status: 500 }
        );
    }
}

// GET - Get feedback submissions for faculty's offerings
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const offeringId = searchParams.get("offeringId");

        // Get faculty profile
        const faculty = await prisma.faculty.findFirst({
            where: { user: { email: session.user.email } },
        });

        if (!faculty) {
            return NextResponse.json(
                { error: "Faculty profile not found" },
                { status: 404 }
            );
        }

        if (offeringId) {
            // Get feedback for specific offering
            const offering = await prisma.courseOffering.findUnique({
                where: { id: offeringId },
                include: {
                    instructors: true,
                    course: { select: { courseCode: true, courseName: true } },
                    simpleFeedbacks: {
                        include: {
                            student: {
                                include: {
                                    user: { select: { firstName: true, lastName: true } },
                                },
                            },
                        },
                    },
                },
            });

            if (!offering) {
                return NextResponse.json(
                    { error: "Offering not found" },
                    { status: 404 }
                );
            }

            const isInstructor = offering.instructors.some(
                (i) => i.facultyId === faculty.id
            );

            if (!isInstructor) {
                return NextResponse.json(
                    { error: "Not authorized" },
                    { status: 403 }
                );
            }

            return NextResponse.json({
                offering: {
                    id: offering.id,
                    courseCode: offering.course.courseCode,
                    courseName: offering.course.courseName,
                    feedbackOpen: offering.feedbackOpen,
                },
                feedbacks: offering.simpleFeedbacks.map((f) => ({
                    id: f.id,
                    feedback: f.feedback,
                    submittedAt: f.submittedAt,
                    // Anonymous feedback - don't reveal student identity
                })),
                totalCount: offering.simpleFeedbacks.length,
            });
        }

        return NextResponse.json({ error: "offeringId required" }, { status: 400 });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return NextResponse.json(
            { error: "Failed to fetch feedback" },
            { status: 500 }
        );
    }
}
