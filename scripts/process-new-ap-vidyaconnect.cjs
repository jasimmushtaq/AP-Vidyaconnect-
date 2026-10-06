const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const inputPath = "C:\\Users\\jasim\\.gemini\\antigravity-ide\\brain\\d16ebe3c-fdc4-4dfe-8bc4-7a8d7768fe87\\.user_uploaded\\media_1790081173022.jpg";
const outDir = path.join(__dirname, '..', 'public', 'brand');

const jpegData = fs.readFileSync(inputPath);
const rawData = jpeg.decode(jpegData, { useTArray: true });
console.log(`Decoded JPEG: ${rawData.width}x${rawData.height}`);

const W = rawData.width;
const H = rawData.height;

// Find bounding box of logo artwork
let minX = W, minY = H, maxX = 0, maxY = 0;

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = (W * y + x) << 2;
    const r = rawData.data[idx];
    const g = rawData.data[idx + 1];
    const b = rawData.data[idx + 2];

    // Background threshold (near white)
    if (r < 240 || g < 240 || b < 240) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const pad = 12;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad);
maxY = Math.min(H - 1, maxY + pad);

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
console.log(`Bounding box: ${cropW}x${cropH} (from [${minX}, ${minY}] to [${maxX}, ${maxY}])`);

const fullLogoTransparent = new PNG({ width: cropW, height: cropH });
const fullLogoWhiteMode = new PNG({ width: cropW, height: cropH });

for (let cy = 0; cy < cropH; cy++) {
  for (let cx = 0; cx < cropW; cx++) {
    const srcX = minX + cx;
    const srcY = minY + cy;
    const srcIdx = (W * srcY + srcX) << 2;
    const dstIdx = (cropW * cy + cx) << 2;

    const r = rawData.data[srcIdx];
    const g = rawData.data[srcIdx + 1];
    const b = rawData.data[srcIdx + 2];

    const brightness = (r + g + b) / 3;
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const saturation = maxVal === 0 ? 0 : (maxVal - minVal) / maxVal;

    // Background removal
    if (brightness > 238 && saturation < 0.12) {
      // 100% transparent
      fullLogoTransparent.data[dstIdx] = 0;
      fullLogoTransparent.data[dstIdx + 1] = 0;
      fullLogoTransparent.data[dstIdx + 2] = 0;
      fullLogoTransparent.data[dstIdx + 3] = 0;

      fullLogoWhiteMode.data[dstIdx] = 0;
      fullLogoWhiteMode.data[dstIdx + 1] = 0;
      fullLogoWhiteMode.data[dstIdx + 2] = 0;
      fullLogoWhiteMode.data[dstIdx + 3] = 0;
    } else {
      // Smooth alpha feathering on edges
      let alpha = 255;
      if (brightness > 218 && saturation < 0.20) {
        alpha = Math.round(255 * ((238 - brightness) / 20));
        alpha = Math.max(0, Math.min(255, alpha));
      }

      // 1. Color Transparent (Light Surfaces)
      fullLogoTransparent.data[dstIdx] = r;
      fullLogoTransparent.data[dstIdx + 1] = g;
      fullLogoTransparent.data[dstIdx + 2] = b;
      fullLogoTransparent.data[dstIdx + 3] = alpha;

      // 2. White Mode (Dark Surfaces)
      // Dark Navy Text / Black parts -> #FFFFFF White
      // Vivid Green / Orange / Cyan -> preserved
      const isDarkNavyOrBlack = (r < 75 && g < 95 && b < 135) || (brightness < 80);
      const isGreen = g > 110 && g > r && g > b;
      const isOrangeOrYellow = r > 180 && g > 90 && b < 100;
      const isBrightBlueOrCyan = b > 140 && (b > r + 30);

      if (isGreen || isOrangeOrYellow || isBrightBlueOrCyan) {
        fullLogoWhiteMode.data[dstIdx] = r;
        fullLogoWhiteMode.data[dstIdx + 1] = g;
        fullLogoWhiteMode.data[dstIdx + 2] = b;
        fullLogoWhiteMode.data[dstIdx + 3] = alpha;
      } else if (isDarkNavyOrBlack) {
        fullLogoWhiteMode.data[dstIdx] = 255;
        fullLogoWhiteMode.data[dstIdx + 1] = 255;
        fullLogoWhiteMode.data[dstIdx + 2] = 255;
        fullLogoWhiteMode.data[dstIdx + 3] = alpha;
      } else {
        fullLogoWhiteMode.data[dstIdx] = r;
        fullLogoWhiteMode.data[dstIdx + 1] = g;
        fullLogoWhiteMode.data[dstIdx + 2] = b;
        fullLogoWhiteMode.data[dstIdx + 3] = alpha;
      }
    }
  }
}

// Write stacked files
const p1 = path.join(outDir, 'ap-vidyaconnect-logo.png');
const p1Legacy = path.join(outDir, 'kaushal-disha-logo.png');
fullLogoTransparent.pack().pipe(fs.createWriteStream(p1)).on('finish', () => {
  fs.copyFileSync(p1, p1Legacy);
  console.log('Saved transparent full logo:', p1);
});

const p2 = path.join(outDir, 'ap-vidyaconnect-logo-white.png');
const p2Legacy = path.join(outDir, 'kaushal-disha-logo-white.png');
fullLogoWhiteMode.pack().pipe(fs.createWriteStream(p2)).on('finish', () => {
  fs.copyFileSync(p2, p2Legacy);
  console.log('Saved white mode transparent full logo:', p2);
});

// Also create emblem-only mark (top 68% of height)
const emblemH = Math.round(cropH * 0.65);
const emblemLogo = new PNG({ width: cropW, height: emblemH });

for (let ey = 0; ey < emblemH; ey++) {
  for (let ex = 0; ex < cropW; ex++) {
    const srcIdx = (cropW * ey + ex) << 2;
    const dstIdx = (cropW * ey + ex) << 2;

    emblemLogo.data[dstIdx] = fullLogoTransparent.data[srcIdx];
    emblemLogo.data[dstIdx + 1] = fullLogoTransparent.data[srcIdx + 1];
    emblemLogo.data[dstIdx + 2] = fullLogoTransparent.data[srcIdx + 2];
    emblemLogo.data[dstIdx + 3] = fullLogoTransparent.data[srcIdx + 3];
  }
}

const pMark = path.join(outDir, 'ap-vidyaconnect-mark.png');
emblemLogo.pack().pipe(fs.createWriteStream(pMark)).on('finish', () => {
  console.log('Saved emblem mark:', pMark);
});
