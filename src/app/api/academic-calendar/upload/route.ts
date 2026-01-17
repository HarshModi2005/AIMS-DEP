
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import PDFParser from "pdf2json";
import { AcademicEvent } from "@prisma/client";

// No export const config needed for Next.js 13+ App Router with standard request handling
// unless explicitly needed for runtime (simpler is better)

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "calendars");

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const sessionId = formData.get("sessionId") as string;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

        // Ensure upload directory exists
        await mkdir(UPLOAD_DIR, { recursive: true });

        // Write file to disk
        await writeFile(path.join(UPLOAD_DIR, filename), buffer);
        const fileUrl = `/uploads/calendars/${filename}`;

        // Extract text from PDF using pdf2json
        let extractedText = "";
        try {
            extractedText = await parsePdfBuffer(buffer);
        } catch (parseError) {
            console.error("PDF Parsing error:", parseError);
        }

        // Create Document Record
        const document = await prisma.academicDocument.create({
            data: {
                title: "Academic Calendar",
                documentType: "ACADEMIC_CALENDAR",
                sessionId,
                fileUrl,
                fileName: file.name,
                fileSize: file.size,
                uploadedBy: session.user.id,
                isParsed: extractedText.length > 0,
                parseError: extractedText.length === 0 ? "Failed to extract text" : null,
            },
        });

        // Parse Dates
        const eventsFound: any[] = [];
        if (extractedText) {
            const parsedEvents = parseDatesFromText(extractedText, sessionId);

            if (parsedEvents.length > 0) {
                // Create academic dates
                for (const event of parsedEvents) {
                    try {
                        const createdDate = await prisma.academicDate.create({
                            data: {
                                sessionId,
                                eventType: event.eventType,
                                eventName: event.eventName,
                                startDate: event.startDate,
                                endDate: event.endDate,
                                isVisible: true,
                            },
                        });
                        eventsFound.push(createdDate);
                    } catch (e) {
                        console.error(`Failed to create event ${event.eventName}:`, e);
                    }
                }
            }

            // Update document with extracted data summary
            await prisma.academicDocument.update({
                where: { id: document.id },
                data: {
                    extractedData: { eventsFound: eventsFound.length, events: eventsFound }
                }
            });
        }

        return NextResponse.json({
            success: true,
            document,
            eventsParsed: eventsFound.length,
            events: eventsFound
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload and process file" },
            { status: 500 }
        );
    }
}

// Helper to wrap pdf2json in a promise
function parsePdfBuffer(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1); // 1 = text content only

        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            // pdf2json returns raw text content, often URL encoded
            // We need to access .formImage.Pages[].Texts[].R[].T
            // This is complex. Let's use the 'rawTextContent' if available or extract it.
            // Actually, the simpler '1' mode might give raw text. 
            // EDIT: mode 1 is NOT raw text, it avoids stream parsing.
            // Let's iterate.
            try {
                let text = "";
                // @ts-ignore
                pdfData.Pages.forEach(page => {
                    // @ts-ignore
                    page.Texts.forEach(t => {
                        // @ts-ignore
                        t.R.forEach(r => {
                            text += decodeURIComponent(r.T) + " ";
                        });
                    });
                    text += "\n";
                });
                resolve(text);
            } catch (e) {
                reject(e);
            }
        });

        pdfParser.parseBuffer(buffer);
    });
}


// Helper function to parse dates from text
// This is a heuristic based parser and might need tuning based on actual PDF format
function parseDatesFromText(text: string, sessionId: string) {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    const events: { eventType: AcademicEvent, eventName: string, startDate: Date, endDate: Date | null }[] = [];

    const currentYear = new Date().getFullYear();

    // Keyword mapping to EventType
    const keywordMap: { [key: string]: AcademicEvent } = {
        "Classes Begin": "CLASSES",
        "Classes End": "CLASSES",
        "Mid Semester Exams": "MID_SEM_EXAMS",
        "Mid-Sem Exams": "MID_SEM_EXAMS",
        "End Semester Exams": "END_SEM_EXAMS",
        "End-Sem Exams": "END_SEM_EXAMS",
        "Grade Submission": "GRADES_SUBMISSION",
        "Result Declaration": "RESULT_DECLARATION",
        "Course Drop": "COURSE_DROP",
        "Pre-Registration": "COURSE_PRE_REGISTRATION",
        "Feedback": "COURSE_FEEDBACK",
        "Holiday": "HOLIDAYS",
        "Diwali": "HOLIDAYS",
        "Holi": "HOLIDAYS",
        "Independence Day": "HOLIDAYS",
        "Republic Day": "HOLIDAYS",
        "Gandhi Jayanti": "HOLIDAYS",
        "Christmas": "HOLIDAYS",
        "Withdraw": "WITHDRAW"
    };


    for (const line of lines) {
        let matchedType: AcademicEvent = "CUSTOM";
        let matchedName = line.trim();

        for (const [keyword, type] of Object.entries(keywordMap)) {
            if (line.toLowerCase().includes(keyword.toLowerCase())) {
                matchedType = type;
                if (matchedType === 'HOLIDAYS') matchedName = line.split(/[0-9]/)[0].trim();
                else matchedName = keyword;
                break;
            }
        }

        // Heuristic date extraction
        // Look for something that looks like a date
        const dateMatch = extractDate(line);

        if (dateMatch && matchedType !== 'CUSTOM') {
            events.push({
                eventType: matchedType,
                eventName: matchedName,
                startDate: dateMatch.start,
                endDate: dateMatch.end
            });
        }
    }

    return events;
}

function extractDate(text: string): { start: Date, end: Date | null } | null {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthRegex = monthNames.join("|");

    const dateRegex = new RegExp(`\\b([0-9]{1,2})\\s+(${monthRegex})(?:\\s+([0-9]{4}))?\\b`, 'i');

    const match = text.match(dateRegex);

    if (match) {
        const day = parseInt(match[1]);
        const monthStr = match[2];
        let year = match[3] ? parseInt(match[3]) : new Date().getFullYear();

        // Basic heuristics for year if missing:
        const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth();
        const date = new Date(year, monthIndex, day);

        return { start: date, end: null };
    }

    return null;
}
