const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

async function run() {
    console.log("PDF Parse Type:", typeof pdfParse);
    const dir = path.join(__dirname, '../forms');
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(path.join(dir, file));
            try {
                const data = await pdfParse(dataBuffer);
                console.log('--- ' + file + ' ---');
                console.log(data.text.replace(/\n\s*\n/g, '\n').substring(0, 1000) + '... (truncated)');
            } catch (e) {
                console.log('Error reading', file, e.message);
            }
        }
    }
}
run().catch(console.error);
