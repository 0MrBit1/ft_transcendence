const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function readDocx() {
  try {
    const docxPath = path.join(__dirname, 'UniClubs.docx');
    const result = await mammoth.extractRawText({ path: docxPath });
    console.log('=== UNICLUBS PROJECT REQUIREMENTS ===\n');
    console.log(result.value);
  } catch (error) {
    console.error('Error reading docx file:', error);
  }
}

readDocx();
