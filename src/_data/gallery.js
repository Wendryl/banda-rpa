const fs = require("fs");
const path = require("path");

const galleryDir = path.join(__dirname, "..", "gallery");

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

module.exports = function () {
  const { photos = [] } = require("./gallery-manifest.json");
  const entries = photos.length ? photos.map((item) => fileNameFor(item.file)) : scannedPhotos();

  return entries
    .filter((file) => fs.existsSync(path.join(galleryDir, file)))
    .map((file, index) => ({
      src: `./gallery/${file}`,
      alt: `Foto ${index + 1} da galeria`,
    }));
};