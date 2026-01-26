import { PrismaClient, CourseCategory, CourseLevel, OfferingStatus } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

// Helper to load .env manually since we don't have dotenv installed
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const val = values.join('=').trim().replace(/^["']|["']$/g, '');
                if (!process.env[key.trim()]) {
                    process.env[key.trim()] = val;
                }
            }
        });
    }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("❌ DATABASE_URL not found in environment or .env file");
    process.exit(1);
}

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

// Map prefixes to Department names
const DEPARTMENT_MAP: Record<string, string> = {
    'CS': 'Computer Science and Engineering',
    'EE': 'Electrical Engineering',
    'ME': 'Mechanical Engineering',
    'CH': 'Chemical Engineering',
    'CE': 'Civil Engineering',
    'MA': 'Mathematics',
    'PH': 'Physics',
    'CY': 'Chemistry',
    'HS': 'Humanities and Social Sciences',
    'HU': 'Humanities and Social Sciences',
    'BM': 'Biomedical Engineering',
    'MM': 'Metallurgical and Materials Engineering',
    'GE': 'General Engineering',
};

// Helper: infer department from course code
function getDepartment(courseCode: string): string {
    const prefix = courseCode.replace(/[0-9].*$/, ''); // "CS301" -> "CS"
    return DEPARTMENT_MAP[prefix] || 'Other';
}

// Helper: Clean numeric strings with possible splits like "2/3"
function parseNumeric(val: any): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        // Handle "2/3" -> take 2
        const clean = val.split('/')[0].trim();
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
    }
    return 0;
}

// Helper: Parse L-T-P-S-C string "3-1-0-5-3"
function parseCredits(ltpscStr: string) {
    // Example: "3-1-0-5-3" or "0-0-4-2-2"
    // Sometimes might be messy like "2-2/3..."
    if (!ltpscStr) return { l: 0, t: 0, p: 0, s: 0, c: 0 };

    const cleanStr = String(ltpscStr).trim();
    // Split by "-"
    // If there are slashes inside parts, we usually want the first option?
    // Let's just create a cleaner array
    const parts = cleanStr.split('-').map(p => parseNumeric(p));

    // safe access
    const l = parts[0] || 0;
    const t = parts[1] || 0;
    const p = parts[2] || 0;
    const s = parts[3] || 0;

    return { l, t, p, s };
}

async function main() {
    console.log("🚀 Starting Course Seeding...");

    // 1. Ensure Session exists
    const sessionName = "2025-II";
    const session = await prisma.academicSession.findUnique({
        where: { name: sessionName },
    });

    if (!session) {
        console.error(`❌ Session ${sessionName} not found! Please run the main seed first.`);
        return;
    }
    console.log(`Using Session: ${sessionName} (${session.id})`);

    // 2. Read Excel
    const filePath = path.join(process.cwd(), 'Final  list of UG & PG Courses list for the 2nd sem of AY 2025-26 (1).xlsx');
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
    }
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Skip header (row 0)
    // Headers: [ 'Course No.', 'Course Description', 'L–T–P–S– C', 'Credits', 'Course Instructor' ]
    // Index mapping (approx based on inspect):
    // 0: Ignore? Or Course No?
    // Wait, inspect showed: [ <empty>, 'Course No.', ... ]
    // So indices might be shifted by 1 if there's an empty first col.
    // Let's find the header row index.

    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const row = rows[i];
        if (row.includes('Course No.')) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        console.error("❌ Could not find header row with 'Course No.'");
        return;
    }

    // Map column indices
    const headerRow = rows[headerRowIndex];
    const idxCode = headerRow.indexOf('Course No.');
    const idxName = headerRow.indexOf('Course Description');
    const idxStruct = headerRow.indexOf('L–T–P–S– C'); // verify verify exact char
    // "L–T–P–S– C" (Note the en-dashes or strange chars? Inspect output showed: 'L–T–P–S– C')
    const idxCredits = headerRow.indexOf('Credits');

    console.log(`Header found at row ${headerRowIndex}. Indices: Code=${idxCode}, Name=${idxName}, Struct=${idxStruct}, Credits=${idxCredits}`);

    // Create dummy faculty map for floaters (cache)
    const dummyFacultyCache: Record<string, string> = {}; // Dep -> FacultyId

    async function getDummyFacultyId(dept: string) {
        if (dummyFacultyCache[dept]) return dummyFacultyCache[dept];

        const email = `faculty.${dept.toLowerCase().replace(/[^a-z0-9]/g, '')}@iitrpr.ac.in`;
        // Check if exists
        let fac = await prisma.faculty.findFirst({
            where: { user: { email } }
        });

        if (!fac) {
            console.log(`Creating dummy faculty for ${dept}...`);
            // Need to create dummy user first if not exists
            const user = await prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                    email,
                    rollNumber: `DUMMY_${dept.substring(0, 3).toUpperCase()}_${Date.now()}`,
                    firstName: "Faculty",
                    lastName: dept,
                    role: "FACULTY",
                    password: "dummy_password",
                }
            });

            fac = await prisma.faculty.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                    department: dept,
                    designation: "ASSISTANT_PROFESSOR",
                }
            });
        }

        dummyFacultyCache[dept] = fac.id;
        return fac.id;
    }


    // 3. Process Rows
    let count = 0;
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        const code = String(row[idxCode] || '').trim();
        const name = String(row[idxName] || '').trim();
        if (!code) continue;

        const structStr = row[idxStruct];
        const creditVal = parseNumeric(row[idxCredits]);
        const { l, t, p, s } = parseCredits(structStr);
        // If creditVal is valid from Excel, use it, else sum? Or just use creditVal.
        // Course schema has `credits: Float`.

        const dept = getDepartment(code);

        // 3a. Upsert Course
        try {
            const course = await prisma.course.upsert({
                where: { courseCode: code },
                update: {
                    courseName: name,
                    lectureHours: l,
                    tutorialHours: t,
                    practicalHours: p,
                    selfStudyHours: s,
                    credits: creditVal || (l + t + p + s), // Fallback if 0
                    department: dept,
                },
                create: {
                    courseCode: code,
                    courseName: name,
                    lectureHours: l,
                    tutorialHours: t,
                    practicalHours: p,
                    selfStudyHours: s,
                    credits: creditVal || (l + t + p + s),
                    department: dept,
                    courseCategory: CourseCategory.OE, // Defaulting to OE for now, hard to infer
                    level: code.match(/\d+/)?.[0]?.startsWith('5') || code.match(/\d+/)?.[0]?.startsWith('6') ? CourseLevel.GRADUATE : CourseLevel.UNDERGRADUATE,
                }
            });
            console.log(`Processed Course: ${code} (${dept})`);

            // 3b. Float if NOT CS
            // "don't float the courses for computer scienece department"
            // So if dept is "Computer Science and Engineering", skip offering creation.
            if (dept === 'Computer Science and Engineering') {
                console.log(`   -> Skipping float for CS course.`);
                continue;
            }

            // Create Offering
            const facId = await getDummyFacultyId(dept);

            // Upsert Offering
            const offering = await prisma.courseOffering.upsert({
                where: {
                    courseId_sessionId: {
                        courseId: course.id,
                        sessionId: session.id
                    }
                },
                update: {}, // Don't change if exists
                create: {
                    courseId: course.id,
                    sessionId: session.id,
                    offeringDepartment: dept,
                    maxStrength: 100, // Default
                    status: OfferingStatus.OPEN_FOR_ENROLLMENT,
                    instructors: {
                        create: {
                            facultyId: facId,
                            isPrimary: true
                        }
                    }
                }
            });
            console.log(`   -> Floated: ${offering.id}`);

        } catch (e: any) {
            console.error(`Error processing ${code}:`, e.message);
            continue;
        }
        count++;
    }

    console.log(`✅ Finished! Processed ${count} courses.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
