const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const indexHtmlPath = path.join(__dirname, '..', 'index.html');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/Kaushal Disha \(कौशल दिशा\)/g, 'AP VidyaConnect');
  content = content.replace(/KAUSHAL DISHA \(कौशल दिशा\)/g, 'AP VIDYACONNECT');
  content = content.replace(/Kaushal Disha/g, 'AP VidyaConnect');
  content = content.replace(/KAUSHAL DISHA/g, 'AP VIDYACONNECT');
  content = content.replace(/kaushal disha/g, 'AP VidyaConnect');
  content = content.replace(/kaushaldisha\.gov\.in/g, 'apvidyaconnect.ap.gov.in');
  content = content.replace(/nodal\.officer@kaushaldisha\.gov\.in/g, 'nodal.officer@apvidyaconnect.ap.gov.in');
  content = content.replace(/support@kaushaldisha\.gov\.in/g, 'support@apvidyaconnect.ap.gov.in');
  content = content.replace(/kaushal_disha_v1_/g, 'ap_vidyaconnect_v1_');
  content = content.replace(/KD-2026-CERT/g, 'APVC-2026-CERT');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(tsx|ts|js|jsx|json|css|html|md|sql)$/.test(file)) {
      processFile(fullPath);
    }
  }
}

walkDir(srcDir);
processFile(indexHtmlPath);
console.log('Finished renaming to AP VidyaConnect everywhere!');
