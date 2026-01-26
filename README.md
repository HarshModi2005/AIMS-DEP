# AIMS Portal (Academic Information Management System)

AIMS Portal is a robust, enterprise-grade academic management system engineered for educational institutions to digitize and streamline their entire academic workflow. It serves as a centralized platform for Students, Faculty, Advisors, and Administrators, facilitating everything from course registration and grading to fee management and feedback collection.

This system is designed with specific focus on Indian Institute of Technology (IIT) academic structures but is flexible enough for other higher education institutions.

## 🚀 Key Features

### 👤 User Roles & Authentication
The system uses **NextAuth.js v5** for secure authentication with role-based access control (RBAC).
*   **Google OAuth Integration**: Specialized login for `iitrpr.ac.in` domain users.
*   **Smart Profile Creation**: Automatically parses Student Roll Numbers (e.g., `2023csb1088`) from emails to determine Department, Year of Entry, and Degree Type.
*   **Roles**:
    *   **Student**: Access to personal dashboard, courses, and fees.
    *   **Faculty**: Course floating, grading, and feedback review.
    *   **Faculty Advisor**: Approval authority for student enrollments.
    *   **Admin**: System-wide configuration and oversight.

### 🎓 Student Module
*   **Academic Dashboard**: Real-time view of current SGPA, CGPA, registered credits, and course schedule.
*   **Course Registration**:
    *   Browse available courses for the current session.
    *   **Enrollment Types**: Credit, Audit, Additional, Improvement, Minor, Specialization.
    *   **Validation**: Checks for slot clashes, pre-requisites (roadmap), and credit limits.
*   **Fee Management**:
    *   Integrated **Razorpay** payment gateway.
    *   Pay Semester Fees and specific Course Fees.
    *   View payment history and status.
*   **Feedback**:
    *   Anonymous Mid-sem and End-sem feedback submission for courses.
    *   Confidential feedback handling to protect student identity.
*   **Documents**: Repository for generated transcripts, bonafide certificates, etc.

### 👨‍🏫 Faculty Module
*   **Course Floating Workflow**:
    *   Faculty proposes a course -> Enters `PENDING_APPROVAL` status -> Admin Approves -> Available for Enrollment.
*   **Class Management**:
    *   View detailed class list (Student details, Photos).
    *   Manage attendance (Optional module).
*   **Grading System**:
    *   Interface to upload/enter grades.
    *   Automatic calculation of SGPA/CGPA contributions (backend logic).
    *   Grades: A, A-, B, B-, C, C-, D, E, F, S, X (Standard Scale).
*   **Feedback Review**: View aggregated feedback reports for self-improvement.

### 🛡️ Administrative Control
*   **Session Management**:
    *   Define Academic Sessions (e.g., "2024-25 Semester I").
    *   Logic for ODD/EVEN/SUMMER semesters dependent on current date.
*   **Academic Calendar**: Set critical dates (Add/Drop deadline, Exam dates) which trigger system-wide state changes.
*   **Approvals**: Centralized dashboard to approve Course floats, Student leave requests, etc.
*   **Audit Logs**: Comprehensive tracking of all critical actions (grade changes, fee updates) for accountability.

---

## 🔄 Workflows & Command Flow

This section details the step-by-step logic for critical system workflows, illustrating how different stakeholders interact to achieve an outcome.

### 1. Course Floating & Approval Flow
*Objective: Make a new course available for students to register.*

1.  **Faculty Action (Initiation)**:
    *   Faculty goes to `Float Course` page.
    *   Selects an existing course from Catalog (e.g., "CS301") OR Creates a new Course Entity.
    *   Defines parameters: `MaxStrength` (Capacity).
    *   **Submit**: System creates a `CourseOffering` record anchored to the current `AcademicSession`.
    *   **State**: `PENDING_APPROVAL`.
2.  **Admin Action (Review)**:
    *   Admin receives notification/sees item in `Pending Approvals` dashboard.
    *   Admin reviews course details (Credits, Syllabus link).
    *   **Approve**: Admin clicks Approve.
    *   **State Transition**: `PENDING_APPROVAL` -> `OPEN_FOR_ENROLLMENT`.
3.  **Outcome**: Course now appears in the Student's "Course Registration" list.

### 2. Student Course Registration Flow
*Objective: Student signs up for a course.*

1.  **Student Action**:
    *   Navigates to `Course Registration`.
    *   Views list of courses with status `OPEN_FOR_ENROLLMENT`.
    *   Clicks **Register** on a course (e.g., "Distributed Systems").
2.  **System Validation (The Gatekeeper)**:
    *   **Credit Check**: Checks if (Current Registered Credits + New Course Credits) > 24. If yes, Block.
    *   **Fee Check**: Checks if "Semester Fee" for current session is `PAID`. If no, Block.
    *   **Slot Check**: Checks for timestamp clashes with already registered courses.
    *   **Duplicate Check**: Checks if already enrolled.
3.  **State Transition**:
    *   If basic checks pass, an `Enrollment` record is created.
    *   **Initial State**: `PENDING`.
4.  **Faculty/Advisor Action (Confirmation)**:
    *   Faculty views list of `PENDING` students in their dashboard.
    *   **Approve**: Enrollment status becomes `ENROLLED`.
    *   *Variant*: For specific cases (e.g., Overload), it might route to `PENDING_ADVISOR` for Faculty Advisor approval.

### 3. Grading & Results Flow
*Objective: Assign grades and calculate SGPA.*

1.  **Prerequisite**: `AcademicCalendar` must have an active `GRADES_SUBMISSION` window.
2.  **Faculty Action**:
    *   Opens `Grades` tab for a specific course.
    *   Enters grades (A, B, C...) manually or uploads CSV.
    *   **Submit**: System verifies window is open.
3.  **System Action**:
    *   Updates `Enrollment` record with Grade.
    *   Triggers background calculation for Student's `SemesterRecord` (SGPA) and `Student` profile (CGPA).
4.  **Student View**:
    *   Student sees grade on Dashboard immediately (or after result declaration date, depending on config).

---

## 🔌 API Routes

The project uses Next.js App Router API routes (`src/app/api/...`) to handle backend logic. All routes are protected and enforce RBAC.

### 🛡️ Admin Routes (`/api/admin/*`)
*   **`GET /api/admin/approvals`**: Fetches all course offerings with status `PENDING_APPROVAL`.
*   **`GET /api/admin/courses`**: Lists entire course catalog with filters (search, department).
*   **`POST /api/admin/courses`**: Creates a new course entity (not an offering).
*   **`GET /api/admin/users`**: Lists all users with pagination and role filtering.
*   **`POST /api/admin/users`**: Manually creates a user account.
*   **`POST /api/admin/courses/approve`**: Approves a floated course offering.

### 👨‍🏫 Faculty Routes (`/api/faculty/*`)
*   **`POST /api/faculty/offerings`**: "Floats" a course for the current session. Checks if course exists and if faculty is authorized.
*   **`PUT /api/faculty/grades`**: Bulk updates grades for students in a specific course offering.
    *   **Validation**: Checks if "Grade Submission" window is open in Academic Calendar.
    *   **Logic**: Updates `Enrollment` records transactionally.
*   **`GET /api/faculty/enrollments`**: Fetches list of students enrolled in faculty's course for attendance/grading.

### 🎓 Student Routes (`/api/student/*`)
*   **`GET /api/student/feedback`**: Returns list of courses where feedback is currently mandatory or open.
*   **`POST /api/student/feedback`**: Submits anonymous feedback. Prevents double submission.
*   **`GET /api/student/record`**: Fetches complete academic history (SGPA/CGPA per semester).

### 💳 Common & Payments
*   **`POST /api/payments/create-order`**: Initialises a Razorpay order.
    *   **Payload**: `{ courseOfferingId, sessionId }` (Determines if it's a Course Fee or Semester Fee).
    *   **Logic**: Calculates amount dynamically from DB and creates order on Razorpay.
*   **`POST /api/payments/verify`**: Webhook or callback to verify payment signature and update `Payment` status to `SUCCESS`.

---

## 🛠️ Technical Architecture

### Tech Stack
*   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
*   **Backend Details**:
    *   **Server Actions**: Leveraging Next.js Server Actions for type-safe backend logic without separate API routes.
    *   **Validation**: `Zod` schemas for rigorous input validation on both client and server.
*   **Database**: PostgreSQL (Relational Data Model).
*   **ORM**: Prisma (Schema-first design).
*   **Authentication**: NextAuth.js (JWT strategy).
*   **File Handling**: `pdf-lib` for generating PDF reports, `xlsx` for Excel grade uploads.

### Database Schema Highlights
The database is normalized and centers around the `AcademicSession` and `Student` entities.
*   **Composite Keys**: Used heavily (e.g., `[studentId, courseOfferingId]`) to ensure data integrity.
*   **Enums**: Strict typing for `Role`, `CourseCategory` (SC, PC, PE...), and `EnrollmentStatus`.
*   **Relations**:
    *   `Course` vs `CourseOffering`: A `Course` is a catalog entry (CS101), while a `CourseOffering` is a specific instance in a Session (CS101 in Sem 1 2024).

---

## 🔧 Setup & Installation

### Prerequisites
*   Node.js v18.17+
*   PostgreSQL Database
*   Google Cloud Console Project (for OAuth)
*   Razorpay Account (Test mode key)

### Step-by-Step Guide

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd aims-portal
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file at the root:
    ```env
    # Database Connection
    DATABASE_URL="postgresql://postgres:password@localhost:5432/aims_db"

    # NextAuth Configuration
    AUTH_SECRET="<generate-random-string>" # Run `npx auth secret`
    AUTH_URL="http://localhost:3000"

    # Google OAuth (Optional for local dev if using Credentials)
    GOOGLE_CLIENT_ID="<your-client-id>"
    GOOGLE_CLIENT_SECRET="<your-client-secret>"

    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID="rzp_test_..."
    RAZORPAY_KEY_SECRET="<your-secret>"
    ```

4.  **Database Migration & Seeding**
    Initialize the database schema and populate it with dummy data for testing.
    ```bash
    # Push schema to database
    npx prisma db push

    # Seed initial data (Admin user, Departments, Sample courses)
    npm run db:seed
    ```
    *Note: The seed script (`prisma/seed.ts`) validates your database connection before running.*

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the portal at `http://localhost:3000`.

---

## 📂 detailed Folder Structure

```
aims-portal/
├── prisma/
│   ├── schema.prisma        # The single source of truth for data models
│   └── seed.ts              # Script to populate DB with initial Department/Admin data
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Login/Register pages (Public)
│   │   ├── (dashboard)/     # Protected Routes (User must be logged in)
│   │   │   ├── admin/       # /admin/* (Administrative controls)
│   │   │   ├── faculty/     # /faculty/* (Course management)
│   │   │   ├── student/     # /student/* (Enrolments, Fees)
│   │   │   └── advisor/     # /advisor/* (Approvals)
│   │   ├── api/             # API Routes (Webhooks, internal APIs)
│   │   └── layout.tsx       # Root layout with Providers (Session, Theme)
│   ├── components/
│   │   ├── ui/              # Shadcn UI reusable primitives (Button, Card, Input)
│   │   ├── layout/          # Sidebar, Navbar, PageShell
│   │   └── forms/           # Complex form components
│   ├── lib/
│   │   ├── auth.ts          # NextAuth configuration & callbacks
│   │   ├── db.ts            # Global Prisma Client instance
│   │   ├── utils.ts         # Formatting helpers (Date, Currency, Grade)
│   │   └── student-utils.ts # Logic to parse Roll Numbers
│   └── styles/              # Global CSS & Tailwind layers
└── public/                  # Static assets (Images, Logos)
```

---

## 🔒 Security & Best Practices
*   **Route Protection**: Middleware ensures that users can only access routes corresponding to their role (e.g., a Student cannot access `/admin`).
*   **Data Validation**: All inputs are sanitized using Zod schemas before reaching the database.
*   **Transaction Safety**: Critical operations (like Course Registration) use Prisma Transactions (`prisma.$transaction`) to prevent partial failures.

---
Created by the AIMS team.
