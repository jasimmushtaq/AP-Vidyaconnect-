const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = path.join(__dirname, '..', 'public', 'brand', 'kaushal-disha-logo.png');
const outTransparentPath = path.join(__dirname, '..', 'public', 'brand', 'kaushal-disha-logo.png');
const outWhitePath = path.join(__dirname, '..', 'public', 'brand', 'kaushal-disha-logo-white.png');

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    // 1. Transparent version (full color with transparent background)
    const transparentPng = new PNG({ width: this.width, height: this.height });
    // 2. White text / light version for dark navy backgrounds
    const whitePng = new PNG({ width: this.width, height: this.height });

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;

        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        const a = this.data[idx + 3];

        // Background is near-white (e.g. rgb > 238)
        // Check if pixel is background
        const brightness = (r + g + b) / 3;
        const isNearWhite = r > 230 && g > 230 && b > 230;

        if (isNearWhite) {
          // Make background transparent
          transparentPng.data[idx] = 0;
          transparentPng.data[idx + 1] = 0;
          transparentPng.data[idx + 2] = 0;
          transparentPng.data[idx + 3] = 0;

          whitePng.data[idx] = 0;
          whitePng.data[idx + 1] = 0;
          whitePng.data[idx + 2] = 0;
          whitePng.data[idx + 3] = 0;
        } else {
          // Antialiasing feathering near edges
          let alpha = a;
          if (brightness > 200) {
            // Smoothly taper alpha
            alpha = Math.round(255 * ((240 - brightness) / 40));
            alpha = Math.max(0, Math.min(255, alpha));
          }

          transparentPng.data[idx] = r;
          transparentPng.data[idx + 1] = g;
          transparentPng.data[idx + 2] = b;
          transparentPng.data[idx + 3] = alpha;

          // For the white-on-dark version:
          // Keep saffron (r > 180, g < 150, b < 60) and green (r < 60, g > 100, b < 60)
          // Turn dark navy (r < 40, g < 60, b < 100) into clean crisp white (255, 255, 255)
          const isNavy = r < 50 && g < 70 && b < 120;
          if (isNavy) {
            whitePng.data[idx] = 255;
            whitePng.data[idx + 1] = 255;
            whitePng.data[idx + 2] = 255;
            whitePng.data[idx + 3] = alpha;
          } else {
            whitePng.data[idx] = r;
            whitePng.data[idx + 1] = g;
            whitePng.data[idx + 2] = b;
            whitePng.data[idx + 3] = alpha;
          }
        }
      }
    }

    // Write transparent color version
    transparentPng.pack().pipe(fs.createWriteStream(outTransparentPath)).on('finish', () => {
      console.log('Saved transparent logo:', outTransparentPath);
    });

    // Write white text version
    whitePng.pack().pipe(fs.createWriteStream(outWhitePath)).on('finish', () => {
      console.log('Saved white-text transparent logo:', outWhitePath);
    });
  });
