import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = path.join(rootDir, "public", "icons");

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#222222"/>
  <rect x="96" y="168" width="220" height="272" rx="36" stroke="#ffffff" stroke-width="28"/>
  <rect x="196" y="96" width="220" height="272" rx="36" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-width="28"/>
</svg>
`;

const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#222222"/>
  <rect x="128" y="184" width="176" height="216" rx="28" stroke="#ffffff" stroke-width="24"/>
  <rect x="208" y="112" width="176" height="216" rx="28" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-width="24"/>
</svg>
`;

const writePng = async (filename, size, svg) => {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, filename));
};

await mkdir(iconsDir, { recursive: true });

await Promise.all([
  writePng("icon-192.png", 192, iconSvg),
  writePng("icon-512.png", 512, iconSvg),
  writePng("apple-touch-icon.png", 180, iconSvg),
  writePng("icon-maskable-512.png", 512, maskableSvg),
  sharp(Buffer.from(iconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(rootDir, "public", "favicon.png")),
]);

console.log("Generated PWA icons in public/icons/");
