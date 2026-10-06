// ============================================================================
// AUTHENTIC SIGNATURE INK EXTRACTOR (CAMSCANNER-GRADE LOCAL ADAPTIVE THRESHOLD)
// Converts any photo (paper photo, mobile camera, grey/shadowed background)
// into 100% pure, transparent, authentic pen ink strokes.
// ============================================================================

export interface CleanSignatureOptions {
  inkColor?: 'navy' | 'black' | 'royal_blue' | 'preserve';
  contrastBoost?: number; // 0.8 to 1.5
  smoothEdges?: boolean;
}

/**
 * Extracts pure pen ink strokes from any uploaded signature photo,
 * completely removing grey paper backgrounds, camera shadows, and photo borders.
 */
export async function cleanSignatureImage(
  imageSrc: string,
  options: CleanSignatureOptions = {}
): Promise<string> {
  const {
    inkColor = 'navy',
    contrastBoost = 1.0
  } = options;

  if (!imageSrc) return imageSrc;

  // If it's already a clean SVG or pure text, return
  if (imageSrc.startsWith('<svg') || !imageSrc.includes('data:image') && !imageSrc.startsWith('http') && !imageSrc.startsWith('/')) {
    return imageSrc;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const srcW = img.naturalWidth || img.width || 400;
        const srcH = img.naturalHeight || img.height || 200;

        // Create canvas
        const canvas = document.createElement('canvas');
        // Limit max dimensions for performance and high DPI clarity
        const scale = Math.min(1, 1200 / Math.max(srcW, srcH));
        const w = Math.round(srcW * scale);
        const h = Math.round(srcH * scale);

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Step 1: Divide into grid for Local Background (Paper) Luminance Estimation
        // This handles camera shadows, uneven lighting, paper grain, and dark corners.
        const gridCols = 8;
        const gridRows = 6;
        const blockW = Math.max(1, Math.floor(w / gridCols));
        const blockH = Math.max(1, Math.floor(h / gridRows));
        const gridPaperLuma: number[][] = Array(gridRows)
          .fill(0)
          .map(() => Array(gridCols).fill(255));
        const gridMinLuma: number[][] = Array(gridRows)
          .fill(0)
          .map(() => Array(gridCols).fill(0));

        for (let gy = 0; gy < gridRows; gy++) {
          for (let gx = 0; gx < gridCols; gx++) {
            const startX = gx * blockW;
            const startY = gy * blockH;
            const endX = Math.min(w, startX + blockW);
            const endY = Math.min(h, startY + blockH);

            const lumas: number[] = [];
            for (let y = startY; y < endY; y += 2) {
              for (let x = startX; x < endX; x += 2) {
                const idx = (y * w + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];
                if (a > 30) {
                  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                  lumas.push(luma);
                }
              }
            }

            if (lumas.length > 0) {
              lumas.sort((a, b) => a - b);
              // Paper is in the top 15% brightest in each block
              const paperIdx = Math.floor(lumas.length * 0.88);
              const minIdx = Math.floor(lumas.length * 0.08);
              gridPaperLuma[gy][gx] = lumas[paperIdx];
              gridMinLuma[gy][gx] = lumas[minIdx];
            } else {
              gridPaperLuma[gy][gx] = 240;
              gridMinLuma[gy][gx] = 30;
            }
          }
        }

        // Global paper fallback
        let overallMaxPaper = 240;
        let sumPaper = 0;
        let countPaper = 0;
        for (let gy = 0; gy < gridRows; gy++) {
          for (let gx = 0; gx < gridCols; gx++) {
            sumPaper += gridPaperLuma[gy][gx];
            countPaper++;
          }
        }
        overallMaxPaper = countPaper > 0 ? sumPaper / countPaper : 240;

        // Target ink colors (RGB)
        let targetR = 14;
        let targetG = 35;
        let targetB = 80; // Default: Legal Dark Navy Blue

        if (inkColor === 'black') {
          targetR = 17;
          targetG = 24;
          targetB = 39; // Deep Rich Black (#111827)
        } else if (inkColor === 'royal_blue') {
          targetR = 10;
          targetG = 60;
          targetB = 160;
        }

        // Step 2: Pixel Transformation & Transparent Alpha Knockout
        let minBoundX = w;
        let minBoundY = h;
        let maxBoundX = 0;
        let maxBoundY = 0;
        let inkPixelCount = 0;

        for (let y = 0; y < h; y++) {
          const gyNorm = (y / h) * (gridRows - 1);
          const gy0 = Math.floor(gyNorm);
          const gy1 = Math.min(gridRows - 1, gy0 + 1);
          const fy = gyNorm - gy0;

          for (let x = 0; x < w; x++) {
            const gxNorm = (x / w) * (gridCols - 1);
            const gx0 = Math.floor(gxNorm);
            const gx1 = Math.min(gridCols - 1, gx0 + 1);
            const fx = gxNorm - gx0;

            // Bilinear interpolation of local paper luminance
            const p00 = gridPaperLuma[gy0][gx0];
            const p10 = gridPaperLuma[gy0][gx1];
            const p01 = gridPaperLuma[gy1][gx0];
            const p11 = gridPaperLuma[gy1][gx1];
            const localPaper = (p00 * (1 - fx) + p10 * fx) * (1 - fy) + (p01 * (1 - fx) + p11 * fx) * fy;

            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            if (a === 0) continue;

            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            // Cutoff boundaries
            // Anything within 12% of local paper is 100% removed (transparent)
            const paperThreshold = Math.max(110, localPaper * 0.90);
            // Ink core boundary
            const inkThreshold = Math.max(50, localPaper * 0.65 * contrastBoost);

            if (luma >= paperThreshold) {
              // 100% Background removal - ZERO grey box!
              data[idx + 3] = 0;
            } else if (luma <= inkThreshold) {
              // 100% Solid Ink
              data[idx + 3] = 255;
              if (inkColor !== 'preserve') {
                data[idx] = targetR;
                data[idx + 1] = targetG;
                data[idx + 2] = targetB;
              }
              // Track bounding box
              if (x < minBoundX) minBoundX = x;
              if (x > maxBoundX) maxBoundX = x;
              if (y < minBoundY) minBoundY = y;
              if (y > maxBoundY) maxBoundY = y;
              inkPixelCount++;
            } else {
              // Smooth anti-aliasing gradient between ink and transparent paper
              const ratio = (paperThreshold - luma) / (paperThreshold - inkThreshold);
              const alpha = Math.min(255, Math.max(0, Math.round(255 * Math.pow(ratio, 1.3))));
              data[idx + 3] = alpha;

              if (inkColor !== 'preserve') {
                data[idx] = targetR;
                data[idx + 1] = targetG;
                data[idx + 2] = targetB;
              }

              if (alpha > 40) {
                if (x < minBoundX) minBoundX = x;
                if (x > maxBoundX) maxBoundX = x;
                if (y < minBoundY) minBoundY = y;
                if (y > maxBoundY) maxBoundY = y;
                inkPixelCount++;
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Step 3: Tight Auto-Crop to ink bounds with subtle padding
        if (inkPixelCount > 30 && maxBoundX > minBoundX && maxBoundY > minBoundY) {
          const pad = 10;
          const cropX = Math.max(0, minBoundX - pad);
          const cropY = Math.max(0, minBoundY - pad);
          const cropW = Math.min(w - cropX, (maxBoundX - minBoundX) + pad * 2);
          const cropH = Math.min(h - cropY, (maxBoundY - minBoundY) + pad * 2);

          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = cropW;
          croppedCanvas.height = cropH;
          const croppedCtx = croppedCanvas.getContext('2d');
          if (croppedCtx) {
            croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            resolve(croppedCanvas.toDataURL('image/png'));
            return;
          }
        }

        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error('Error cleaning signature image:', e);
        resolve(imageSrc);
      }
    };

    img.onerror = () => {
      resolve(imageSrc);
    };

    img.src = imageSrc;
  });
}
