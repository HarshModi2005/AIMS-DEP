-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "DegreeType" AS ENUM ('BTECH', 'MTECH', 'PHD', 'MS', 'DUAL_DEGREE');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GENERAL', 'SC', 'ST', 'OBC_NCL', 'OBC_CL', 'EWS', 'PH');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('REGISTERED', 'ON_LEAVE', 'GRADUATED', 'WITHDRAWN', 'SUSPENDED', 'DEREGISTERED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ODD', 'EVEN', 'SUMMER');

-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('SC', 'PC', 'PE', 'OE', 'HC', 'GR', 'NN', 'CP', 'DE');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('UNDERGRADUATE', 'GRADUATE', 'DOCTORAL');

-- CreateEnum
CREATE TYPE "SlotCategory" AS ENUM ('HSS_SCIENCE_MATH_ELEC', 'HSS_ELEC_PROGRAM_CORE', 'DEPARTMENT_ELECTIVE', 'OPEN_ELECTIVE', 'CORE', 'PROJECT');

-- CreateEnum
CREATE TYPE "OfferingStatus" AS ENUM ('PLANNED', 'OPEN_FOR_ENROLLMENT', 'ENROLLMENT_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnrollmentType" AS ENUM ('CREDIT', 'AUDIT', 'ADDITIONAL', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ENROLLED', 'WAITLISTED', 'DROPPED', 'WITHDRAWN', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('MID_SEM', 'END_SEM');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('YES_NO', 'LIKERT_5', 'TEXT', 'RATING');

-- CreateEnum
CREATE TYPE "AcademicEvent" AS ENUM ('ACADEMIC_SESSION', 'COURSE_PRE_REGISTRATION', 'CLASSES', 'COURSE_DROP', 'MIDSEM_COURSE_FEEDBACK', 'MID_SEM_EXAMS', 'WITHDRAW', 'END_SEM_EXAMS', 'COURSE_FEEDBACK', 'GRADES_SUBMISSION', 'SHOW_FEEDBACK_MIDSEM', 'SHOW_FEEDBACK_ENDSEM', 'RESULT_DECLARATION', 'HOLIDAYS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AcademicDocType" AS ENUM ('ACADEMIC_CALENDAR', 'EXAM_SCHEDULE', 'HOLIDAY_LIST', 'FEE_STRUCTURE', 'CURRICULUM', 'SYLLABUS', 'TIMETABLE');

-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'VISITING_FACULTY', 'ADJUNCT_FACULTY');

-- CreateEnum
CREATE TYPE "AdminType" AS ENUM ('SUPER_ADMIN', 'ACADEMIC_ADMIN', 'DEPARTMENT_ADMIN', 'EXAM_ADMIN');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TRANSCRIPT', 'BONAFIDE', 'NO_DUES', 'CHARACTER_CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('LECTURE', 'TUTORIAL', 'PRACTICAL', 'OFFICE_HOURS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "rollNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "yearOfEntry" INTEGER NOT NULL,
    "degreeType" "DegreeType" NOT NULL,
    "degree" TEXT NOT NULL,
    "category" "Category",
    "minorSpecialization" TEXT,
    "concentrationSpecialization" TEXT,
    "currentStatus" "StudentStatus" NOT NULL DEFAULT 'REGISTERED',
    "currentSGPA" DOUBLE PRECISION,
    "cgpa" DOUBLE PRECISION,
    "creditsRegistered" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cumulativeCreditsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "type" "SessionType" NOT NULL,
    "academicYear" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isUpcoming" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemesterRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sgpa" DOUBLE PRECISION,
    "creditsRegistered" DOUBLE PRECISION NOT NULL,
    "creditsEarned" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SemesterRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "lectureHours" INTEGER NOT NULL,
    "tutorialHours" INTEGER NOT NULL,
    "practicalHours" INTEGER NOT NULL,
    "selfStudyHours" DOUBLE PRECISION NOT NULL,
    "credits" DOUBLE PRECISION NOT NULL,
    "department" TEXT NOT NULL,
    "courseCategory" "CourseCategory" NOT NULL,
    "level" "CourseLevel" NOT NULL DEFAULT 'UNDERGRADUATE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotCourse" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "slotCategory" "SlotCategory" NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "targetYear" TEXT,
    "targetProgram" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SlotCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOffering" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "offeringDepartment" TEXT NOT NULL,
    "maxStrength" INTEGER NOT NULL DEFAULT 60,
    "currentStrength" INTEGER NOT NULL DEFAULT 0,
    "status" "OfferingStatus" NOT NULL DEFAULT 'PLANNED',

    CONSTRAINT "CourseOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferingInstructor" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OfferingInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "enrollmentType" "EnrollmentType" NOT NULL,
    "enrollmentStatus" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "courseCategory" "CourseCategory" NOT NULL,
    "grade" TEXT,
    "attendancePercent" DOUBLE PRECISION,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completionStatus" TEXT,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackCycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "sessionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackQuestion" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT,
    "questionNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "options" TEXT[],
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FeedbackQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseFeedback" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CourseFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackResponse" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "response" TEXT NOT NULL,

    CONSTRAINT "FeedbackResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicDate" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" "AcademicEvent" NOT NULL,
    "eventName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "documentType" "AcademicDocType" NOT NULL,
    "sessionId" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "extractedData" JSONB,
    "isParsed" BOOLEAN NOT NULL DEFAULT false,
    "parseError" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AcademicDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" "Designation" NOT NULL,
    "specialization" TEXT,
    "officeRoom" TEXT,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminType" "AdminType" NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSchedule" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,
    "scheduleType" "ScheduleType" NOT NULL DEFAULT 'LECTURE',

    CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Prerequisites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Prerequisites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_rollNumber_key" ON "User"("rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_name_key" ON "AcademicSession"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SemesterRecord_studentId_sessionId_key" ON "SemesterRecord"("studentId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseCode_key" ON "Course"("courseCode");

-- CreateIndex
CREATE UNIQUE INDEX "SlotCourse_courseId_sessionId_slot_key" ON "SlotCourse"("courseId", "sessionId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOffering_courseId_sessionId_key" ON "CourseOffering"("courseId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferingInstructor_offeringId_facultyId_key" ON "OfferingInstructor"("offeringId", "facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_courseOfferingId_key" ON "Enrollment"("studentId", "courseOfferingId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseFeedback_cycleId_studentId_courseOfferingId_instructo_key" ON "CourseFeedback"("cycleId", "studentId", "courseOfferingId", "instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResponse_feedbackId_questionId_key" ON "FeedbackResponse"("feedbackId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_userId_key" ON "Faculty"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "_Prerequisites_B_index" ON "_Prerequisites"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterRecord" ADD CONSTRAINT "SemesterRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterRecord" ADD CONSTRAINT "SemesterRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotCourse" ADD CONSTRAINT "SlotCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotCourse" ADD CONSTRAINT "SlotCourse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotCourse" ADD CONSTRAINT "SlotCourse_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferingInstructor" ADD CONSTRAINT "OfferingInstructor_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "CourseOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferingInstructor" ADD CONSTRAINT "OfferingInstructor_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "CourseOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackCycle" ADD CONSTRAINT "FeedbackCycle_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackQuestion" ADD CONSTRAINT "FeedbackQuestion_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "FeedbackCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeedback" ADD CONSTRAINT "CourseFeedback_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "FeedbackCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeedback" ADD CONSTRAINT "CourseFeedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeedback" ADD CONSTRAINT "CourseFeedback_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "CourseOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeedback" ADD CONSTRAINT "CourseFeedback_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "CourseFeedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FeedbackQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicDate" ADD CONSTRAINT "AcademicDate_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "CourseOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Prerequisites" ADD CONSTRAINT "_Prerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Prerequisites" ADD CONSTRAINT "_Prerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
