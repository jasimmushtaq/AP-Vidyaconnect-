const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = "C:\\Users\\jasim\\.gemini\\antigravity-ide\\brain\\d16ebe3c-fdc4-4dfe-8bc4-7a8d7768fe87\\.user_uploaded\\media_1790086177955.png";
const outDir = path.join(__dirname, '..', 'public', 'brand');

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    console.log(`Original PixelWind logo: ${this.width}x${this.height}`);

    // Step 1: Find bounding box of artwork
    let minX = this.width, minY = this.height, maxX = 0, maxY = 0;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        const a = this.data[idx + 3];

        if (a > 10 && (r < 245 || g < 245 || b < 245)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const pad = 10;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(this.width - 1, maxX + pad);
    maxY = Math.min(this.height - 1, maxY + pad);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    console.log(`Cropped bounding box: ${cropW}x${cropH}`);

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

        // Background is near white
        if (r > 240 && g > 240 && b > 240) {
          transparentLogo.data[dstIdx] = 0;
          transparentLogo.data[dstIdx + 1] = 0;
          transparentLogo.data[dstIdx + 2] = 0;
          transparentLogo.data[dstIdx + 3] = 0;

          whiteModeLogo.data[dstIdx] = 0;
          whiteModeLogo.data[dstIdx + 1] = 0;
          whiteModeLogo.data[dstIdx + 2] = 0;
          whiteModeLogo.data[dstIdx + 3] = 0;
        } else {
          let alpha = a;
          if (brightness > 220) {
            alpha = Math.round(255 * ((245 - brightness) / 25));
            alpha = Math.max(0, Math.min(255, alpha));
          }

          // Full color transparent
          transparentLogo.data[dstIdx] = r;
          transparentLogo.data[dstIdx + 1] = g;
          transparentLogo.data[dstIdx + 2] = b;
          transparentLogo.data[dstIdx + 3] = alpha;

          // White mode for dark backgrounds:
          // Keep bright blue swoosh (r < 40 && b > 140)
          // Turn black/dark navy text ("ixel", "ind", "Technologies") into clean white #FFFFFF
          const isBrightBlue = b > 140 && (b > r + 40);
          if (isBrightBlue) {
            whiteModeLogo.data[dstIdx] = r;
            whiteModeLogo.data[dstIdx + 1] = g;
            whiteModeLogo.data[dstIdx + 2] = b;
            whiteModeLogo.data[dstIdx + 3] = alpha;
          } else {
            whiteModeLogo.data[dstIdx] = 255;
            whiteModeLogo.data[dstIdx + 1] = 255;
            whiteModeLogo.data[dstIdx + 2] = 255;
            whiteModeLogo.data[dstIdx + 3] = alpha;
          }
        }
      }
    }

    const p1 = path.join(outDir, 'pixelwind-logo.png');
    transparentLogo.pack().pipe(fs.createWriteStream(p1)).on('finish', () => {
      console.log('Saved transparent PixelWind logo:', p1);
    });

    const p2 = path.join(outDir, 'pixelwind-logo-white.png');
    whiteModeLogo.pack().pipe(fs.createWriteStream(p2)).on('finish', () => {
      console.log('Saved white-text transparent PixelWind logo:', p2);
    });
  });
