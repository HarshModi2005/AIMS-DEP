
import { PrismaClient, Role, DegreeType, Category, StudentStatus, SessionType, CourseCategory, CourseLevel, OfferingStatus, FeedbackType, QuestionType, AcademicEvent, Designation } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;

// Helper to parse database name
function getDatabaseName(url: string): string {
    try {
        const urlObj = new URL(url.replace(/^postgres:/, 'postgresql:'));
        return urlObj.pathname.slice(1) || 'template1';
    } catch {
        return 'template1';
    }
}

const pool = new Pool({
    connectionString,
    database: getDatabaseName(connectionString),
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Starting seed...");

    // 1. Clean up existing data (optional, but good for idempotency)
    // await prisma.enrollment.deleteMany();
    // await prisma.courseOffering.deleteMany();
    // ... skipping full cleanup to avoid accidental data loss in potential prod-like envs, 
    // but for dev we usually just reset DB. Here we'll use upsert.

    // 2. Create Users
    console.log("Creating Users...");

    // Hash password (use hash for "password123")
    const passwordHash = "$2a$10$YourHashedPasswordHere"; // Placeholder, real bcrypt hash would be better but for seed we can use a known one or just skip password for oauth users

    const adminUser = await prisma.user.upsert({
        where: { email: "admin@iitrpr.ac.in" },
        update: {},
        create: {
            email: "admin@iitrpr.ac.in",
            rollNumber: "ADMIN001",
            firstName: "Admin",
            lastName: "User",
            role: "ADMIN",
            password: passwordHash,
        },
    });

    const studentUser1 = await prisma.user.upsert({
        where: { email: "2023csb1122@iitrpr.ac.in" },
        update: {},
        create: {
            email: "2023csb1122@iitrpr.ac.in",
            rollNumber: "2023CSB1122",
            firstName: "Harsh",
            lastName: "Kumar",
            role: "STUDENT",
            password: passwordHash,
        },
    });

    const studentUser2 = await prisma.user.upsert({
        where: { email: "2023eeb1133@iitrpr.ac.in" },
        update: {},
        create: {
            email: "2023eeb1133@iitrpr.ac.in",
            rollNumber: "2023EEB1133",
            firstName: "Rohan",
            lastName: "Sharma",
            role: "STUDENT",
            password: passwordHash,
        },
    });

    const faculty1 = await prisma.user.upsert({
        where: { email: "satyam@iitrpr.ac.in" },
        update: {},
        create: {
            email: "satyam@iitrpr.ac.in",
            rollNumber: "FAC001",
            firstName: "Satyam",
            lastName: "Agarwal",
            role: "FACULTY",
            password: passwordHash,
        },
    });

    const faculty2 = await prisma.user.upsert({
        where: { email: "sudarshan@iitrpr.ac.in" },
        update: {},
        create: {
            email: "sudarshan@iitrpr.ac.in",
            rollNumber: "FAC002",
            firstName: "Sudarshan",
            lastName: "Iyengar",
            role: "FACULTY",
            password: passwordHash,
        },
    });

    // 3. Create Profiles
    console.log("Creating Profiles...");

    await prisma.student.upsert({
        where: { userId: studentUser1.id },
        update: {},
        create: {
            userId: studentUser1.id,
            department: "Computer Science and Engineering",
            yearOfEntry: 2023,
            degreeType: DegreeType.BTECH,
            degree: "Computer Science",
            category: Category.GENERAL,
            currentStatus: StudentStatus.REGISTERED,
            cgpa: 8.5,
            creditsEarned: 45,
            cumulativeCreditsEarned: 45,
        },
    });

    await prisma.student.upsert({
        where: { userId: studentUser2.id },
        update: {},
        create: {
            userId: studentUser2.id,
            department: "Electrical Engineering",
            yearOfEntry: 2023,
            degreeType: DegreeType.BTECH,
            degree: "Electrical Engineering",
            category: Category.OBC_NCL,
            currentStatus: StudentStatus.REGISTERED,
            cgpa: 8.2,
            creditsEarned: 42,
            cumulativeCreditsEarned: 42,
        },
    });

    const facProfile1 = await prisma.faculty.upsert({
        where: { userId: faculty1.id },
        update: {},
        create: {
            userId: faculty1.id,
            department: "Computer Science and Engineering",
            designation: Designation.ASSISTANT_PROFESSOR,
            specialization: "Networks, Systems",
        },
    });

    const facProfile2 = await prisma.faculty.upsert({
        where: { userId: faculty2.id },
        update: {},
        create: {
            userId: faculty2.id,
            department: "Computer Science and Engineering",
            designation: Designation.ASSOCIATE_PROFESSOR,
            specialization: "Social Networks, Algorithms",
        },
    });

    // 4. Create Academic Sessions
    console.log("Creating Sessions...");

    const session2025II = await prisma.academicSession.upsert({
        where: { name: "2025-II" },
        update: { isCurrent: true },
        create: {
            name: "2025-II",
            fullName: "2025-II : Even Semester (Dec 2025 - May 2026)",
            type: SessionType.EVEN,
            academicYear: "2025-26",
            startDate: new Date("2025-12-01"),
            endDate: new Date("2026-05-31"),
            isCurrent: true,
        },
    });

    const session2025I = await prisma.academicSession.upsert({
        where: { name: "2025-I" },
        update: { isCurrent: false },
        create: {
            name: "2025-I",
            fullName: "2025-I : Odd Semester (July 2025 - Nov 2026)",
            type: SessionType.ODD,
            academicYear: "2025-26",
            startDate: new Date("2025-07-28"),
            endDate: new Date("2025-11-30"),
            isCurrent: false,
        },
    });

    // 5. Create Courses
    console.log("Creating Courses...");

    const cs301 = await prisma.course.upsert({
        where: { courseCode: "CS301" },
        update: {},
        create: {
            courseCode: "CS301",
            courseName: "Operating Systems",
            lectureHours: 3,
            tutorialHours: 0,
            practicalHours: 2,
            selfStudyHours: 4,
            credits: 4,
            department: "Computer Science and Engineering",
            courseCategory: CourseCategory.PC,
            level: CourseLevel.UNDERGRADUATE,
        },
    });

    const cs302 = await prisma.course.upsert({
        where: { courseCode: "CS302" },
        update: {},
        create: {
            courseCode: "CS302",
            courseName: "Computer Networks",
            lectureHours: 3,
            tutorialHours: 0,
            practicalHours: 2,
            selfStudyHours: 4,
            credits: 4,
            department: "Computer Science and Engineering",
            courseCategory: CourseCategory.PC,
            level: CourseLevel.UNDERGRADUATE,
        },
    });

    const cs303 = await prisma.course.upsert({
        where: { courseCode: "CS303" },
        update: {},
        create: {
            courseCode: "CS303",
            courseName: "Database Management Systems",
            lectureHours: 3,
            tutorialHours: 1,
            practicalHours: 2,
            selfStudyHours: 4,
            credits: 4.5, // 3 + 1 + 1 + 0 = 5 ?? Credits logic varies, assuming absolute value
            department: "Computer Science and Engineering",
            courseCategory: CourseCategory.PC,
        },
    });

    const hu101 = await prisma.course.upsert({
        where: { courseCode: "HU101" },
        update: {},
        create: {
            courseCode: "HU101",
            courseName: "Introduction to Humanities",
            lectureHours: 2,
            tutorialHours: 1,
            practicalHours: 0,
            selfStudyHours: 2,
            credits: 3,
            department: "Humanities and Social Sciences",
            courseCategory: CourseCategory.HC,
        },
    });

    // 6. Create Course Offerings
    console.log("Creating Offerings...");

    const offeringCS301 = await prisma.courseOffering.upsert({
        where: { courseId_sessionId: { courseId: cs301.id, sessionId: session2025II.id } },
        update: {},
        create: {
            courseId: cs301.id,
            sessionId: session2025II.id,
            offeringDepartment: "Computer Science and Engineering",
            maxStrength: 60,
            currentStrength: 25,
            status: OfferingStatus.OPEN_FOR_ENROLLMENT,
        },
    });

    await prisma.offeringInstructor.upsert({
        where: { offeringId_facultyId: { offeringId: offeringCS301.id, facultyId: facProfile1.id } },
        update: {},
        create: {
            offeringId: offeringCS301.id,
            facultyId: facProfile1.id,
            isPrimary: true,
        },
    });

    const offeringCS302 = await prisma.courseOffering.upsert({
        where: { courseId_sessionId: { courseId: cs302.id, sessionId: session2025II.id } },
        update: {},
        create: {
            courseId: cs302.id,
            sessionId: session2025II.id,
            offeringDepartment: "Computer Science and Engineering",
            maxStrength: 50,
            currentStrength: 50,
            status: OfferingStatus.ENROLLMENT_CLOSED, // Full
        },
    });

    await prisma.offeringInstructor.upsert({
        where: { offeringId_facultyId: { offeringId: offeringCS302.id, facultyId: facProfile2.id } },
        update: {},
        create: {
            offeringId: offeringCS302.id,
            facultyId: facProfile2.id,
            isPrimary: true,
        },
    });

    const offeringCS303 = await prisma.courseOffering.upsert({
        where: { courseId_sessionId: { courseId: cs303.id, sessionId: session2025II.id } },
        update: {},
        create: {
            courseId: cs303.id,
            sessionId: session2025II.id,
            offeringDepartment: "Computer Science and Engineering",
            maxStrength: 55,
            currentStrength: 10,
            status: OfferingStatus.OPEN_FOR_ENROLLMENT,
        },
    });

    await prisma.offeringInstructor.upsert({
        where: { offeringId_facultyId: { offeringId: offeringCS303.id, facultyId: facProfile1.id } },
        update: {},
        create: {
            offeringId: offeringCS303.id,
            facultyId: facProfile1.id,
            isPrimary: true, // Satyam teaches two courses
        },
    });

    // 7. Academic Dates
    console.log("Creating Academic Dates...");
    await prisma.academicDate.createMany({
        skipDuplicates: true,
        data: [
            {
                sessionId: session2025II.id,
                eventType: AcademicEvent.COURSE_PRE_REGISTRATION,
                eventName: "Course Pre-Registration",
                startDate: new Date("2025-11-15"),
                endDate: new Date("2025-11-20"),
            },
            {
                sessionId: session2025II.id,
                eventType: AcademicEvent.CLASSES,
                eventName: "Commencement of Classes",
                startDate: new Date("2025-12-04"),
                endDate: null,
            },
            {
                sessionId: session2025II.id,
                eventType: AcademicEvent.MID_SEM_EXAMS,
                eventName: "Mid Semester Exams",
                startDate: new Date("2026-02-20"),
                endDate: new Date("2026-02-28"),
            },
        ],
    });

    // 8. Feedback Cycle
    console.log("Creating Feedback Cycle...");
    const feedbackCycle = await prisma.feedbackCycle.create({
        data: {
            name: "Mid-Sem Feedback 2025-II",
            type: FeedbackType.MID_SEM,
            sessionId: session2025II.id,
            startDate: new Date("2026-02-01"),
            endDate: new Date("2026-02-15"),
            isActive: true,
            createdBy: adminUser.id,
            questions: {
                create: [
                    {
                        questionNumber: 1,
                        questionText: "How effective was the instructor in delivering the course content?",
                        questionType: QuestionType.RATING,
                    },
                    {
                        questionNumber: 2,
                        questionText: "Rate the quality of course materials/resources provided.",
                        questionType: QuestionType.LIKERT_5,
                    },
                    {
                        questionNumber: 3,
                        questionText: "Any suggestions for improvement?",
                        questionType: QuestionType.TEXT,
                        isMandatory: false,
                    },
                ],
            },
        },
    });

    console.log("✅ Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
