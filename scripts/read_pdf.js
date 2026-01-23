
const fs = require('fs');
const pdf = require('pdf-parse');

async function read() {
    try {
        const dataBuffer = fs.readFileSync('AIMS Portal - Faculty View.pdf');
        const data = await pdf(dataBuffer);
        console.log(data.text);
    } catch (e) {
        console.error("Error reading PDF:", e);
    }
}

read();
