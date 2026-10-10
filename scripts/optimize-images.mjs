import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { join, dirname, basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const srcDir = join(root, "src");
const galleryDir = join(srcDir, "gallery");
const outDir = join(srcDir, "optimized");
const outGallery = join(outDir, "gallery");

const THUMB_WIDTHS = [400, 800];
const FULL = { width: 1600, webp: 80 };
const HERO_WIDTHS = [640, 960, 1280];
const LOGO_WIDTHS = [400, 800];
const POSTER_WIDTHS = [640, 1280];

const THUMB = { webp: 78, avif: 50, effort: 1 };
const HERO = { webp: 62, avif: 48, effort: 2 };
const LOGO = { webp: 78, avif: 50, effort: 2 };
const POSTER = { webp: 75 };

function normalize(file) {
  return String(file || "").replace(/^\.?\/?(gallery\/)?/, "");
}

function galleryFiles() {
  const fromManifest = [];
  const manifestPath = join(srcDir, "_data", "gallery-manifest.json");
  if (existsSync(manifestPath)) {
    try {
      const { photos = [] } = JSON.parse(readFileSync(manifestPath, "utf8"));
      photos.forEach((photo) => fromManifest.push(normalize(photo.file)));
    } catch (err) {
      console.warn(`[optimize-images] manifest inválido: ${err.message}`);
    }
  }

  const scanned = existsSync(galleryDir)
    ? readdirSync(galleryDir).filter((file) =>
        /\.(jpe?g|png|webp|gif|avif)$/i.test(file)
      )
    : [];

  return [...new Set([...fromManifest, ...scanned])].filter((file) =>
    existsSync(join(galleryDir, file))
  );
}

async function toWebp(input, outPath, width, quality, rotate) {
  let p = sharp(input);
  if (rotate) p = p.rotate();
  await p
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath);
}

async function toAvif(input, outPath, width, quality, effort, rotate) {
  let p = sharp(input);
  if (rotate) p = p.rotate();
  await p
    .resize({ width, withoutEnlargement: true })
    .avif({ quality, effort })
    .toFile(outPath);
}

async function emitSet(input, outBase, widths, preset, formats, rotate = false) {
  for (const width of widths) {
    if (formats.includes("webp")) {
      await toWebp(input, `${outBase}-${width}.webp`, width, preset.webp, rotate);
    }
    if (formats.includes("avif")) {
      await toAvif(input, `${outBase}-${width}.avif`, width, preset.avif, preset.effort, rotate);
    }
  }
}

async function optimizeGallery() {
  mkdirSync(outGallery, { recursive: true });
  const files = galleryFiles();

  for (const file of files) {
    const input = join(galleryDir, file);
    const name = basename(file, extname(file));
    await emitSet(input, join(outGallery, name), THUMB_WIDTHS, THUMB, ["avif", "webp"], true);
    await toWebp(input, join(outGallery, `${name}-full.webp`), FULL.width, FULL.webp, true);
  }

  return files.length;
}

async function optimizeAsset(input, outName, widths, preset, formats) {
  if (!existsSync(input)) return false;
  await emitSet(input, join(outDir, outName), widths, preset, formats);
  return true;
}

async function run() {
  mkdirSync(outDir, { recursive: true });

  const count = await optimizeGallery();

  await optimizeAsset(join(srcDir, "logo.png"), "logo", LOGO_WIDTHS, LOGO, ["avif", "webp"]);
  await optimizeAsset(join(galleryDir, "gallery-010.jpeg"), "hero", HERO_WIDTHS, HERO, ["avif", "webp"]);
  await optimizeAsset(join(srcDir, "youtube-poster.webp"), "youtube-poster", POSTER_WIDTHS, POSTER, ["webp"]);

  console.log(
    `[optimize-images] ${count} foto(s) da galeria + logo + hero + poster (responsivos) otimizados.`
  );
}

run().catch((err) => {
  console.error("[optimize-images] erro:", err);
  process.exit(1);
});
