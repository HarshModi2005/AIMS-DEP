
export interface ParsedStudentDetails {
    department: string;
    yearOfEntry: number;
    degree: string;
    degreeType: string;
}

export function parseRollNumber(rollNumber: string): ParsedStudentDetails | null {
    // Expected format: YYYYDDGXXXX (e.g., 2023CSB1125)
    // YYYY: Year (4 digits)
    // DD: Department (2 chars)
    // G: Degree (1 char)
    // XXXX: Serial (digits)

    if (!rollNumber || rollNumber.length < 7) {
        return null; // Too short to be valid
    }

    const yearStr = rollNumber.substring(0, 4);
    const deptCode = rollNumber.substring(4, 6).toUpperCase();
    const degreeCode = rollNumber.substring(6, 7).toUpperCase();

    const yearOfEntry = parseInt(yearStr, 10);
    if (isNaN(yearOfEntry)) {
        return null;
    }

    let department = "Unknown Department";
    switch (deptCode) {
        case "CS":
            department = "Computer Science and Engineering";
            break;
        case "EE":
            department = "Electrical Engineering";
            break;
        case "ME":
            department = "Mechanical Engineering";
            break;
        case "EP":
            department = "Engineering Physics";
            break;
        case "CH":
            department = "Chemical Engineering";
            break;
        case "BB":
            department = "Biomedical Engineering";
            break;
         case "MM":
            department = "Metallurgical and Materials Engineering";
            break;
        case "MA":
            department = "Mathematics";
            break;
        case "PH":
            department = "Physics";
            break;
        case "CY":
            department = "Chemistry";
            break;
        case "HS":
            department = "Humanities and Social Sciences";
            break;
        default:
            department = deptCode; // Fallback to code if unknown
    }

    let degree = "Unknown Degree";
    let degreeType = "Unknown Type";

    switch (degreeCode) {
        case "B":
            degree = "B.Tech";
            degreeType = "BTECH";
            break;
        case "M":
            degree = "M.Tech";
            degreeType = "MTECH";
            break;
        case "Z":
            degree = "PhD";
            degreeType = "PHD";
            break;
         case "D":
            degree = "Dual Degree";
            degreeType = "DUAL_DEGREE";
            break;
         case "S":
             degree = "MS";
             degreeType = "MS";
             break;
        default:
            degree = degreeCode;
            degreeType = "UNKNOWN";
    }

    return {
        department,
        yearOfEntry,
        degree,
        degreeType
    };
}
