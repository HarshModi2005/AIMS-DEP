import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the user's student profile with optimized selective fields
        const student = await prisma.student.findFirst({
            where: {
                user: {
                    email: session.user.email,
                },
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        rollNumber: true,
                    },
                },
                semesterRecords: {
                    include: {
                        session: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                enrollments: {
                    include: {
                        courseOffering: {
                            include: {
                                course: {
                                    select: {
                                        courseCode: true,
                                        courseName: true,
                                        lectureHours: true,
                                        tutorialHours: true,
                                        practicalHours: true,
                                        selfStudyHours: true,
                                        credits: true,
                                    },
                                },
                                session: {
                                    select: {
                                        name: true,
                                    },
                                },
                                instructors: {
                                    include: {
                                        faculty: {
                                            select: {
                                                user: {
                                                    select: {
                                                        firstName: true,
                                                        lastName: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        enrolledAt: "desc",
                    },
                },
            },
        });

        if (!student) {
            return NextResponse.json({
                user: {
                    firstName: session.user.name?.split(" ")[0] || "Student",
                    lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
                    email: session.user.email,
                    rollNumber: session.user.rollNumber || "",
                },
                student: null,
                enrollments: [],
                semesterRecords: [],
            });
        }

        // Transform enrollments with instructors
        const enrollments = student.enrollments.map((enrollment) => ({
            id: enrollment.id,
            courseCode: enrollment.courseOffering.course.courseCode,
            courseName: enrollment.courseOffering.course.courseName,
            ltp: `${enrollment.courseOffering.course.lectureHours}-${enrollment.courseOffering.course.tutorialHours}-${enrollment.courseOffering.course.practicalHours}-${enrollment.courseOffering.course.selfStudyHours}-${enrollment.courseOffering.course.credits}`,
            credits: enrollment.courseOffering.course.credits,
            enrollmentType: enrollment.enrollmentType,
            enrollmentStatus: enrollment.enrollmentStatus,
            courseCategory: enrollment.courseCategory,
            grade: enrollment.grade || "NA",
            attendancePercent: enrollment.attendancePercent || 0,
            session: enrollment.courseOffering.session.name,
            instructors: enrollment.courseOffering.instructors.map(
                (i) => `${i.faculty.user.firstName} ${i.faculty.user.lastName}`
            ),
        }));

        // Transform semester records
        const semesterRecords = student.semesterRecords.map((sr) => ({
            session: sr.session.name,
            sgpa: sr.sgpa,
            creditsRegistered: sr.creditsRegistered,
            creditsEarned: sr.creditsEarned,
        }));

        return NextResponse.json({
            user: {
                firstName: student.user.firstName,
                lastName: student.user.lastName,
                email: student.user.email,
                rollNumber: student.user.rollNumber,
            },
            student: {
                department: student.department,
                yearOfEntry: student.yearOfEntry,
                degreeType: student.degreeType,
                degree: student.degree,
                currentStatus: student.currentStatus,
                cgpa: student.cgpa,
            },
            enrollments,
            semesterRecords,
        });
    } catch (error) {
        console.error("Error fetching student record:", error);
        return NextResponse.json(
            { error: "Failed to fetch student record" },
            { status: 500 }
        );
    }
}
