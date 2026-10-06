const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = "C:\\Users\\jasim\\.gemini\\antigravity-ide\\brain\\d16ebe3c-fdc4-4dfe-8bc4-7a8d7768fe87\\.user_uploaded\\media_1790080556735.png";

const outDir = path.join(__dirname, '..', 'public', 'brand');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    console.log(`Original image size: ${this.width}x${this.height}`);

    // Step 1: Find bounding box of non-white pixels
    let minX = this.width, minY = this.height, maxX = 0, maxY = 0;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        const a = this.data[idx + 3];

        // If not white background
        if (a > 10 && (r < 240 || g < 240 || b < 240)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Add slight margin around bounding box
    const pad = 16;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(this.width - 1, maxX + pad);
    maxY = Math.min(this.height - 1, maxY + pad);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    console.log(`Cropped bounding box: ${cropW}x${cropH} (from [${minX}, ${minY}] to [${maxX}, ${maxY}])`);

    const transparentLogo = new PNG({ width: cropW, height: cropH });
    const whiteModeLogo = new PNG({ width: cropW, height: cropH });

    for (let cy = 0; cy < cropH; cy++) {
      for (let cx = 0; cx < cropW; cx++) {
        const srcX = minX + cx;
        const srcY = minY + cy;
        const srcIdx = (this.width * srcY + srcX) << 2;
        const dstIdx = (cropW * cy + cx) << 2;

        const r = this.data[srcIdx];
        const g = this.data[srcIdx + 1];
        const b = this.data[srcIdx + 2];
        const a = this.data[srcIdx + 3];

        const brightness = (r + g + b) / 3;
        const maxVal = Math.max(r, g, b);
        const minVal = Math.min(r, g, b);
        const saturation = maxVal === 0 ? 0 : (maxVal - minVal) / maxVal;

        // Background is near white (high brightness and low saturation)
        if (brightness > 235 && saturation < 0.12) {
          // 100% transparent background
          transparentLogo.data[dstIdx] = 0;
          transparentLogo.data[dstIdx + 1] = 0;
          transparentLogo.data[dstIdx + 2] = 0;
          transparentLogo.data[dstIdx + 3] = 0;

          whiteModeLogo.data[dstIdx] = 0;
          whiteModeLogo.data[dstIdx + 1] = 0;
          whiteModeLogo.data[dstIdx + 2] = 0;
          whiteModeLogo.data[dstIdx + 3] = 0;
        } else {
          // Smooth edge alpha
          let alpha = a;
          if (brightness > 215 && saturation < 0.18) {
            alpha = Math.round(255 * ((235 - brightness) / 20));
            alpha = Math.max(0, Math.min(255, alpha));
          }

          // 1. Color Transparent Version (for Light / White surfaces)
          transparentLogo.data[dstIdx] = r;
          transparentLogo.data[dstIdx + 1] = g;
          transparentLogo.data[dstIdx + 2] = b;
          transparentLogo.data[dstIdx + 3] = alpha;

          // 2. White Mode Version (for Dark Navy / Dark surfaces)
          // Identify dark navy / dark blue colors (e.g. "Vidya", dark parts of antlers, dark navy text)
          const isDarkNavyOrBlack = (r < 70 && g < 90 && b < 130) || (brightness < 80);
          const isGreen = g > 110 && g > r && g > b;
          const isOrangeOrYellow = r > 180 && g > 90 && b < 100;
          const isBrightBlueOrCyan = b > 140 && (b > r + 30);

          if (isGreen || isOrangeOrYellow || isBrightBlueOrCyan) {
            // Keep vibrant green, orange, sun, and bright cyan colors untouched
            whiteModeLogo.data[dstIdx] = r;
            whiteModeLogo.data[dstIdx + 1] = g;
            whiteModeLogo.data[dstIdx + 2] = b;
            whiteModeLogo.data[dstIdx + 3] = alpha;
          } else if (isDarkNavyOrBlack) {
            // Convert dark navy / dark text into clean crisp white for dark surfaces
            whiteModeLogo.data[dstIdx] = 255;
            whiteModeLogo.data[dstIdx + 1] = 255;
            whiteModeLogo.data[dstIdx + 2] = 255;
            whiteModeLogo.data[dstIdx + 3] = alpha;
          } else {
            whiteModeLogo.data[dstIdx] = r;
            whiteModeLogo.data[dstIdx + 1] = g;
            whiteModeLogo.data[dstIdx + 2] = b;
            whiteModeLogo.data[dstIdx + 3] = alpha;
          }
        }
      }
    }

    // Save full color transparent PNG
    const p1 = path.join(outDir, 'ap-vidyaconnect-logo.png');
    const p1Legacy = path.join(outDir, 'kaushal-disha-logo.png');
    transparentLogo.pack().pipe(fs.createWriteStream(p1)).on('finish', () => {
      fs.copyFileSync(p1, p1Legacy);
      console.log('Saved transparent logo:', p1);
    });

    // Save white mode transparent PNG
    const p2 = path.join(outDir, 'ap-vidyaconnect-logo-white.png');
    const p2Legacy = path.join(outDir, 'kaushal-disha-logo-white.png');
    whiteModeLogo.pack().pipe(fs.createWriteStream(p2)).on('finish', () => {
      fs.copyFileSync(p2, p2Legacy);
      console.log('Saved white mode transparent logo:', p2);
    });
  });
