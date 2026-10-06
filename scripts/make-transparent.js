import fs from 'fs';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const sourceJpgPath = 'C:\\Users\\jasim\\.gemini\\antigravity-ide\\brain\\d473d07c-333c-445f-a5c0-980f8811ba04\\idyabot_transparent_png_1791203487324.jpg';
const destPngPath1 = 'c:\\Users\\jasim\\OneDrive\\Attachments\\Desktop\\disha\\public\\brand\\idyabot-3d.png';
const destPngPath2 = 'c:\\Users\\jasim\\OneDrive\\Attachments\\Desktop\\disha\\public\\brand\\idyabot-mascot.png';
const destJpgPath = 'c:\\Users\\jasim\\OneDrive\\Attachments\\Desktop\\disha\\public\\brand\\idyabot-mascot.jpg';

const jpegData = fs.readFileSync(sourceJpgPath);
const rawImageData = jpeg.decode(jpegData, { useTArray: true, formatAsRGBA: true });

const { width, height, data } = rawImageData;
const png = new PNG({ width, height });

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Check if pixel is white background
    // Calculate brightness / distance from pure white (255, 255, 255)
    const brightness = (r + g + b) / 3;
    const colorDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

    let alpha = 255;
    if (brightness > 248 && colorDiff < 10) {
      alpha = 0;
    } else if (brightness > 235 && colorDiff < 15) {
      // smooth antialiased edge transition
      alpha = Math.floor(((248 - brightness) / 13) * 255);
      alpha = Math.max(0, Math.min(255, alpha));
    }

    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = alpha;
  }
}

const buffer = PNG.sync.write(png);
fs.writeFileSync(destPngPath1, buffer);
fs.writeFileSync(destPngPath2, buffer);
// Also copy the clean jpg
fs.copyFileSync(sourceJpgPath, destJpgPath);

console.log('Successfully generated transparent 3D IdyaBot PNGs at:', destPngPath1, destPngPath2);
