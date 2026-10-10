const fs = require("fs");
const path = require("path");

const galleryDir = path.join(__dirname, "..", "gallery");
const optimizedDir = path.join(__dirname, "..", "optimized", "gallery");

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

function optimizedPath(name, ext) {
  const candidate = path.join(optimizedDir, `${name}.${ext}`);
  return fs.existsSync(candidate) ? `./optimized/gallery/${name}.${ext}` : null;
}

module.exports = function () {
  const { photos = [] } = require("./gallery-manifest.json");
  const entries = photos.length ? photos.map((item) => fileNameFor(item.file)) : scannedPhotos();

  return entries
    .filter((file) => fs.existsSync(path.join(galleryDir, file)))
    .map((file, index) => {
      const original = `./gallery/${file}`;
      const base = file.replace(/\.[^.]+$/, "");
      return {
        src: original,
        thumbAvif: optimizedPath(base, "avif"),
        thumbWebp: optimizedPath(base, "webp") || original,
        full: optimizedPath(`${base}-full`, "webp") || original,
        alt: `Foto ${index + 1} da galeria`,
      };
    });
};
