/**
 * Generates CLARTAS PWA / app icons (PNG) from brand colors.
 * Run: node mobile/scripts/generate-icons.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const outDir = join(root, "public", "icons");
const mobileRes = join(root, "mobile", "resources");

mkdirSync(outDir, { recursive: true });
mkdirSync(mobileRes, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createPng(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1) + 1;
    for (let x = 0; x < size; x++) {
      const i = row + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const inCircle = dist < r;
      const corner = size * 0.18;
      const inRounded =
        x > corner &&
        x < size - corner &&
        y > corner &&
        y < size - corner;

      if (inCircle || inRounded) {
        const t = (dx + dy) / (size * 0.8) + 0.5;
        raw[i] = Math.min(255, 140 + t * 80);
        raw[i + 1] = Math.min(255, 60 + t * 40);
        raw[i + 2] = 255;
        raw[i + 3] = 255;
      } else {
        raw[i] = 5;
        raw[i + 1] = 5;
        raw[i + 2] = 5;
        raw[i + 3] = 255;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

const sizes = [
  { name: "icon-192.png", size: 192, dirs: [outDir] },
  { name: "icon-512.png", size: 512, dirs: [outDir] },
  { name: "icon-maskable-512.png", size: 512, dirs: [outDir] },
  { name: "icon.png", size: 1024, dirs: [mobileRes] },
  { name: "splash.png", size: 2732, dirs: [mobileRes] },
];

for (const { name, size, dirs } of sizes) {
  const png = createPng(size);
  for (const dir of dirs) {
    writeFileSync(join(dir, name), png);
  }
  console.log(`Generated ${name} (${size}x${size})`);
}
