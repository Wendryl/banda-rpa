const fs = require("fs");
const path = require("path");

const galleryDir = path.join(__dirname, "..", "gallery");
const optimizedDir = path.join(__dirname, "..", "optimized", "gallery");
const THUMB_WIDTHS = [400, 800];

function fileNameFor(file) {
  return String(file || "").replace(/^\.?\/?(gallery\/)?/, "");
}

function scannedPhotos() {
  if (!fs.existsSync(galleryDir)) return [];
  return fs
    .readdirSync(galleryDir)
    .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function srcset(name, ext, widths) {
  const parts = widths
    .map((width) => {
      const file = `${name}-${width}.${ext}`;
      return fs.existsSync(path.join(optimizedDir, file))
        ? `./optimized/gallery/${file} ${width}w`
        : null;
    })
    .filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function optimizedPath(name, ext) {
  const file = `${name}.${ext}`;
  return fs.existsSync(path.join(optimizedDir, file))
    ? `./optimized/gallery/${file}`
    : null;
}

module.exports = function () {
  const { photos = [] } = require("./gallery-manifest.json");
  const entries = photos.length ? photos.map((item) => fileNameFor(item.file)) : scannedPhotos();

  return entries
    .filter((file) => fs.existsSync(path.join(galleryDir, file)))
    .map((file, index) => {
      const original = `./gallery/${file}`;
      const base = file.replace(/\.[^.]+$/, "");
      const thumbWebp = srcset(base, "webp", THUMB_WIDTHS);
      return {
        src: original,
        thumbAvif: srcset(base, "avif", THUMB_WIDTHS),
        thumbWebp: thumbWebp || original,
        full: optimizedPath(`${base}-full`, "webp") || original,
        alt: `Foto ${index + 1} da galeria`,
      };
    });
};
