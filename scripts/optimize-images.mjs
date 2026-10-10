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

const PRESETS = {
  thumb: { width: 800, webp: 78, avif: 50, effort: 1 },
  full: { width: 1600, webp: 80 },
  logo: { width: 800, webp: 78, avif: 50, effort: 2 },
  hero: { width: 1280, webp: 62, avif: 48, effort: 2 },
};

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

async function emit(input, outBase, preset, formats, rotate = false) {
  let pipeline = sharp(input);
  if (rotate) pipeline = pipeline.rotate();
  pipeline = pipeline.resize({ width: preset.width, withoutEnlargement: true });

  if (formats.includes("webp")) {
    await pipeline.clone().webp({ quality: preset.webp }).toFile(`${outBase}.webp`);
  }
  if (formats.includes("avif")) {
    await pipeline
      .clone()
      .avif({ quality: preset.avif, effort: preset.effort ?? 1 })
      .toFile(`${outBase}.avif`);
  }
}

async function optimizeGallery() {
  mkdirSync(outGallery, { recursive: true });
  const files = galleryFiles();

  for (const file of files) {
    const input = join(galleryDir, file);
    const name = basename(file, extname(file));
    await emit(input, join(outGallery, name), PRESETS.thumb, ["avif", "webp"], true);
    await emit(input, join(outGallery, `${name}-full`), PRESETS.full, ["webp"], true);
  }

  return files.length;
}

async function optimizeAsset(input, outName, preset) {
  if (!existsSync(input)) return false;
  await emit(input, join(outDir, outName), preset, ["avif", "webp"]);
  return true;
}

async function run() {
  mkdirSync(outDir, { recursive: true });

  const count = await optimizeGallery();

  await optimizeAsset(join(srcDir, "logo.png"), "logo", PRESETS.logo);
  await optimizeAsset(join(galleryDir, "gallery-010.jpeg"), "hero", PRESETS.hero);

  console.log(
    `[optimize-images] ${count} foto(s) da galeria + logo + hero otimizadas.`
  );
}

run().catch((err) => {
  console.error("[optimize-images] erro:", err);
  process.exit(1);
});
