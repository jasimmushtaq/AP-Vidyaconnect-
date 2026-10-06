const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = path.join(__dirname, '..', 'public', 'brand', 'kaushal-disha-logo.png');
const outTransparentPath = path.join(__dirname, '..', 'public', 'brand', 'kaushal-disha-logo.png');
const outWhitePath = path.join(__dirname, '..', 'public', 'brand', 'kaushal-disha-logo-white.png');

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    console.log(`Processing image: ${this.width}x${this.height}`);
    const transparentPng = new PNG({ width: this.width, height: this.height });
    const whitePng = new PNG({ width: this.width, height: this.height });

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;

        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        const a = this.data[idx + 3];

        // Background is near white (rgb > 232)
        const brightness = (r + g + b) / 3;
        const isNearWhite = r > 230 && g > 230 && b > 230;

        if (isNearWhite) {
          // Transparent
          transparentPng.data[idx] = 0;
          transparentPng.data[idx + 1] = 0;
          transparentPng.data[idx + 2] = 0;
          transparentPng.data[idx + 3] = 0;

          whitePng.data[idx] = 0;
          whitePng.data[idx + 1] = 0;
          whitePng.data[idx + 2] = 0;
          whitePng.data[idx + 3] = 0;
        } else {
          // Anti-aliased edge smoothing
          let alpha = 255;
          if (brightness > 200) {
            alpha = Math.round(255 * ((240 - brightness) / 40));
            alpha = Math.max(0, Math.min(255, alpha));
          }

          transparentPng.data[idx] = r;
          transparentPng.data[idx + 1] = g;
          transparentPng.data[idx + 2] = b;
          transparentPng.data[idx + 3] = alpha;

          // For the white-on-dark version:
          // If dark navy (text or emblem navy parts), turn to crisp white #FFFFFF
          // If orange / saffron (r > 160 && b < 80) or green (g > 90 && r < 100), keep vivid colors
          const isSaffron = r > 160 && b < 80;
          const isGreen = g > 80 && r < 80;
          
          if (isSaffron || isGreen) {
            whitePng.data[idx] = r;
            whitePng.data[idx + 1] = g;
            whitePng.data[idx + 2] = b;
            whitePng.data[idx + 3] = alpha;
          } else {
            // Navy or dark text -> crisp pure white for dark backgrounds
            whitePng.data[idx] = 255;
            whitePng.data[idx + 1] = 255;
            whitePng.data[idx + 2] = 255;
            whitePng.data[idx + 3] = alpha;
          }
        }
      }
    }

    // Write transparent color version
    transparentPng.pack().pipe(fs.createWriteStream(outTransparentPath)).on('finish', () => {
      console.log('Successfully generated transparent logo:', outTransparentPath);
    });

    // Write white text version for dark backgrounds
    whitePng.pack().pipe(fs.createWriteStream(outWhitePath)).on('finish', () => {
      console.log('Successfully generated white-text transparent logo:', outWhitePath);
    });
  });
