/**
 * Genera favicon.ico, PNGs y og-image.png para TEDxUC Asunción.
 * Usa @resvg/resvg-js (sin deps de sistema) + PNG encoder puro en Node.
 */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { deflateSync } from 'zlib';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = resolve(__dirname, '..');
const SVG_PATH = resolve(ROOT, 'public', 'nanduti.svg');
const OUT      = resolve(ROOT, 'public');

const svgSource = readFileSync(SVG_PATH, 'utf8');
const BG = { r: 11, g: 10, b: 8 };   // --bg del proyecto

// ── CRC32 (necesario para PNG) ────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const len = Buffer.alloc(4); len.writeUInt32BE(d.length, 0);
  const chk = Buffer.alloc(4); chk.writeUInt32BE(crc32(Buffer.concat([t, d])), 0);
  return Buffer.concat([len, t, d, chk]);
}

function encodePNG(pixels, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const di = y * (1 + w * 4) + 1 + x * 4;
      raw[di]   = pixels[si]; raw[di+1] = pixels[si+1];
      raw[di+2] = pixels[si+2]; raw[di+3] = pixels[si+3];
    }
  }

  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 6 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function buildICO(entries) {
  // entries: Array<{ size, pngBuf }>
  const n = entries.length;
  const headerSize = 6 + n * 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(n, 4);

  let offset = headerSize;
  const parts = [header];
  entries.forEach(({ size, pngBuf }, i) => {
    const d = 6 + i * 16;
    header[d]   = size >= 256 ? 0 : size;
    header[d+1] = size >= 256 ? 0 : size;
    header[d+2] = header[d+3] = 0;
    header.writeUInt16LE(1,  d+4);
    header.writeUInt16LE(32, d+6);
    header.writeUInt32LE(pngBuf.length, d+8);
    header.writeUInt32LE(offset, d+12);
    offset += pngBuf.length;
    parts.push(pngBuf);
  });
  return Buffer.concat(parts);
}

// ── Renderizar SVG en tamaño `size` sobre fondo circular oscuro ────────────
function renderAt(size) {
  const resvg = new Resvg(svgSource, { fitTo: { mode: 'width', value: size } });
  const png   = resvg.render();
  const raw   = png.pixels;   // RGBA Uint8Array
  const rw    = png.width;
  const rh    = png.height;

  const out = new Uint8Array(size * size * 4);
  const cx = size / 2, cy = size / 2, r2 = (size / 2) ** 2;
  const ox = Math.round((size - rw) / 2);
  const oy = Math.round((size - rh) / 2);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if ((x-cx)**2 + (y-cy)**2 > r2) { out[i+3] = 0; continue; } // fuera del circulo

      let pr = BG.r, pg = BG.g, pb = BG.b, pa = 255;
      const sx = x - ox, sy = y - oy;
      if (sx >= 0 && sx < rw && sy >= 0 && sy < rh) {
        const si = (sy * rw + sx) * 4;
        const a  = raw[si+3] / 255;
        if (a > 0) {
          pr = raw[si]   * a + BG.r * (1-a) | 0;
          pg = raw[si+1] * a + BG.g * (1-a) | 0;
          pb = raw[si+2] * a + BG.b * (1-a) | 0;
        }
      }
      out[i] = pr; out[i+1] = pg; out[i+2] = pb; out[i+3] = pa;
    }
  }
  return { pixels: out, w: size, h: size };
}

// ── Main ──────────────────────────────────────────────────────────────────
console.log('Generando favicons para TEDxUC Asunción …\n');

const SIZES = [16, 32, 48, 180, 192, 512];
const imgs  = {};

for (const s of SIZES) {
  process.stdout.write(`  Renderizando ${s}×${s} px … `);
  const img = renderAt(s);
  imgs[s] = { ...img, png: encodePNG(img.pixels, img.w, img.h) };
  process.stdout.write('✓\n');
}

// favicon.ico — 16, 32, 48 px embedded PNGs
const ico = buildICO([16, 32, 48].map(s => ({ size: s, pngBuf: imgs[s].png })));
writeFileSync(resolve(OUT, 'favicon.ico'), ico);
console.log('\n  ✓ favicon.ico        (16, 32, 48 px)');

writeFileSync(resolve(OUT, 'favicon-32.png'),        imgs[32].png);
writeFileSync(resolve(OUT, 'apple-touch-icon.png'),  imgs[180].png);
writeFileSync(resolve(OUT, 'favicon-192.png'),       imgs[192].png);
writeFileSync(resolve(OUT, 'favicon-512.png'),       imgs[512].png);
console.log('  ✓ favicon-32.png');
console.log('  ✓ apple-touch-icon.png  (180px)');
console.log('  ✓ favicon-192.png');
console.log('  ✓ favicon-512.png');

// og-image.png — 1200×630
console.log('\n  Generando og-image.png 1200×630 …');
const NS = 500;
const nan = renderAt(NS);
const ogW = 1200, ogH = 630;
const ogPx = new Uint8Array(ogW * ogH * 4);
for (let i = 0; i < ogW * ogH * 4; i += 4) {
  ogPx[i] = BG.r; ogPx[i+1] = BG.g; ogPx[i+2] = BG.b; ogPx[i+3] = 255;
}
const ox2 = ogW - NS - 80, oy2 = (ogH - NS) >> 1;
for (let y = 0; y < NS; y++) {
  for (let x = 0; x < NS; x++) {
    const si = (y * NS + x) * 4;
    const a  = nan.pixels[si+3] / 255;
    if (a === 0) continue;
    const dx = ox2+x, dy = oy2+y;
    if (dx < 0 || dx >= ogW || dy < 0 || dy >= ogH) continue;
    const di = (dy * ogW + dx) * 4;
    ogPx[di]   = (nan.pixels[si]   * a + BG.r * (1-a)) | 0;
    ogPx[di+1] = (nan.pixels[si+1] * a + BG.g * (1-a)) | 0;
    ogPx[di+2] = (nan.pixels[si+2] * a + BG.b * (1-a)) | 0;
    ogPx[di+3] = 255;
  }
}
writeFileSync(resolve(OUT, 'og-image.png'), encodePNG(ogPx, ogW, ogH));
console.log('  ✓ og-image.png');

console.log('\n✅ Archivos en public/\n');
