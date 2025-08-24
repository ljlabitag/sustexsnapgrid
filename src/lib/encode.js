// Crop an image to a centered square and return as a compressed data URL

export async function fileToSquareDataURL(file, {
  side = 1024,      // final square dimension
  quality = 0.72,   // JPEG/WebP quality
} = {}) {
  const img = await readImage(file);

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const minSide = Math.min(iw, ih);

  // crop box (centered square)
  const sx = (iw - minSide) / 2;
  const sy = (ih - minSide) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    img,
    sx, sy, minSide, minSide,  // source crop
    0, 0, side, side           // destination square
  );

  const mime = supportsWebP() ? "image/webp" : "image/jpeg";
  return canvas.toDataURL(mime, quality);
}

// helpers
function readImage(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function supportsWebP() {
  try {
    const c = document.createElement("canvas");
    return c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}
