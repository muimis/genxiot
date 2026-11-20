const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const pdfPath = path.join(process.cwd(), 'test_http_output.pdf');

console.log('Testing Chrome against http://localhost:8080/index.html ...');
try {
  execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=5000 --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" http://localhost:8080/index.html`, { timeout: 30000 });
  const stats = fs.statSync(pdfPath);
  console.log('Generated PDF size:', stats.size, 'bytes');
  const pdfContent = fs.readFileSync(pdfPath, 'binary');
  const pageMatches = pdfContent.match(/\/Type\s*\/Page\b/g);
  console.log('Page count detected:', pageMatches ? pageMatches.length : 'unknown');
} catch (e) {
  console.error('Error:', e.message);
}
