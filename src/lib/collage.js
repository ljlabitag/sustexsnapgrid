// Build a 3x3 bingo collage onto a canvas and return a Blob + dataURL.
// Inputs:
// - photosByIndex: { "0": dataURL, "1": dataURL, ..., "8": dataURL } (center index 4 is the logo cell)
// - logoSrc: string (path or dataURL) for the center logo
// - prompts: string[] of length 9 (optional, used if you want to overlay labels)
// - options: { size, gap, background, drawLabels, labelColor, labelBg, font }
//
// Usage:
//   const { blob, dataUrl } = await renderBingoCollage({ photosByIndex, logoSrc, prompts });
//   // then share with Web Share API or trigger download
//
export async function renderBingoCollage({
  photosByIndex,
  logoSrc,
  prompts = [],
  options = {}
}) {
  const size = options.size ?? 1080;      // final square image resolution
  const gap = options.gap ?? 12;          // gap between cells
  const border = options.border ?? 12;    // thickness of outer border in px
  const background = options.background ?? "#ffffff";
  const drawLabels = options.drawLabels ?? false;
  const labelColor = options.labelColor ?? "#ffffff";
  const labelBg = options.labelBg ?? "rgba(0,0,0,0.45)";
  const font = options.font ?? "500 20px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";

  const canvas = document.createElement("canvas");
  canvas.width = size + border * 2;
  canvas.height = size + border * 2;
  const ctx = canvas.getContext("2d");

  // fill background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // compute cell geometry
  const cols = 3;
  const rows = 3;
  const totalGapX = gap * (cols - 1);
  const totalGapY = gap * (rows - 1);
  const cellW = Math.floor((size - totalGapX) / cols);
  const cellH = Math.floor((size - totalGapY) / rows);

  // helper to load an image element from a URL or dataURL
  function loadImage(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous"; // best effort for canvases
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // resolve null to keep going even if some images fail
      img.src = src;
    });
  }

  // object-fit: cover drawing
  function drawCover(img, x, y, w, h) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
      // fallback draw
      ctx.drawImage(img, x, y, w, h);
      return;
    }
    const ir = iw / ih;
    const cr = w / h;

    let dw = w, dh = h, dx = x, dy = y;
    if (ir > cr) {
      // image wider
      dh = h;
      dw = h * ir;
      dx = x + (w - dw) / 2;
    } else {
      // image taller
      dw = w;
      dh = w / ir;
      dy = y + (h - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // preload all 8 photos + logo
  const imgPromises = [];
  for (let i = 0; i < 9; i++) {
    if (i === 4) imgPromises.push(loadImage(logoSrc));
    else imgPromises.push(loadImage(photosByIndex?.[String(i)]));
  }
  const images = await Promise.all(imgPromises); // [0..8]

  // draw cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const x = border + c * (cellW + gap);
      const y = border + r * (cellH + gap);
      const img = images[i];

      // cell bg
      ctx.fillStyle = "#e5e7eb"; // slate-200
      ctx.fillRect(x, y, cellW, cellH);

      if (img) {
        drawCover(img, x, y, cellW, cellH);
      } else {
        // empty prompt placeholder
        ctx.fillStyle = "#9ca3af"; // gray-400
        ctx.fillRect(x, y, cellW, cellH);
      }

      // label overlay
      if (drawLabels && prompts[i]) {
        const padding = 8;
        const lineHeight = 22;
        const maxTextWidth = cellW - padding * 2;
        ctx.font = font;
        ctx.textBaseline = "alphabetic";

        // word wrap
        const lines = wrapText(ctx, prompts[i], maxTextWidth);
        const boxH = lines.length * lineHeight + padding * 2;

        // draw box
        ctx.fillStyle = labelBg;
        ctx.fillRect(x, y + cellH - boxH, cellW, boxH);

        // draw text
        ctx.fillStyle = labelColor;
        lines.forEach((line, idx) => {
          ctx.fillText(line, x + padding, y + cellH - boxH + padding + lineHeight * (idx + 0.8));
        });
      }
    }
  }

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  const dataUrl = canvas.toDataURL("image/png");
  return { blob, dataUrl };
}

// word-wrap helper
function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3); // avoid too tall labels
}

// convenience to trigger a download
export function downloadBlob(blob, filename = "bingo-collage.png") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// try sharing via Web Share API if available, otherwise download
export async function shareOrDownload(blob, filename = "bingo-collage.png") {
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: "image/png" })] })) {
    try {
      await navigator.share({
        files: [new File([blob], filename, { type: "image/png" })],
        title: "Photo Challenge Bingo",
        text: "My finished bingo card"
      });
      return;
    } catch {
      // fall through to download
    }
  }
  downloadBlob(blob, filename);
}
