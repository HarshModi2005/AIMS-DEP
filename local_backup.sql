--
-- PostgreSQL database dump
--

\restrict g6AvrMEdSLHYsnw5KWYEHD27xN1878mazJ1uvNcCxK47PibVTCb1bb0OG9uA32m

-- Dumped from database version 15.15 (Homebrew)
-- Dumped by pg_dump version 15.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."_Prerequisites" DROP CONSTRAINT IF EXISTS "_Prerequisites_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_Prerequisites" DROP CONSTRAINT IF EXISTS "_Prerequisites_A_fkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."SlotCourse" DROP CONSTRAINT IF EXISTS "SlotCourse_sessionId_fkey";
ALTER TABLE IF EXISTS ONLY public."SlotCourse" DROP CONSTRAINT IF EXISTS "SlotCourse_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."SlotCourse" DROP CONSTRAINT IF EXISTS "SlotCourse_coordinatorId_fkey";
ALTER TABLE IF EXISTS ONLY public."SimpleFeedback" DROP CONSTRAINT IF EXISTS "SimpleFeedback_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SimpleFeedback" DROP CONSTRAINT IF EXISTS "SimpleFeedback_courseOfferingId_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."SemesterRecord" DROP CONSTRAINT IF EXISTS "SemesterRecord_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SemesterRecord" DROP CONSTRAINT IF EXISTS "SemesterRecord_sessionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_courseOfferingId_fkey";
ALTER TABLE IF EXISTS ONLY public."OfferingInstructor" DROP CONSTRAINT IF EXISTS "OfferingInstructor_offeringId_fkey";
ALTER TABLE IF EXISTS ONLY public."OfferingInstructor" DROP CONSTRAINT IF EXISTS "OfferingInstructor_facultyId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeedbackResponse" DROP CONSTRAINT IF EXISTS "FeedbackResponse_questionId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeedbackResponse" DROP CONSTRAINT IF EXISTS "FeedbackResponse_feedbackId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeedbackQuestion" DROP CONSTRAINT IF EXISTS "FeedbackQuestion_cycleId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeedbackCycle" DROP CONSTRAINT IF EXISTS "FeedbackCycle_sessionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Faculty" DROP CONSTRAINT IF EXISTS "Faculty_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_courseOfferingId_fkey";
ALTER TABLE IF EXISTS ONLY public."Document" DROP CONSTRAINT IF EXISTS "Document_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."CourseOffering" DROP CONSTRAINT IF EXISTS "CourseOffering_sessionId_fkey";
ALTER TABLE IF EXISTS ONLY public."CourseOffering" DROP CONSTRAINT IF EXISTS "CourseOffering_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."CourseFeedback" DROP CONSTRAINT IF EXISTS "CourseFeedback_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."CourseFeedback" DROP CONSTRAINT IF EXISTS "CourseFeedback_instructorId_fkey";
ALTER TABLE IF EXISTS ONLY public."CourseFeedback" DROP CONSTRAINT IF EXISTS "CourseFeedback_cycleId_fkey";
ALTER TABLE IF EXISTS ONLY public."CourseFeedback" DROP CONSTRAINT IF EXISTS "CourseFeedback_courseOfferingId_fkey";
ALTER TABLE IF EXISTS ONLY public."ClassSchedule" DROP CONSTRAINT IF EXISTS "ClassSchedule_offeringId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."AcademicDate" DROP CONSTRAINT IF EXISTS "AcademicDate_sessionId_fkey";
DROP INDEX IF EXISTS public."_Prerequisites_B_index";
DROP INDEX IF EXISTS public."VerificationToken_token_key";
DROP INDEX IF EXISTS public."VerificationToken_identifier_token_key";
DROP INDEX IF EXISTS public."User_rollNumber_key";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Student_userId_key";
DROP INDEX IF EXISTS public."Student_userId_idx";
DROP INDEX IF EXISTS public."SlotCourse_courseId_sessionId_slot_key";
DROP INDEX IF EXISTS public."SimpleFeedback_studentId_idx";
DROP INDEX IF EXISTS public."SimpleFeedback_courseOfferingId_studentId_key";
DROP INDEX IF EXISTS public."SimpleFeedback_courseOfferingId_idx";
DROP INDEX IF EXISTS public."Session_sessionToken_key";
DROP INDEX IF EXISTS public."SemesterRecord_studentId_sessionId_key";
DROP INDEX IF EXISTS public."SemesterRecord_studentId_idx";
DROP INDEX IF EXISTS public."Payment_razorpayPaymentId_key";
DROP INDEX IF EXISTS public."Payment_razorpayOrderId_key";
DROP INDEX IF EXISTS public."OfferingInstructor_offeringId_idx";
DROP INDEX IF EXISTS public."OfferingInstructor_offeringId_facultyId_key";
DROP INDEX IF EXISTS public."OfferingInstructor_facultyId_idx";
DROP INDEX IF EXISTS public."FeedbackResponse_feedbackId_questionId_key";
DROP INDEX IF EXISTS public."FeedbackCycle_sessionId_idx";
DROP INDEX IF EXISTS public."Faculty_userId_key";
DROP INDEX IF EXISTS public."Faculty_userId_idx";
DROP INDEX IF EXISTS public."Enrollment_studentId_idx";
DROP INDEX IF EXISTS public."Enrollment_studentId_courseOfferingId_key";
DROP INDEX IF EXISTS public."Enrollment_courseOfferingId_idx";
DROP INDEX IF EXISTS public."Course_courseCode_key";
DROP INDEX IF EXISTS public."CourseOffering_sessionId_idx";
DROP INDEX IF EXISTS public."CourseOffering_courseId_sessionId_key";
DROP INDEX IF EXISTS public."CourseFeedback_studentId_idx";
DROP INDEX IF EXISTS public."CourseFeedback_cycleId_studentId_courseOfferingId_instructo_key";
DROP INDEX IF EXISTS public."CourseFeedback_cycleId_idx";
DROP INDEX IF EXISTS public."Admin_userId_key";
DROP INDEX IF EXISTS public."Account_provider_providerAccountId_key";
DROP INDEX IF EXISTS public."AcademicSession_name_key";
DROP INDEX IF EXISTS public."AcademicDate_sessionId_idx";
ALTER TABLE IF EXISTS ONLY public."_Prerequisites" DROP CONSTRAINT IF EXISTS "_Prerequisites_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_pkey";
ALTER TABLE IF EXISTS ONLY public."SlotCourse" DROP CONSTRAINT IF EXISTS "SlotCourse_pkey";
ALTER TABLE IF EXISTS ONLY public."SimpleFeedback" DROP CONSTRAINT IF EXISTS "SimpleFeedback_pkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE IF EXISTS ONLY public."SemesterRecord" DROP CONSTRAINT IF EXISTS "SemesterRecord_pkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_pkey";
ALTER TABLE IF EXISTS ONLY public."OfferingInstructor" DROP CONSTRAINT IF EXISTS "OfferingInstructor_pkey";
ALTER TABLE IF EXISTS ONLY public."FeedbackResponse" DROP CONSTRAINT IF EXISTS "FeedbackResponse_pkey";
ALTER TABLE IF EXISTS ONLY public."FeedbackQuestion" DROP CONSTRAINT IF EXISTS "FeedbackQuestion_pkey";
ALTER TABLE IF EXISTS ONLY public."FeedbackCycle" DROP CONSTRAINT IF EXISTS "FeedbackCycle_pkey";
ALTER TABLE IF EXISTS ONLY public."Faculty" DROP CONSTRAINT IF EXISTS "Faculty_pkey";
ALTER TABLE IF EXISTS ONLY public."Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_pkey";
ALTER TABLE IF EXISTS ONLY public."Document" DROP CONSTRAINT IF EXISTS "Document_pkey";
ALTER TABLE IF EXISTS ONLY public."Course" DROP CONSTRAINT IF EXISTS "Course_pkey";
ALTER TABLE IF EXISTS ONLY public."CourseOffering" DROP CONSTRAINT IF EXISTS "CourseOffering_pkey";
ALTER TABLE IF EXISTS ONLY public."CourseFeedback" DROP CONSTRAINT IF EXISTS "CourseFeedback_pkey";
ALTER TABLE IF EXISTS ONLY public."ClassSchedule" DROP CONSTRAINT IF EXISTS "ClassSchedule_pkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_pkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_pkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_pkey";
ALTER TABLE IF EXISTS ONLY public."AcademicSession" DROP CONSTRAINT IF EXISTS "AcademicSession_pkey";
ALTER TABLE IF EXISTS ONLY public."AcademicDocument" DROP CONSTRAINT IF EXISTS "AcademicDocument_pkey";
ALTER TABLE IF EXISTS ONLY public."AcademicDate" DROP CONSTRAINT IF EXISTS "AcademicDate_pkey";
DROP TABLE IF EXISTS public."_Prerequisites";
DROP TABLE IF EXISTS public."VerificationToken";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Student";
DROP TABLE IF EXISTS public."SlotCourse";
DROP TABLE IF EXISTS public."SimpleFeedback";
DROP TABLE IF EXISTS public."Session";
DROP TABLE IF EXISTS public."SemesterRecord";
DROP TABLE IF EXISTS public."Payment";
DROP TABLE IF EXISTS public."OfferingInstructor";
DROP TABLE IF EXISTS public."FeedbackResponse";
DROP TABLE IF EXISTS public."FeedbackQuestion";
DROP TABLE IF EXISTS public."FeedbackCycle";
DROP TABLE IF EXISTS public."Faculty";
DROP TABLE IF EXISTS public."Enrollment";
DROP TABLE IF EXISTS public."Document";
DROP TABLE IF EXISTS public."CourseOffering";
DROP TABLE IF EXISTS public."CourseFeedback";
DROP TABLE IF EXISTS public."Course";
DROP TABLE IF EXISTS public."ClassSchedule";
DROP TABLE IF EXISTS public."AuditLog";
DROP TABLE IF EXISTS public."Admin";
DROP TABLE IF EXISTS public."Account";
DROP TABLE IF EXISTS public."AcademicSession";
DROP TABLE IF EXISTS public."AcademicDocument";
DROP TABLE IF EXISTS public."AcademicDate";
DROP TYPE IF EXISTS public."StudentStatus";
DROP TYPE IF EXISTS public."SlotCategory";
DROP TYPE IF EXISTS public."SessionType";
DROP TYPE IF EXISTS public."ScheduleType";
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."QuestionType";
DROP TYPE IF EXISTS public."PaymentStatus";
DROP TYPE IF EXISTS public."OfferingStatus";
DROP TYPE IF EXISTS public."FeedbackType";
DROP TYPE IF EXISTS public."EnrollmentType";
DROP TYPE IF EXISTS public."EnrollmentStatus";
DROP TYPE IF EXISTS public."DocumentType";
DROP TYPE IF EXISTS public."Designation";
DROP TYPE IF EXISTS public."DegreeType";
DROP TYPE IF EXISTS public."DayOfWeek";
DROP TYPE IF EXISTS public."CourseLevel";
DROP TYPE IF EXISTS public."CourseCategory";
DROP TYPE IF EXISTS public."Category";
DROP TYPE IF EXISTS public."AdminType";
DROP TYPE IF EXISTS public."AcademicEvent";
DROP TYPE IF EXISTS public."AcademicDocType";
--
-- Name: AcademicDocType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AcademicDocType" AS ENUM (
    'ACADEMIC_CALENDAR',
    'EXAM_SCHEDULE',
    'HOLIDAY_LIST',
    'FEE_STRUCTURE',
    'CURRICULUM',
    'SYLLABUS',
    'TIMETABLE'
);


--
-- Name: AcademicEvent; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AcademicEvent" AS ENUM (
    'ACADEMIC_SESSION',
    'COURSE_PRE_REGISTRATION',
    'CLASSES',
    'COURSE_DROP',
    'MIDSEM_COURSE_FEEDBACK',
    'MID_SEM_EXAMS',
    'WITHDRAW',
    'END_SEM_EXAMS',
    'COURSE_FEEDBACK',
    'GRADES_SUBMISSION',
    'SHOW_FEEDBACK_MIDSEM',
    'SHOW_FEEDBACK_ENDSEM',
    'RESULT_DECLARATION',
    'HOLIDAYS',
    'CUSTOM'
);


--
-- Name: AdminType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdminType" AS ENUM (
    'SUPER_ADMIN',
    'ACADEMIC_ADMIN',
    'DEPARTMENT_ADMIN',
    'EXAM_ADMIN'
);


--
-- Name: Category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Category" AS ENUM (
    'GENERAL',
    'SC',
    'ST',
    'OBC_NCL',
    'OBC_CL',
    'EWS',
    'PH'
);


--
-- Name: CourseCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CourseCategory" AS ENUM (
    'SC',
    'PC',
    'PE',
    'OE',
    'HC',
    'GR',
    'NN',
    'CP',
    'DE'
);


--
-- Name: CourseLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CourseLevel" AS ENUM (
    'UNDERGRADUATE',
    'GRADUATE',
    'DOCTORAL'
);


--
-- Name: DayOfWeek; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DayOfWeek" AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
);


--
-- Name: DegreeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DegreeType" AS ENUM (
    'BTECH',
    'MTECH',
    'PHD',
    'MS',
    'DUAL_DEGREE'
);


--
-- Name: Designation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Designation" AS ENUM (
    'PROFESSOR',
    'ASSOCIATE_PROFESSOR',
    'ASSISTANT_PROFESSOR',
    'VISITING_FACULTY',
    'ADJUNCT_FACULTY'
);


--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DocumentType" AS ENUM (
    'TRANSCRIPT',
    'BONAFIDE',
    'NO_DUES',
    'CHARACTER_CERTIFICATE',
    'OTHER'
);


--
-- Name: EnrollmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EnrollmentStatus" AS ENUM (
    'PENDING',
    'ENROLLED',
    'WAITLISTED',
    'DROPPED',
    'WITHDRAWN',
    'COMPLETED',
    'FAILED'
);


--
-- Name: EnrollmentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EnrollmentType" AS ENUM (
    'CREDIT',
    'AUDIT',
    'ADDITIONAL',
    'IMPROVEMENT'
);


--
-- Name: FeedbackType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FeedbackType" AS ENUM (
    'MID_SEM',
    'END_SEM'
);


--
-- Name: OfferingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OfferingStatus" AS ENUM (
    'PLANNED',
    'OPEN_FOR_ENROLLMENT',
    'ENROLLMENT_CLOSED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


--
-- Name: QuestionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QuestionType" AS ENUM (
    'YES_NO',
    'LIKERT_5',
    'TEXT',
    'RATING'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'STUDENT',
    'FACULTY',
    'ADMIN',
    'SUPER_ADMIN'
);


--
-- Name: ScheduleType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ScheduleType" AS ENUM (
    'LECTURE',
    'TUTORIAL',
    'PRACTICAL',
    'OFFICE_HOURS'
);


--
-- Name: SessionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SessionType" AS ENUM (
    'ODD',
    'EVEN',
    'SUMMER'
);


--
-- Name: SlotCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SlotCategory" AS ENUM (
    'HSS_SCIENCE_MATH_ELEC',
    'HSS_ELEC_PROGRAM_CORE',
    'DEPARTMENT_ELECTIVE',
    'OPEN_ELECTIVE',
    'CORE',
    'PROJECT'
);


--
-- Name: StudentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StudentStatus" AS ENUM (
    'REGISTERED',
    'ON_LEAVE',
    'GRADUATED',
    'WITHDRAWN',
    'SUSPENDED',
    'DEREGISTERED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AcademicDate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AcademicDate" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "eventType" public."AcademicEvent" NOT NULL,
    "eventName" text NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "isVisible" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AcademicDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AcademicDocument" (
    id text NOT NULL,
    title text NOT NULL,
    "documentType" public."AcademicDocType" NOT NULL,
    "sessionId" text,
    "fileUrl" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "extractedData" jsonb,
    "isParsed" boolean DEFAULT false NOT NULL,
    "parseError" text,
    "uploadedBy" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: AcademicSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AcademicSession" (
    id text NOT NULL,
    name text NOT NULL,
    "fullName" text NOT NULL,
    type public."SessionType" NOT NULL,
    "academicYear" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isCurrent" boolean DEFAULT false NOT NULL,
    "isUpcoming" boolean DEFAULT false NOT NULL
);


--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: Admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "adminType" public."AdminType" NOT NULL,
    permissions text[]
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "oldData" jsonb,
    "newData" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ClassSchedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ClassSchedule" (
    id text NOT NULL,
    "offeringId" text NOT NULL,
    "dayOfWeek" public."DayOfWeek" NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    room text,
    "scheduleType" public."ScheduleType" DEFAULT 'LECTURE'::public."ScheduleType" NOT NULL
);


--
-- Name: Course; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Course" (
    id text NOT NULL,
    "courseCode" text NOT NULL,
    "courseName" text NOT NULL,
    "lectureHours" integer NOT NULL,
    "tutorialHours" integer NOT NULL,
    "practicalHours" integer NOT NULL,
    "selfStudyHours" double precision NOT NULL,
    credits double precision NOT NULL,
    department text NOT NULL,
    "courseCategory" public."CourseCategory" NOT NULL,
    level public."CourseLevel" DEFAULT 'UNDERGRADUATE'::public."CourseLevel" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CourseFeedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CourseFeedback" (
    id text NOT NULL,
    "cycleId" text NOT NULL,
    "studentId" text NOT NULL,
    "courseOfferingId" text NOT NULL,
    "instructorId" text NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isAnonymous" boolean DEFAULT true NOT NULL
);


--
-- Name: CourseOffering; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CourseOffering" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "sessionId" text NOT NULL,
    "offeringDepartment" text NOT NULL,
    "maxStrength" integer DEFAULT 60 NOT NULL,
    "currentStrength" integer DEFAULT 0 NOT NULL,
    status public."OfferingStatus" DEFAULT 'PLANNED'::public."OfferingStatus" NOT NULL,
    "feedbackOpen" boolean DEFAULT false NOT NULL,
    fee integer DEFAULT 0 NOT NULL
);


--
-- Name: Document; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "documentType" public."DocumentType" NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Enrollment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Enrollment" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "courseOfferingId" text NOT NULL,
    "enrollmentType" public."EnrollmentType" NOT NULL,
    "enrollmentStatus" public."EnrollmentStatus" DEFAULT 'PENDING'::public."EnrollmentStatus" NOT NULL,
    "courseCategory" public."CourseCategory" NOT NULL,
    grade text,
    "attendancePercent" double precision,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "completionStatus" text,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


--
-- Name: Faculty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Faculty" (
    id text NOT NULL,
    "userId" text NOT NULL,
    department text NOT NULL,
    designation public."Designation" NOT NULL,
    specialization text,
    "officeRoom" text
);


--
-- Name: FeedbackCycle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FeedbackCycle" (
    id text NOT NULL,
    name text NOT NULL,
    type public."FeedbackType" NOT NULL,
    "sessionId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: FeedbackQuestion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FeedbackQuestion" (
    id text NOT NULL,
    "cycleId" text,
    "questionNumber" integer NOT NULL,
    "questionText" text NOT NULL,
    "questionType" public."QuestionType" NOT NULL,
    options text[],
    "isMandatory" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: FeedbackResponse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FeedbackResponse" (
    id text NOT NULL,
    "feedbackId" text NOT NULL,
    "questionId" text NOT NULL,
    response text NOT NULL
);


--
-- Name: OfferingInstructor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OfferingInstructor" (
    id text NOT NULL,
    "offeringId" text NOT NULL,
    "facultyId" text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL
);


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "razorpayOrderId" text NOT NULL,
    "razorpayPaymentId" text,
    "razorpaySignature" text,
    "studentId" text NOT NULL,
    "courseOfferingId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SemesterRecord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SemesterRecord" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "sessionId" text NOT NULL,
    sgpa double precision,
    "creditsRegistered" double precision NOT NULL,
    "creditsEarned" double precision NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: SimpleFeedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SimpleFeedback" (
    id text NOT NULL,
    "courseOfferingId" text NOT NULL,
    "studentId" text NOT NULL,
    feedback text NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: SlotCourse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SlotCourse" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "sessionId" text NOT NULL,
    slot text NOT NULL,
    "slotCategory" public."SlotCategory" NOT NULL,
    "coordinatorId" text NOT NULL,
    "targetYear" text,
    "targetProgram" text,
    "displayOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: Student; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    "userId" text NOT NULL,
    department text NOT NULL,
    "yearOfEntry" integer NOT NULL,
    "degreeType" public."DegreeType" NOT NULL,
    degree text NOT NULL,
    category public."Category",
    "minorSpecialization" text,
    "concentrationSpecialization" text,
    "currentStatus" public."StudentStatus" DEFAULT 'REGISTERED'::public."StudentStatus" NOT NULL,
    "currentSGPA" double precision,
    cgpa double precision,
    "creditsRegistered" double precision DEFAULT 0 NOT NULL,
    "creditsEarned" double precision DEFAULT 0 NOT NULL,
    "cumulativeCreditsEarned" double precision DEFAULT 0 NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text,
    "rollNumber" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "profilePhoto" text,
    role public."Role" DEFAULT 'STUDENT'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: _Prerequisites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_Prerequisites" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Data for Name: AcademicDate; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AcademicDate" VALUES ('cmke2vgrw000locrknfugvrcn', 'session_2025_ii', 'COURSE_PRE_REGISTRATION', 'Course Pre-Registration', '2025-11-15 00:00:00', '2025-11-20 00:00:00', true, '2026-01-14 13:50:10.604', '2026-01-14 13:50:10.604');
INSERT INTO public."AcademicDate" VALUES ('cmke2vgrw000mocrk1f19nh00', 'session_2025_ii', 'CLASSES', 'Commencement of Classes', '2025-12-04 00:00:00', NULL, true, '2026-01-14 13:50:10.604', '2026-01-14 13:50:10.604');
INSERT INTO public."AcademicDate" VALUES ('cmke2vgrw000nocrkn4ccfxo6', 'session_2025_ii', 'MID_SEM_EXAMS', 'Mid Semester Exams', '2026-02-20 00:00:00', '2026-02-28 00:00:00', true, '2026-01-14 13:50:10.604', '2026-01-14 13:50:10.604');
INSERT INTO public."AcademicDate" VALUES ('cmkeasvhz0001e1rk3cjova5i', 'session_2025_ii', 'COURSE_PRE_REGISTRATION', 'Pre-Registration', '2026-01-26 18:30:00', NULL, true, '2026-01-14 17:32:06.647', '2026-01-14 17:32:06.647');


--
-- Data for Name: AcademicDocument; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AcademicDocument" VALUES ('cmkeasvhv0000e1rkbzjd5k9z', 'Academic Calendar', 'ACADEMIC_CALENDAR', 'session_2025_ii', '/uploads/calendars/1768411926544-academiccalendar.pdf', 'academic_calendar.pdf', 502965, '{"events": [{"id": "cmkeasvhz0001e1rk3cjova5i", "endDate": null, "createdAt": "2026-01-14T17:32:06.647Z", "eventName": "Pre-Registration", "eventType": "COURSE_PRE_REGISTRATION", "isVisible": true, "sessionId": "session_2025_ii", "startDate": "2026-01-26T18:30:00.000Z", "updatedAt": "2026-01-14T17:32:06.647Z"}], "eventsFound": 1}', true, NULL, 'cmke2vgqf0000ocrkd7067wvh', '2026-01-14 17:32:06.643', true);


--
-- Data for Name: AcademicSession; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AcademicSession" VALUES ('session_2025_ii', '2025-II', '2025-II : Even Semester (Dec 2025 - May 2026)', 'EVEN', '2025-26', '2025-12-01 00:00:00', '2026-05-31 00:00:00', true, false);
INSERT INTO public."AcademicSession" VALUES ('cmke2vgr7000aocrkfv35sx41', '2025-I', '2025-I : Odd Semester (July 2025 - Nov 2026)', 'ODD', '2025-26', '2025-07-28 00:00:00', '2025-11-30 00:00:00', false, false);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ClassSchedule; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Course" VALUES ('cmke2vgr9000bocrksikozzgx', 'CS301', 'Operating Systems', 3, 0, 2, 4, 4, 'Computer Science and Engineering', 'PC', 'UNDERGRADUATE', true, '2026-01-14 13:50:10.58', '2026-01-14 13:50:10.58');
INSERT INTO public."Course" VALUES ('cmke2vgrc000cocrkmz34pcmu', 'CS302', 'Computer Networks', 3, 0, 2, 4, 4, 'Computer Science and Engineering', 'PC', 'UNDERGRADUATE', true, '2026-01-14 13:50:10.583', '2026-01-14 13:50:10.583');
INSERT INTO public."Course" VALUES ('cmke2vgre000docrk2w1yx9jg', 'CS303', 'Database Management Systems', 3, 1, 2, 4, 4.5, 'Computer Science and Engineering', 'PC', 'UNDERGRADUATE', true, '2026-01-14 13:50:10.585', '2026-01-14 13:50:10.585');
INSERT INTO public."Course" VALUES ('cmke2vgrf000eocrkid2664zd', 'HU101', 'Introduction to Humanities', 2, 1, 0, 2, 3, 'Humanities and Social Sciences', 'HC', 'UNDERGRADUATE', true, '2026-01-14 13:50:10.587', '2026-01-14 13:50:10.587');
INSERT INTO public."Course" VALUES ('cmkeb4hue0002e1rkwdoc0n7m', 'AI502', 'MLOps Lab', 0, 0, 4, 2, 2, 'AI', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.822', '2026-01-14 17:41:08.822');
INSERT INTO public."Course" VALUES ('cmkeb4hvs0012e1rk3vmekrjv', 'CE403', 'Foundation Engineering', 2, 1, 0, 3, 2, 'CIVIL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.872', '2026-01-14 17:41:08.872');
INSERT INTO public."Course" VALUES ('cmkeb4hvv0014e1rkp5h5eztk', 'CE405', 'Waste Water Engineering', 2, 1, 3, 4.5, 3.5, 'CIVIL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.875', '2026-01-14 17:41:08.875');
INSERT INTO public."Course" VALUES ('cmkeb4hvx0016e1rk9trmi7zy', 'CE406', 'Steel Stuctures', 3, 1, 0, 5, 3, 'CIVIL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.877', '2026-01-14 17:41:08.877');
INSERT INTO public."Course" VALUES ('cmkeb4hvz0018e1rko9pg0ary', 'CE407', 'Transportation  Engineering', 3, 1, 2, 6, 4, 'CIVIL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.879', '2026-01-14 17:41:08.879');
INSERT INTO public."Course" VALUES ('cmkeb4hxw002ye1rk7y54j4p1', 'CH507A', 'Introduction to Polymer Science and Engineering', 3, 0, 2, 7, 4, 'CHEMICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.948', '2026-01-14 17:41:08.948');
INSERT INTO public."Course" VALUES ('cmkeb4hxy0030e1rkhhig35qh', 'CH516', 'Advanced Process Control', 3, 0, 2, 7, 4, 'CHEMICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.95', '2026-01-14 17:41:08.95');
INSERT INTO public."Course" VALUES ('cmkeb4hy00032e1rk3drm4maj', 'CH509', 'Molecular Simulation', 3, 0, 2, 7, 4, 'CHEMICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.952', '2026-01-14 17:41:08.952');
INSERT INTO public."Course" VALUES ('cmkeb4hw8001ge1rk8zmke7jb', 'CE519', 'Urban Transportation Systems Planning', 3, 0, 0, 6, 3, 'CIVIL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.888', '2026-01-14 17:41:08.888');
INSERT INTO public."Course" VALUES ('cmkeb4hwb001ie1rk26rrngcw', 'CE525', 'Analysis and Design of industrial Structures', 3, 1, 2, 6, 4, 'CIVIL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.891', '2026-01-14 17:41:08.891');
INSERT INTO public."Course" VALUES ('cmkeb4hwd001ke1rkvdick06w', 'CE602', 'Earthquake Resistant Design (ERD)', 3, 0, 0, 6, 3, 'CIVIL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.893', '2026-01-14 17:41:08.893');
INSERT INTO public."Course" VALUES ('cmkeb4hwg001me1rkp7dwxhwd', 'CE503', 'Groundwater Hydrology', 3, 1, 0, 5, 3, 'CIVIL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.896', '2026-01-14 17:41:08.896');
INSERT INTO public."Course" VALUES ('cmkeb4hwi001oe1rkayrjk5xi', 'CE504', 'Water Resources Planning and Management', 3, 1, 0, 5, 3, 'CIVIL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.898', '2026-01-14 17:41:08.898');
INSERT INTO public."Course" VALUES ('cmkeb4hwk001qe1rk3mqbo1e2', 'CE506', 'Environment impact Assessment of Water Resources Development', 3, 1, 0, 5, 3, 'CIVIL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.9', '2026-01-14 17:41:08.9');
INSERT INTO public."Course" VALUES ('cmkeb4hwm001se1rkkbogokwz', 'CE516', 'Geoinformatics for Water and Environment', 2, 0, 2, 5, 3, 'CIVIL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.902', '2026-01-14 17:41:08.902');
INSERT INTO public."Course" VALUES ('cmkeb4hvi000se1rk0a07pfam', 'IK001', 'Science in Bhagavad Gita', 2, 0, 2, 5, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.862', '2026-01-14 17:41:09.321');
INSERT INTO public."Course" VALUES ('cmkeb4hvk000ue1rkm25g4we6', 'MA703', 'Computational Partial Differential Equations', 3, 0, 2, 7, 4, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.864', '2026-01-14 17:41:09.323');
INSERT INTO public."Course" VALUES ('cmkeb4hvm000we1rkcg5ouyly', 'MA517', 'Distributed Algorithms', 3, 0, 0, 6, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.866', '2026-01-14 17:41:09.325');
INSERT INTO public."Course" VALUES ('cmkeb4hxf002ie1rkfe203pce', 'BM616', 'APPLIED MACHINE LEARNING', 2, 0, 2, 3, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.931', '2026-01-14 17:41:09.331');
INSERT INTO public."Course" VALUES ('cmkeb4hvq0010e1rkeqkrxwuu', 'PH554', 'NONLINEAR OPTICS', 3, 0, 0, 6, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.87', '2026-01-14 17:41:09.329');
INSERT INTO public."Course" VALUES ('cmkeb4hv8000ke1rkr4njexin', 'Hs472', 'International Economics and Finance', 3, 0, 0, 6, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.852', '2026-01-14 17:41:09.312');
INSERT INTO public."Course" VALUES ('cmkeb4huw000ae1rk3pi6pesi', 'CP301', 'Development Engineering Project', 0, 0, 6, 3, 3, 'MME', 'CP', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.84', '2026-01-14 17:41:09.272');
INSERT INTO public."Course" VALUES ('cmkeb4huy000ce1rk7z7ofy0o', 'CP302', 'Capstone I', 0, 0, 6, 3, 3, 'MME', 'CP', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.842', '2026-01-14 17:41:09.287');
INSERT INTO public."Course" VALUES ('cmkeb4hv3000ge1rk71sabwqg', 'HS495', 'Emotion Regulation', 3, 0, 0, 6, 3, 'MME', 'HC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.847', '2026-01-14 17:41:09.303');
INSERT INTO public."Course" VALUES ('cmkeb4hvo000ye1rkf381z2hv', 'PH612', 'THIN FILMS SCIENCE AND TECHNOLOGY', 3, 0, 0, 6, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.868', '2026-01-14 17:41:09.327');
INSERT INTO public."Course" VALUES ('cmkeb4hut0008e1rkljfzniol', 'HS301', 'Industrial Management', 3, 1, 0, 5, 3, 'MCB', 'HC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.837', '2026-01-14 17:41:09.154');
INSERT INTO public."Course" VALUES ('cmkeb4hxg002ke1rkg8r1jdm8', 'CH304', 'Process Equipment Design', 3, 1, 0, 5, 3, 'CHEMICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.932', '2026-01-14 17:41:08.932');
INSERT INTO public."Course" VALUES ('cmkeb4hxj002me1rk75b5n6cj', 'CH305', 'Process Design and Economics', 3, 1, 0, 5, 3, 'CHEMICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.935', '2026-01-14 17:41:08.935');
INSERT INTO public."Course" VALUES ('cmkeb4hxl002oe1rk8rmm1wpr', 'CH331', 'Process Control Lab', 0, 0, 4, 2, 2, 'CHEMICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.937', '2026-01-14 17:41:08.937');
INSERT INTO public."Course" VALUES ('cmkeb4hxn002qe1rk5g4rkd10', 'CH420', 'ASPECTS OF CHEMICAL BUSINESS AND ETHICS', 0, 0, 2, 1, 1, 'CHEMICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.939', '2026-01-14 17:41:08.939');
INSERT INTO public."Course" VALUES ('cmkeb4hvd000oe1rkmxx20hec', 'CY458', 'BIO MATERIALS', 3, 0, 0, 6, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.857', '2026-01-14 17:41:09.317');
INSERT INTO public."Course" VALUES ('cmkeb4hz80048e1rkdiglwh9f', 'CS503', 'Machine Learning', 3, 0, 2, 7, 4, 'MCB', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.996', '2026-01-14 17:41:09.16');
INSERT INTO public."Course" VALUES ('cmkeb4hy30034e1rkjjgdat8s', 'CH504', 'Numerical Methods for Engineers', 3, 0, 2, 7, 4, 'CHEMICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.954', '2026-01-14 17:41:08.954');
INSERT INTO public."Course" VALUES ('cmkeb4hvf000qe1rkwhqpaw5p', 'CY516', 'Elementary Principles of Equilibrium Statistical Mechanics and Stochastic Processes', 3, 0, 0, 6, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.859', '2026-01-14 17:41:09.319');
INSERT INTO public."Course" VALUES ('cmkeb4hyv003we1rkefuvtdh8', 'CS304', 'Computer Networks', 3, 1, 2, 6, 4, 'COMPUTER SCIENCE AND ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.983', '2026-01-14 17:41:08.983');
INSERT INTO public."Course" VALUES ('cmkeb4hyx003ye1rk7dh6fzkx', 'CS305', 'Software Engineering', 3, 1, 2, 6, 4, 'COMPUTER SCIENCE AND ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.985', '2026-01-14 17:41:08.985');
INSERT INTO public."Course" VALUES ('cmkeb4hyz0040e1rkviz9rbdb', 'CS306', 'Theory of Computation', 3, 1, 0, 5, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.987', '2026-01-14 17:41:08.987');
INSERT INTO public."Course" VALUES ('cmkeb4hvb000me1rkuom2mxh9', 'HS514', 'Philosophy of Mind, consciousness and Cognition', 3, 0, 0, 0, 6, 'MME', 'HC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.855', '2026-01-14 17:41:09.315');
INSERT INTO public."Course" VALUES ('cmkeb4hv5000ie1rkoevzpmhm', 'Hs506', 'Brain and Language', 3, 0, 0, 6, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.849', '2026-01-14 17:41:09.308');
INSERT INTO public."Course" VALUES ('cmkeb4hza004ae1rk4kk8kavi', 'CS533', 'Reinforcement Learning (AI core 2 for MTech)', 3, 0, 0, 6, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.998', '2026-01-14 17:41:08.998');
INSERT INTO public."Course" VALUES ('cmkeb4hzd004ce1rk0snstfgx', 'CS543', 'Reinforcement Learning Lab', 0, 0, 2, 1, 1, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.001', '2026-01-14 17:41:09.001');
INSERT INTO public."Course" VALUES ('cmkeb4hun0004e1rkhfxqlwvp', 'AI504', 'Deep Learning', 3, 0, 0, 6, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.831', '2026-01-14 17:41:09.004');
INSERT INTO public."Course" VALUES ('cmkeb4hur0006e1rkz8668xui', 'AI528', 'Big Data Analytics: Tools & Techniques', 2, 0, 2, 5, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.835', '2026-01-14 17:41:09.005');
INSERT INTO public."Course" VALUES ('cmkeb4hzk004ie1rkgie67zyb', 'CS535', 'Introduction to Game Theory and Mechanism Design', 3, 0, 0, 6, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.008', '2026-01-14 17:41:09.008');
INSERT INTO public."Course" VALUES ('cmkeb4hzm004ke1rkzrlsc4u1', 'CS546', 'Introduction to Agriculture Cyber Physical Systems', 2, 0, 2, 5, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.01', '2026-01-14 17:41:09.01');
INSERT INTO public."Course" VALUES ('cmkeb4hzo004me1rkapp6kpkt', 'CS550', 'Research Methodologies in Computer Science', 1, 0, 0, 2, 1, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.012', '2026-01-14 17:41:09.012');
INSERT INTO public."Course" VALUES ('cmkeb4hzq004oe1rkgt4ghsa7', 'CS536', 'Graph Theory', 3, 2, 0, 4, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.014', '2026-01-14 17:41:09.014');
INSERT INTO public."Course" VALUES ('cmkeb4hzs004qe1rkuwghhtlk', 'CS558', 'Cyberscurity Essentials', 3, 0, 0, 6, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.016', '2026-01-14 17:41:09.016');
INSERT INTO public."Course" VALUES ('cmkeb4hzu004se1rkrnm5v802', 'CS560', 'Optimization for Machine Learning', 3, 0, 0, 6, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.018', '2026-01-14 17:41:09.018');
INSERT INTO public."Course" VALUES ('cmkeb4hzw004ue1rklr3618ry', 'CS604', 'ADVANCED OPERATING SYSTEMS', 3, 0, 0, 6, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.02', '2026-01-14 17:41:09.02');
INSERT INTO public."Course" VALUES ('cmkeb4hzy004we1rk82p7jbx1', 'CS563', 'Nature Inspired Computing Alogirhtms', 2, 0, 2, 5, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.022', '2026-01-14 17:41:09.022');
INSERT INTO public."Course" VALUES ('cmkeb4i00004ye1rkwcelmkrt', 'CS614', 'Computational Social Choice', 3, 0, 0, 6, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.024', '2026-01-14 17:41:09.024');
INSERT INTO public."Course" VALUES ('cmkeb4i020050e1rk0lomcl50', 'CS565', 'High Performance Computing Lab', 0, 0, 4, 2, 2, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.026', '2026-01-14 17:41:09.026');
INSERT INTO public."Course" VALUES ('cmkeb4i050052e1rkdemcn2ms', 'CS510', 'Advanced Computer Architecture', 3, 1, 0, 5, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.029', '2026-01-14 17:41:09.029');
INSERT INTO public."Course" VALUES ('cmkeb4i080054e1rkr4k925mg', 'CS523', 'Applied Cryptography', 3, 0, 2, 7, 4, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.032', '2026-01-14 17:41:09.032');
INSERT INTO public."Course" VALUES ('cmkeb4i0a0056e1rkvssbf892', 'CS516', 'Wireless Ad-Hoc Networks', 2, 0, 2, 5, 3, 'COMPUTER SCIENCE AND ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.034', '2026-01-14 17:41:09.034');
INSERT INTO public."Course" VALUES ('cmkeb4i11005we1rkfbnxgdu3', 'EE309', 'Power Systems', 3, 1, 0, 5, 3, 'ELECTRICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.061', '2026-01-14 17:41:09.061');
INSERT INTO public."Course" VALUES ('cmkeb4i13005ye1rkxodiropp', 'EE307', 'Power Electronics', 3, 1, 0, 5, 3, 'ELECTRICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.063', '2026-01-14 17:41:09.063');
INSERT INTO public."Course" VALUES ('cmkeb4i150060e1rkgd5epake', 'EE306', 'Electromagnetics Lab', 0, 0, 3, 1.5, 1.5, 'ELECTRICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.065', '2026-01-14 17:41:09.065');
INSERT INTO public."Course" VALUES ('cmkeb4i170062e1rkxwqufve1', 'EE304', 'Communication Lab', 0, 0, 3, 1.5, 1.5, 'ELECTRICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.067', '2026-01-14 17:41:09.067');
INSERT INTO public."Course" VALUES ('cmkeb4i190064e1rkz085ue6p', 'EE310', 'Power Systems Lab', 0, 0, 3, 1.5, 1.5, 'ELECTRICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.069', '2026-01-14 17:41:09.069');
INSERT INTO public."Course" VALUES ('cmkeb4i1j006ee1rkw2v0mzsi', 'EE402', 'Digital Signal Processing', 3, 0, 0, 0, 3, 'ELECTRICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.079', '2026-01-14 17:41:09.079');
INSERT INTO public."Course" VALUES ('cmkeb4i1l006ge1rk2q4c8y6i', 'EE628', 'RF System for Communication', 3, 0, 0, 6, 3, 'ELECTRICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.081', '2026-01-14 17:41:09.081');
INSERT INTO public."Course" VALUES ('cmkeb4i1n006ie1rk059q0wrk', 'EE522', 'Adaptive Signal Processing', 3, 0, 0, 6, 3, 'ELECTRICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.083', '2026-01-14 17:41:09.083');
INSERT INTO public."Course" VALUES ('cmkeb4i1p006ke1rkzbbdrl3h', 'EE526', 'Communication & Signal Processing lab: 2', 0, 0, 3, 1.5, 1.5, 'ELECTRICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.085', '2026-01-14 17:41:09.085');
INSERT INTO public."Course" VALUES ('cmkeb4i2g007ce1rkzu8gdf14', 'PH303', 'Optics and Photonics', 3, 1, 0, 5, 3, 'ENGINEERING PHYSICS', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.112', '2026-01-14 17:41:09.112');
INSERT INTO public."Course" VALUES ('cmkeb4i2i007ee1rkdrt5of0i', 'PH304', 'Quantum theory of solids', 3, 1, 0, 5, 3, 'ENGINEERING PHYSICS', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.114', '2026-01-14 17:41:09.114');
INSERT INTO public."Course" VALUES ('cmkeb4i2l007ge1rkpyx4dr2k', 'PH305', 'Semiconductor physics and applications', 3, 1, 0, 5, 3, 'ENGINEERING PHYSICS', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.117', '2026-01-14 17:41:09.117');
INSERT INTO public."Course" VALUES ('cmkeb4i2n007ie1rkvpvicocx', 'PH306', 'Numerical method and analysis', 3, 1, 0, 5, 3, 'ENGINEERING PHYSICS', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.119', '2026-01-14 17:41:09.119');
INSERT INTO public."Course" VALUES ('cmkeb4i4v009se1rknp7z8cro', 'ME308', 'Manufacturing Lab-II', 0, 0, 4, 2, 2, 'MECHANICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.199', '2026-01-14 17:41:09.199');
INSERT INTO public."Course" VALUES ('cmkeb4i3o008ke1rkkk6051mk', 'MA302', 'Optimization Techniques', 3, 1, 0, 5, 3, 'MCB', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.156', '2026-01-14 17:41:09.156');
INSERT INTO public."Course" VALUES ('cmkeb4i3q008me1rka0pzidj5', 'MA303', 'Computing Lab-II', 0, 0, 4, 2, 2, 'MCB', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.158', '2026-01-14 17:41:09.158');
INSERT INTO public."Course" VALUES ('cmkeb4i40008we1rkg8fwz078', 'MA628', 'Financial Derivatives Pricing', 3, 0, 2, 7, 4, 'MECHANICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.168', '2026-01-14 17:41:09.247');
INSERT INTO public."Course" VALUES ('cmkeb4i4n009ke1rk0oxvsooh', 'ME304', 'Machine Design', 3, 1, 0, 5, 3, 'MECHANICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.191', '2026-01-14 17:41:09.191');
INSERT INTO public."Course" VALUES ('cmkeb4i4p009me1rkqw56hihn', 'ME305', 'Manufacturing Technology-II', 3, 1, 0, 5, 3, 'MECHANICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.193', '2026-01-14 17:41:09.193');
INSERT INTO public."Course" VALUES ('cmkeb4i4r009oe1rkr0kqagk3', 'ME306', 'Design Lab-II', 0, 0, 3, 1.5, 1.5, 'MECHANICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.195', '2026-01-14 17:41:09.195');
INSERT INTO public."Course" VALUES ('cmkeb4i4t009qe1rk23gpk25r', 'ME307', 'Thermo-Fluids Lab-II', 0, 0, 3, 1.5, 1.5, 'MECHANICAL ENGINEERING', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.197', '2026-01-14 17:41:09.197');
INSERT INTO public."Course" VALUES ('cmkeb4i1f006ae1rkmfj0jlw9', 'HS104', 'Professional Ethics', 1, 1, 1, 13, 1.5, 'MME', 'HC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.075', '2026-01-14 17:41:09.283');
INSERT INTO public."Course" VALUES ('cmkeb4i5400a2e1rkx88schw7', 'ME585', 'Internal Combusion engines, pollution, and control', 3, 1, 0, 6, 3, 'MECHANICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.208', '2026-01-14 17:41:09.208');
INSERT INTO public."Course" VALUES ('cmkeb4i5600a4e1rkp3gqblul', 'ME504', 'Deep Learning for Physical Systems', 3, 0, 0, 6, 3, 'MECHANICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.21', '2026-01-14 17:41:09.21');
INSERT INTO public."Course" VALUES ('cmkeb4i5b00a6e1rkzrx6z68n', 'ME515', 'Finite Element Methods in Engineering', 3, 1, 0, 5, 3, 'MECHANICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.215', '2026-01-14 17:41:09.215');
INSERT INTO public."Course" VALUES ('cmkeb4i5d00a8e1rk88ijs8wo', 'ME520', 'Composite Materials', 3, 0, 2, 7, 4, 'MECHANICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.217', '2026-01-14 17:41:09.217');
INSERT INTO public."Course" VALUES ('cmkeb4i5f00aae1rky5qmsbf2', 'ME542', 'Modern Manufacturing Processes', 3, 0, 0, 6, 3, 'MECHANICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.219', '2026-01-14 17:41:09.219');
INSERT INTO public."Course" VALUES ('cmkeb4i5i00ace1rkl3uumfwi', 'ME576', 'Convective Heat Transfer', 3, 0, 0, 6, 3, 'MECHANICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.222', '2026-01-14 17:41:09.222');
INSERT INTO public."Course" VALUES ('cmkeb4i5l00aee1rkk57mzo4f', 'ME580', 'Computational Fluid Dynamics', 3, 0, 0, 6, 3, 'MECHANICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.225', '2026-01-14 17:41:09.225');
INSERT INTO public."Course" VALUES ('cmkeb4i5o00age1rk73hwb7i6', 'ME584', 'Fundamentals of compressible flows', 3, 0, 0, 6, 3, 'MECHANICAL ENGINEERING', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.228', '2026-01-14 17:41:09.228');
INSERT INTO public."Course" VALUES ('cmkeb4i6e00bae1rk3g7oqzv2', 'MM306', 'Corrosion And Its Prevention', 2, 2, 0, 10, 2, 'MME', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.254', '2026-01-14 17:41:09.254');
INSERT INTO public."Course" VALUES ('cmkeb4i6g00bce1rkc11uyfge', 'MM307', 'Electronic, Magnetic and Optical Materials', 3, 1, 0, 5, 3, 'MME', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.256', '2026-01-14 17:41:09.256');
INSERT INTO public."Course" VALUES ('cmkeb4i6h00bee1rkovy1f3jc', 'MM202', 'Transport Phenomena', 3, 1, 0, 5, 3, 'MME', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.257', '2026-01-14 17:41:09.257');
INSERT INTO public."Course" VALUES ('cmkeb4i6j00bge1rkksk116qp', 'MM309', 'Polymers and Composites', 2, 2, 0, 10, 2, 'MME', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.259', '2026-01-14 17:41:09.259');
INSERT INTO public."Course" VALUES ('cmkeb4i6l00bie1rkzuv15q60', 'MM310', 'Corrosion Lab', 0, 0, 2, 1, 1, 'MME', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.261', '2026-01-14 17:41:09.261');
INSERT INTO public."Course" VALUES ('cmkeb4i6p00bke1rk892lwkpf', 'MM322', 'Modeling of Metallurgical System Lab', 0, 0, 2, 1, 1, 'MME', 'PC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.265', '2026-01-14 17:41:09.265');
INSERT INTO public."Course" VALUES ('cmkeb4i1h006ce1rk1brl5lys', 'GE111', 'Introduction To Environmental Science And Engineering', 3, 1, 0, 5, 3, 'MME', 'SC', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.077', '2026-01-14 17:41:09.277');
INSERT INTO public."Course" VALUES ('cmkeb4i7h00bue1rk9axsh4bu', 'MM431', 'Machine Learning for Materials Science', 3, 1, 0, 5, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.293', '2026-01-14 17:41:09.293');
INSERT INTO public."Course" VALUES ('cmkeb4i7l00bwe1rkte6llf9c', 'MM532', 'Computational Fracture Mechanics', 3, 0, 0, 6, 3, 'MME', 'PE', 'UNDERGRADUATE', true, '2026-01-14 17:41:09.297', '2026-01-14 17:41:09.297');
INSERT INTO public."Course" VALUES ('cmkeb4hv1000ee1rksrdrdwxa', 'HS404', 'Introduction to Indian Urbanism', 3, 0, 0, 6, 3, 'MME', 'HC', 'UNDERGRADUATE', true, '2026-01-14 17:41:08.845', '2026-01-14 17:41:09.3');


--
-- Data for Name: CourseFeedback; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: CourseOffering; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CourseOffering" VALUES ('cmke2vgro000hocrki4u0f82t', 'cmke2vgrc000cocrkmz34pcmu', 'session_2025_ii', 'Computer Science and Engineering', 50, 50, 'ENROLLMENT_CLOSED', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvh000re1rkvhi4qyg4', 'cmkeb4hvf000qe1rkwhqpaw5p', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 5);
INSERT INTO public."CourseOffering" VALUES ('cmke2vgrh000focrk9yut6v4j', 'cmke2vgr9000bocrksikozzgx', 'session_2025_ii', 'Computer Science and Engineering', 60, 26, 'OPEN_FOR_ENROLLMENT', true, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4huj0003e1rkqr69etix', 'cmkeb4hue0002e1rkwdoc0n7m', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvt0013e1rk69qwj0e2', 'cmkeb4hvs0012e1rk3vmekrjv', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvw0015e1rkxaxbx5lv', 'cmkeb4hvv0014e1rkp5h5eztk', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvy0017e1rk1k6bukx6', 'cmkeb4hvx0016e1rk9trmi7zy', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hw00019e1rk3z3iu18r', 'cmkeb4hvz0018e1rko9pg0ary', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvj000te1rkgcum9m15', 'cmkeb4hvi000se1rk0a07pfam', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvl000ve1rkqq2k4x83', 'cmkeb4hvk000ue1rkm25g4we6', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvn000xe1rk8bmw5ue2', 'cmkeb4hvm000we1rkcg5ouyly', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hwa001he1rkbqyur5yj', 'cmkeb4hw8001ge1rk8zmke7jb', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hwc001je1rkax6ww3k8', 'cmkeb4hwb001ie1rk26rrngcw', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hwf001le1rkgc209jwf', 'cmkeb4hwd001ke1rkvdick06w', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hwh001ne1rkuscbbem8', 'cmkeb4hwg001me1rkp7dwxhwd', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hwj001pe1rkkubcdcwv', 'cmkeb4hwi001oe1rkayrjk5xi', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hwm001re1rk24kaxrqe', 'cmkeb4hwk001qe1rk3mqbo1e2', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hwo001te1rk0xcwezt7', 'cmkeb4hwm001se1rkkbogokwz', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hz90049e1rkxohfnlwv', 'cmkeb4hz80048e1rkdiglwh9f', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvc000ne1rkl4gqx7eh', 'cmkeb4hvb000me1rkuom2mxh9', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzd004be1rkvskx9oyv', 'cmkeb4hza004ae1rk4kk8kavi', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzf004de1rkazcir0no', 'cmkeb4hzd004ce1rk0snstfgx', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4huq0005e1rkzqnroxqz', 'cmkeb4hun0004e1rkhfxqlwvp', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hus0007e1rk6ek0whpi', 'cmkeb4hur0006e1rkz8668xui', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzm004je1rkmrxhbidy', 'cmkeb4hzk004ie1rkgie67zyb', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzo004le1rkq4cg46gp', 'cmkeb4hzm004ke1rkzrlsc4u1', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzq004ne1rkdfw5pe24', 'cmkeb4hzo004me1rkapp6kpkt', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzs004pe1rknk2dbty1', 'cmkeb4hzq004oe1rkgt4ghsa7', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzt004re1rk8o30rczo', 'cmkeb4hzs004qe1rkuwghhtlk', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hxi002le1rkkjql7su0', 'cmkeb4hxg002ke1rkg8r1jdm8', 'session_2025_ii', 'CHEMICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hxk002ne1rk9adger6v', 'cmkeb4hxj002me1rk75b5n6cj', 'session_2025_ii', 'CHEMICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hxm002pe1rk761u96a6', 'cmkeb4hxl002oe1rk8rmm1wpr', 'session_2025_ii', 'CHEMICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hxo002re1rk57onwkq7', 'cmkeb4hxn002qe1rk5g4rkd10', 'session_2025_ii', 'CHEMICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hve000pe1rkzcssmkii', 'cmkeb4hvd000oe1rkmxx20hec', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzv004te1rkark4sysj', 'cmkeb4hzu004se1rkrnm5v802', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hxg002je1rkzka61qkt', 'cmkeb4hxf002ie1rkfe203pce', 'session_2025_ii', 'CIVIL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hxy002ze1rkpc3kxuao', 'cmkeb4hxw002ye1rk7y54j4p1', 'session_2025_ii', 'CHEMICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hxz0031e1rk4w7ufb2r', 'cmkeb4hxy0030e1rkhhig35qh', 'session_2025_ii', 'CHEMICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hy20033e1rkwp3zccpw', 'cmkeb4hy00032e1rk3drm4maj', 'session_2025_ii', 'CHEMICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hy40035e1rktnrv992o', 'cmkeb4hy30034e1rkjjgdat8s', 'session_2025_ii', 'CHEMICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvr0011e1rkutmj3w6x', 'cmkeb4hvq0010e1rkeqkrxwuu', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hv7000je1rkms4zis7p', 'cmkeb4hv5000ie1rkoevzpmhm', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmke2vgrs000jocrkfeog5f14', 'cmke2vgre000docrk2w1yx9jg', 'session_2025_ii', 'Computer Science and Engineering', 55, 11, 'OPEN_FOR_ENROLLMENT', true, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hux000be1rkfkvsdf9s', 'cmkeb4huw000ae1rk3pi6pesi', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hv0000de1rkhfbcnptx', 'cmkeb4huy000ce1rk7z7ofy0o', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hv2000fe1rkj4vbjabn', 'cmkeb4hv1000ee1rksrdrdwxa', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hvp000ze1rkd02ykzl1', 'cmkeb4hvo000ye1rkf381z2hv', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4huv0009e1rkn5dcj3ko', 'cmkeb4hut0008e1rkljfzniol', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hva000le1rk129a3a79', 'cmkeb4hv8000ke1rkr4njexin', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hyw003xe1rkwkk68ujj', 'cmkeb4hyv003we1rkefuvtdh8', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hyy003ze1rkdkbs53uz', 'cmkeb4hyx003ye1rk7dh6fzkx', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hz00041e1rke3eem018', 'cmkeb4hyz0040e1rkviz9rbdb', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hv4000he1rk937ddb7z', 'cmkeb4hv3000ge1rk71sabwqg', 'session_2025_ii', 'AI', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzx004ve1rk1qsfpnzp', 'cmkeb4hzw004ue1rklr3618ry', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4hzz004xe1rky9u5nqvc', 'cmkeb4hzy004we1rk82p7jbx1', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i02004ze1rkw97ffkqz', 'cmkeb4i00004ye1rkwcelmkrt', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i040051e1rkpavmqos8', 'cmkeb4i020050e1rk0lomcl50', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i060053e1rk1102jitk', 'cmkeb4i050052e1rkdemcn2ms', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i090055e1rk3oezczud', 'cmkeb4i080054e1rkr4k925mg', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i0b0057e1rkbgo1j6ki', 'cmkeb4i0a0056e1rkvssbf892', 'session_2025_ii', 'COMPUTER SCIENCE AND ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i12005xe1rkcgjpf62n', 'cmkeb4i11005we1rkfbnxgdu3', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i14005ze1rkzrtvh3j0', 'cmkeb4i13005ye1rkxodiropp', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i160061e1rkk6awygr0', 'cmkeb4i150060e1rkgd5epake', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i180063e1rk5ohoojyu', 'cmkeb4i170062e1rkxwqufve1', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i1a0065e1rkks5qeuag', 'cmkeb4i190064e1rkz085ue6p', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i1k006fe1rkgj6s1dt1', 'cmkeb4i1j006ee1rkw2v0mzsi', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i1m006he1rkkgpl4xff', 'cmkeb4i1l006ge1rk2q4c8y6i', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i1o006je1rkbt8x70jo', 'cmkeb4i1n006ie1rk059q0wrk', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i1q006le1rkdvcr0sol', 'cmkeb4i1p006ke1rkzbbdrl3h', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i2i007de1rkeabo6q5e', 'cmkeb4i2g007ce1rkzu8gdf14', 'session_2025_ii', 'ENGINEERING PHYSICS', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i2k007fe1rk7v5t0zyx', 'cmkeb4i2i007ee1rkdrt5of0i', 'session_2025_ii', 'ENGINEERING PHYSICS', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i2m007he1rknekt1q40', 'cmkeb4i2l007ge1rkpyx4dr2k', 'session_2025_ii', 'ENGINEERING PHYSICS', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i2o007je1rk1zffgd8o', 'cmkeb4i2n007ie1rkvpvicocx', 'session_2025_ii', 'ENGINEERING PHYSICS', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i3p008le1rk5b9ssj3g', 'cmkeb4i3o008ke1rkkk6051mk', 'session_2025_ii', 'MCB', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i3r008ne1rkmlo6ux9i', 'cmkeb4i3q008me1rka0pzidj5', 'session_2025_ii', 'MCB', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i4o009le1rkteuz6ol1', 'cmkeb4i4n009ke1rk0oxvsooh', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i4q009ne1rk5im311b2', 'cmkeb4i4p009me1rkqw56hihn', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i4s009pe1rk3ces4tjk', 'cmkeb4i4r009oe1rkr0kqagk3', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i4u009re1rknprddli9', 'cmkeb4i4t009qe1rk23gpk25r', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i4w009te1rkd6dn65id', 'cmkeb4i4v009se1rknp7z8cro', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i5600a3e1rkd6wtia21', 'cmkeb4i5400a2e1rkx88schw7', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i5b00a5e1rkffergld0', 'cmkeb4i5600a4e1rkp3gqblul', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i5d00a7e1rkl5229wqo', 'cmkeb4i5b00a6e1rkzrx6z68n', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i5e00a9e1rkj0r1r7ps', 'cmkeb4i5d00a8e1rk88ijs8wo', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i5h00abe1rklknoxqpj', 'cmkeb4i5f00aae1rky5qmsbf2', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i5k00ade1rkxcrjqghu', 'cmkeb4i5i00ace1rkl3uumfwi', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i5n00afe1rkplmqr14p', 'cmkeb4i5l00aee1rkk57mzo4f', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i5p00ahe1rklqly3fjr', 'cmkeb4i5o00age1rk73hwb7i6', 'session_2025_ii', 'MECHANICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i41008xe1rky8keecc8', 'cmkeb4i40008we1rkg8fwz078', 'session_2025_ii', 'MCB', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i6f00bbe1rkt8sichs7', 'cmkeb4i6e00bae1rk3g7oqzv2', 'session_2025_ii', 'MME', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i6h00bde1rkwajmxsyt', 'cmkeb4i6g00bce1rkc11uyfge', 'session_2025_ii', 'MME', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i6i00bfe1rkqz98z09u', 'cmkeb4i6h00bee1rkovy1f3jc', 'session_2025_ii', 'MME', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i6k00bhe1rkc6yqaocn', 'cmkeb4i6j00bge1rkksk116qp', 'session_2025_ii', 'MME', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i6m00bje1rk4r0oonbm', 'cmkeb4i6l00bie1rkzuv15q60', 'session_2025_ii', 'MME', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i6u00ble1rki6ihq863', 'cmkeb4i6p00bke1rk892lwkpf', 'session_2025_ii', 'MME', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i1i006de1rk3m4z77jo', 'cmkeb4i1h006ce1rk1brl5lys', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i1g006be1rkcior7ate', 'cmkeb4i1f006ae1rkmfj0jlw9', 'session_2025_ii', 'ELECTRICAL ENGINEERING', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i7k00bve1rkvpx84bcl', 'cmkeb4i7h00bue1rk9axsh4bu', 'session_2025_ii', 'MME', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);
INSERT INTO public."CourseOffering" VALUES ('cmkeb4i7n00bxe1rk78wbhifc', 'cmkeb4i7l00bwe1rkte6llf9c', 'session_2025_ii', 'MME', 100, 0, 'OPEN_FOR_ENROLLMENT', false, 0);


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Enrollment" VALUES ('cmke3jwmr0000gjrkr22jvjxm', 'cmke2vgqv0005ocrkdlcho83p', 'cmke2vgrh000focrk9yut6v4j', 'CREDIT', 'ENROLLED', 'PC', NULL, NULL, false, NULL, '2026-01-14 14:09:10.899', NULL);
INSERT INTO public."Enrollment" VALUES ('cmkec6pgs0000u4rkk0i915d9', 'cmke2vgqv0005ocrkdlcho83p', 'cmkeb4huq0005e1rkzqnroxqz', 'CREDIT', 'PENDING', 'PC', NULL, NULL, false, NULL, '2026-01-14 18:10:51.628', NULL);
INSERT INTO public."Enrollment" VALUES ('cmkec7ejq0001u4rk4028jico', 'cmke2vgqv0005ocrkdlcho83p', 'cmke2vgrs000jocrkfeog5f14', 'CREDIT', 'ENROLLED', 'PC', NULL, NULL, false, NULL, '2026-01-14 18:11:24.134', NULL);


--
-- Data for Name: Faculty; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Faculty" VALUES ('cmke2vgr10007ocrkozrfvmfn', 'cmke2vgqp0003ocrk2gura1xn', 'Computer Science and Engineering', 'ASSISTANT_PROFESSOR', 'Networks, Systems', NULL);
INSERT INTO public."Faculty" VALUES ('cmke2vgr30008ocrkf1zhiwg4', 'cmke2vgqr0004ocrkelkxtjdz', 'Computer Science and Engineering', 'ASSOCIATE_PROFESSOR', 'Social Networks, Algorithms', NULL);


--
-- Data for Name: FeedbackCycle; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FeedbackCycle" VALUES ('cmke2vgs0000oocrkbv0a9ijm', 'Mid-Sem Feedback 2025-II', 'MID_SEM', 'session_2025_ii', '2026-02-01 00:00:00', '2026-02-15 00:00:00', true, 'cmke2vgqf0000ocrkd7067wvh', '2026-01-14 13:50:10.607');


--
-- Data for Name: FeedbackQuestion; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FeedbackQuestion" VALUES ('cmke2vgs1000pocrky0pv5g65', 'cmke2vgs0000oocrkbv0a9ijm', 1, 'How effective was the instructor in delivering the course content?', 'RATING', NULL, true, true);
INSERT INTO public."FeedbackQuestion" VALUES ('cmke2vgs1000qocrkx47i9pbk', 'cmke2vgs0000oocrkbv0a9ijm', 2, 'Rate the quality of course materials/resources provided.', 'LIKERT_5', NULL, true, true);
INSERT INTO public."FeedbackQuestion" VALUES ('cmke2vgs1000rocrkivkpe56c', 'cmke2vgs0000oocrkbv0a9ijm', 3, 'Any suggestions for improvement?', 'TEXT', NULL, false, true);


--
-- Data for Name: FeedbackResponse; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: OfferingInstructor; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."OfferingInstructor" VALUES ('cmke2vgrk000gocrkpyo97pio', 'cmke2vgrh000focrk9yut6v4j', 'cmke2vgr10007ocrkozrfvmfn', true);
INSERT INTO public."OfferingInstructor" VALUES ('cmke2vgrq000iocrknx8gjm1m', 'cmke2vgro000hocrki4u0f82t', 'cmke2vgr30008ocrkf1zhiwg4', true);
INSERT INTO public."OfferingInstructor" VALUES ('cmke2vgru000kocrk453u83h4', 'cmke2vgrs000jocrkfeog5f14', 'cmke2vgr10007ocrkozrfvmfn', true);


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Payment" VALUES ('cmkecnsaa0000qorklejfhshb', 5, 'INR', 'PENDING', 'order_test_1768415048432', NULL, NULL, 'cmke2vgqv0005ocrkdlcho83p', 'cmkeb4hvh000re1rkvhi4qyg4', '2026-01-14 18:24:08.434', '2026-01-14 18:24:08.434');
INSERT INTO public."Payment" VALUES ('cmkecqyyd0000xxrkjo68bu0v', 5, 'INR', 'PENDING', 'order_S3rCQnQddTJPJC', NULL, NULL, 'cmke2vgqv0005ocrkdlcho83p', 'cmkeb4hvh000re1rkvhi4qyg4', '2026-01-14 18:26:37.045', '2026-01-14 18:26:37.045');


--
-- Data for Name: SemesterRecord; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: SimpleFeedback; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SimpleFeedback" VALUES ('cmke80cwh0000vgrkmhchoolf', 'cmke2vgrh000focrk9yut6v4j', 'cmke2vgqv0005ocrkdlcho83p', 'BAD COURSE', '2026-01-14 16:13:56.945');


--
-- Data for Name: SlotCourse; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Student" VALUES ('cmke2vgqv0005ocrkdlcho83p', 'cmke2vgql0001ocrkwbk136au', 'Computer Science and Engineering', 2023, 'BTECH', 'Computer Science', 'GENERAL', NULL, NULL, 'REGISTERED', NULL, 8.5, 0, 45, 45);
INSERT INTO public."Student" VALUES ('cmke2vgqz0006ocrk84wzyvci', 'cmke2vgqn0002ocrkkec0hjim', 'Electrical Engineering', 2023, 'BTECH', 'Electrical Engineering', 'OBC_NCL', NULL, NULL, 'REGISTERED', NULL, 8.2, 0, 42, 42);


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('cmke2vgqf0000ocrkd7067wvh', 'admin@iitrpr.ac.in', '$2b$10$9d8SwwbV4gxf.p5EN7grE.HtPLjprylTe9EBY8zvzu0hoCpmiYdLm', 'ADMIN001', 'Admin', 'User', NULL, 'ADMIN', true, '2026-01-14 13:50:10.536', '2026-01-14 13:50:10.536');
INSERT INTO public."User" VALUES ('cmke2vgql0001ocrkwbk136au', '2023csb1122@iitrpr.ac.in', '$2b$10$9d8SwwbV4gxf.p5EN7grE.HtPLjprylTe9EBY8zvzu0hoCpmiYdLm', '2023CSB1122', 'Harsh', 'Kumar', NULL, 'STUDENT', true, '2026-01-14 13:50:10.557', '2026-01-14 13:50:10.557');
INSERT INTO public."User" VALUES ('cmke2vgqn0002ocrkkec0hjim', '2023eeb1133@iitrpr.ac.in', '$2b$10$9d8SwwbV4gxf.p5EN7grE.HtPLjprylTe9EBY8zvzu0hoCpmiYdLm', '2023EEB1133', 'Rohan', 'Sharma', NULL, 'STUDENT', true, '2026-01-14 13:50:10.559', '2026-01-14 13:50:10.559');
INSERT INTO public."User" VALUES ('cmke2vgqp0003ocrk2gura1xn', 'satyam@iitrpr.ac.in', '$2b$10$9d8SwwbV4gxf.p5EN7grE.HtPLjprylTe9EBY8zvzu0hoCpmiYdLm', 'FAC001', 'Satyam', 'Agarwal', NULL, 'FACULTY', true, '2026-01-14 13:50:10.561', '2026-01-14 13:50:10.561');
INSERT INTO public."User" VALUES ('cmke2vgqr0004ocrkelkxtjdz', 'sudarshan@iitrpr.ac.in', '$2b$10$9d8SwwbV4gxf.p5EN7grE.HtPLjprylTe9EBY8zvzu0hoCpmiYdLm', 'FAC002', 'Sudarshan', 'Iyengar', NULL, 'FACULTY', true, '2026-01-14 13:50:10.563', '2026-01-14 13:50:10.563');


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _Prerequisites; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: AcademicDate AcademicDate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AcademicDate"
    ADD CONSTRAINT "AcademicDate_pkey" PRIMARY KEY (id);


--
-- Name: AcademicDocument AcademicDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AcademicDocument"
    ADD CONSTRAINT "AcademicDocument_pkey" PRIMARY KEY (id);


--
-- Name: AcademicSession AcademicSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AcademicSession"
    ADD CONSTRAINT "AcademicSession_pkey" PRIMARY KEY (id);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: ClassSchedule ClassSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ClassSchedule"
    ADD CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY (id);


--
-- Name: CourseFeedback CourseFeedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseFeedback"
    ADD CONSTRAINT "CourseFeedback_pkey" PRIMARY KEY (id);


--
-- Name: CourseOffering CourseOffering_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseOffering"
    ADD CONSTRAINT "CourseOffering_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: Enrollment Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY (id);


--
-- Name: Faculty Faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Faculty"
    ADD CONSTRAINT "Faculty_pkey" PRIMARY KEY (id);


--
-- Name: FeedbackCycle FeedbackCycle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeedbackCycle"
    ADD CONSTRAINT "FeedbackCycle_pkey" PRIMARY KEY (id);


--
-- Name: FeedbackQuestion FeedbackQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeedbackQuestion"
    ADD CONSTRAINT "FeedbackQuestion_pkey" PRIMARY KEY (id);


--
-- Name: FeedbackResponse FeedbackResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeedbackResponse"
    ADD CONSTRAINT "FeedbackResponse_pkey" PRIMARY KEY (id);


--
-- Name: OfferingInstructor OfferingInstructor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OfferingInstructor"
    ADD CONSTRAINT "OfferingInstructor_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: SemesterRecord SemesterRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SemesterRecord"
    ADD CONSTRAINT "SemesterRecord_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SimpleFeedback SimpleFeedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SimpleFeedback"
    ADD CONSTRAINT "SimpleFeedback_pkey" PRIMARY KEY (id);


--
-- Name: SlotCourse SlotCourse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlotCourse"
    ADD CONSTRAINT "SlotCourse_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _Prerequisites _Prerequisites_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_Prerequisites"
    ADD CONSTRAINT "_Prerequisites_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: AcademicDate_sessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AcademicDate_sessionId_idx" ON public."AcademicDate" USING btree ("sessionId");


--
-- Name: AcademicSession_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AcademicSession_name_key" ON public."AcademicSession" USING btree (name);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Admin_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_userId_key" ON public."Admin" USING btree ("userId");


--
-- Name: CourseFeedback_cycleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CourseFeedback_cycleId_idx" ON public."CourseFeedback" USING btree ("cycleId");


--
-- Name: CourseFeedback_cycleId_studentId_courseOfferingId_instructo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CourseFeedback_cycleId_studentId_courseOfferingId_instructo_key" ON public."CourseFeedback" USING btree ("cycleId", "studentId", "courseOfferingId", "instructorId");


--
-- Name: CourseFeedback_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CourseFeedback_studentId_idx" ON public."CourseFeedback" USING btree ("studentId");


--
-- Name: CourseOffering_courseId_sessionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CourseOffering_courseId_sessionId_key" ON public."CourseOffering" USING btree ("courseId", "sessionId");


--
-- Name: CourseOffering_sessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CourseOffering_sessionId_idx" ON public."CourseOffering" USING btree ("sessionId");


--
-- Name: Course_courseCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Course_courseCode_key" ON public."Course" USING btree ("courseCode");


--
-- Name: Enrollment_courseOfferingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Enrollment_courseOfferingId_idx" ON public."Enrollment" USING btree ("courseOfferingId");


--
-- Name: Enrollment_studentId_courseOfferingId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Enrollment_studentId_courseOfferingId_key" ON public."Enrollment" USING btree ("studentId", "courseOfferingId");


--
-- Name: Enrollment_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Enrollment_studentId_idx" ON public."Enrollment" USING btree ("studentId");


--
-- Name: Faculty_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Faculty_userId_idx" ON public."Faculty" USING btree ("userId");


--
-- Name: Faculty_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Faculty_userId_key" ON public."Faculty" USING btree ("userId");


--
-- Name: FeedbackCycle_sessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeedbackCycle_sessionId_idx" ON public."FeedbackCycle" USING btree ("sessionId");


--
-- Name: FeedbackResponse_feedbackId_questionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FeedbackResponse_feedbackId_questionId_key" ON public."FeedbackResponse" USING btree ("feedbackId", "questionId");


--
-- Name: OfferingInstructor_facultyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OfferingInstructor_facultyId_idx" ON public."OfferingInstructor" USING btree ("facultyId");


--
-- Name: OfferingInstructor_offeringId_facultyId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OfferingInstructor_offeringId_facultyId_key" ON public."OfferingInstructor" USING btree ("offeringId", "facultyId");


--
-- Name: OfferingInstructor_offeringId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OfferingInstructor_offeringId_idx" ON public."OfferingInstructor" USING btree ("offeringId");


--
-- Name: Payment_razorpayOrderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON public."Payment" USING btree ("razorpayOrderId");


--
-- Name: Payment_razorpayPaymentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON public."Payment" USING btree ("razorpayPaymentId");


--
-- Name: SemesterRecord_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SemesterRecord_studentId_idx" ON public."SemesterRecord" USING btree ("studentId");


--
-- Name: SemesterRecord_studentId_sessionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SemesterRecord_studentId_sessionId_key" ON public."SemesterRecord" USING btree ("studentId", "sessionId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: SimpleFeedback_courseOfferingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SimpleFeedback_courseOfferingId_idx" ON public."SimpleFeedback" USING btree ("courseOfferingId");


--
-- Name: SimpleFeedback_courseOfferingId_studentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SimpleFeedback_courseOfferingId_studentId_key" ON public."SimpleFeedback" USING btree ("courseOfferingId", "studentId");


--
-- Name: SimpleFeedback_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SimpleFeedback_studentId_idx" ON public."SimpleFeedback" USING btree ("studentId");


--
-- Name: SlotCourse_courseId_sessionId_slot_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SlotCourse_courseId_sessionId_slot_key" ON public."SlotCourse" USING btree ("courseId", "sessionId", slot);


--
-- Name: Student_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_userId_idx" ON public."Student" USING btree ("userId");


--
-- Name: Student_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Student_userId_key" ON public."Student" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_rollNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_rollNumber_key" ON public."User" USING btree ("rollNumber");


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: _Prerequisites_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_Prerequisites_B_index" ON public."_Prerequisites" USING btree ("B");


--
-- Name: AcademicDate AcademicDate_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AcademicDate"
    ADD CONSTRAINT "AcademicDate_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."AcademicSession"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Admin Admin_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClassSchedule ClassSchedule_offeringId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ClassSchedule"
    ADD CONSTRAINT "ClassSchedule_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES public."CourseOffering"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseFeedback CourseFeedback_courseOfferingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseFeedback"
    ADD CONSTRAINT "CourseFeedback_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES public."CourseOffering"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseFeedback CourseFeedback_cycleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseFeedback"
    ADD CONSTRAINT "CourseFeedback_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES public."FeedbackCycle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseFeedback CourseFeedback_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseFeedback"
    ADD CONSTRAINT "CourseFeedback_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."Faculty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseFeedback CourseFeedback_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseFeedback"
    ADD CONSTRAINT "CourseFeedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseOffering CourseOffering_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseOffering"
    ADD CONSTRAINT "CourseOffering_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseOffering CourseOffering_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseOffering"
    ADD CONSTRAINT "CourseOffering_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."AcademicSession"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Document Document_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Enrollment Enrollment_courseOfferingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES public."CourseOffering"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Enrollment Enrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Faculty Faculty_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Faculty"
    ADD CONSTRAINT "Faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FeedbackCycle FeedbackCycle_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeedbackCycle"
    ADD CONSTRAINT "FeedbackCycle_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."AcademicSession"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FeedbackQuestion FeedbackQuestion_cycleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeedbackQuestion"
    ADD CONSTRAINT "FeedbackQuestion_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES public."FeedbackCycle"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FeedbackResponse FeedbackResponse_feedbackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeedbackResponse"
    ADD CONSTRAINT "FeedbackResponse_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES public."CourseFeedback"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FeedbackResponse FeedbackResponse_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeedbackResponse"
    ADD CONSTRAINT "FeedbackResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."FeedbackQuestion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OfferingInstructor OfferingInstructor_facultyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OfferingInstructor"
    ADD CONSTRAINT "OfferingInstructor_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES public."Faculty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OfferingInstructor OfferingInstructor_offeringId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OfferingInstructor"
    ADD CONSTRAINT "OfferingInstructor_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES public."CourseOffering"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_courseOfferingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES public."CourseOffering"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SemesterRecord SemesterRecord_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SemesterRecord"
    ADD CONSTRAINT "SemesterRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."AcademicSession"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SemesterRecord SemesterRecord_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SemesterRecord"
    ADD CONSTRAINT "SemesterRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SimpleFeedback SimpleFeedback_courseOfferingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SimpleFeedback"
    ADD CONSTRAINT "SimpleFeedback_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES public."CourseOffering"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SimpleFeedback SimpleFeedback_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SimpleFeedback"
    ADD CONSTRAINT "SimpleFeedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SlotCourse SlotCourse_coordinatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlotCourse"
    ADD CONSTRAINT "SlotCourse_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES public."Faculty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SlotCourse SlotCourse_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlotCourse"
    ADD CONSTRAINT "SlotCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SlotCourse SlotCourse_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlotCourse"
    ADD CONSTRAINT "SlotCourse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."AcademicSession"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _Prerequisites _Prerequisites_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_Prerequisites"
    ADD CONSTRAINT "_Prerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _Prerequisites _Prerequisites_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_Prerequisites"
    ADD CONSTRAINT "_Prerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict g6AvrMEdSLHYsnw5KWYEHD27xN1878mazJ1uvNcCxK47PibVTCb1bb0OG9uA32m

