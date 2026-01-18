
import { parseRollNumber } from '../src/lib/student-utils';

const testCases = [
    "2023CSB1125",
    "2022EEM1234",
    "2021PHZ001",
    "2024EPD010",
    "2020MED100",
    "INVALID",
    "2023",
    "2023CS",
    "2023CSK1234" // Unknown degree
];

console.log("Running Roll Number Parsing Tests...\n");

testCases.forEach(roll => {
    console.log(`Roll Number: ${roll}`);
    const result = parseRollNumber(roll);
    if (result) {
        console.log(`  Department: ${result.department}`);
        console.log(`  Year: ${result.yearOfEntry}`);
        console.log(`  Degree: ${result.degree} (${result.degreeType})`);
    } else {
        console.log("  Result: Invalid or Null");
    }
    console.log("-".repeat(30));
});
