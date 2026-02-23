const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfDir = 'C:/Users/Life/.gemini/antigravity/MedFit App/forms';
const outputFile = 'C:/Users/Life/.gemini/antigravity/MedFit App/medfit-portal/pdf_texts.txt';

async function extract() {
    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    let result = '';

    for (const file of files) {
        console.log(`Processing ${file}`);
        const dataBuffer = fs.readFileSync(path.join(pdfDir, file));
        try {
            const data = await pdf(dataBuffer);
            result += `--- ${file} ---\n${data.text}\n\n`;
        } catch (e) {
            console.error(`Error with ${file}:`, e.message);
            result += `--- ${file} ---\nError extracting text\n\n`;
        }
    }

    fs.writeFileSync(outputFile, result);
    console.log('Extraction complete. Output saved to ' + outputFile);
}

extract();
