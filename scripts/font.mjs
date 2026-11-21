import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliDecompressSync } from 'node:zlib';
import { allGamesLabel, categories, games } from '../games.js';

export const roundedFontFile = 'assets/resource-han-rounded-bold.woff2';

// 静态圆体文案来自标题和 data-rounded 元素，动态文案来自游戏目录。
export async function roundedFontText() {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const elements = [
    ...markup.matchAll(/<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi),
    ...markup.matchAll(/<([\w-]+)\b[^>]*\sdata-rounded\b[^>]*>([\s\S]*?)<\/\1>/gi),
  ];
  const labels = elements.map(([, , content]) => content.replace(/<[^>]*>/g, ''));
  const ascii = Array.from({ length: 95 }, (_, index) => String.fromCharCode(32 + index)).join('');
  const text = [ascii, ...labels, allGamesLabel, ...categories.map((category) => category.title), ...games.map((game) => game.title)].join('');
  return [...new Set(text.replace(/\s/g, ''))].sort().join('');
}

// 读取 WOFF2 字体 cmap 中真正有字形的码位，用于校验子集是否缺字。
export function woff2Codepoints(buffer) {
  let offset = 48;
  const readBase128 = () => {
    let value = 0;
    for (let index = 0; index < 5; index++) {
      const byte = buffer[offset++];
      value = value * 128 + (byte & 127);
      if (!(byte & 128)) return value;
    }
    throw new Error('Invalid WOFF2 UIntBase128.');
  };
  const tables = [];
  for (let index = buffer.readUInt16BE(12); index > 0; index--) {
    const flags = buffer[offset++];
    const tag = flags & 63;
    if (tag === 63) offset += 4;
    const length = readBase128();
    const version = flags >> 6;
    const transformed = tag === 10 || tag === 11 ? version !== 3 : version !== 0;
    tables.push({ tag, length: transformed ? readBase128() : length });
  }
  const data = brotliDecompressSync(buffer.subarray(offset, offset + buffer.readUInt32BE(20)));
  let cmap = 0;
  for (const table of tables) {
    if (table.tag === 0) break;
    cmap += table.length;
  }
  const codepoints = new Set();
  for (let record = 0; record < data.readUInt16BE(cmap + 2); record++) {
    const subtable = cmap + data.readUInt32BE(cmap + 4 + record * 8 + 4);
    const format = data.readUInt16BE(subtable);
    if (format === 12) {
      for (let group = 0; group < data.readUInt32BE(subtable + 12); group++) {
        const at = subtable + 16 + group * 12;
        for (let code = data.readUInt32BE(at); code <= data.readUInt32BE(at + 4); code++) codepoints.add(code);
      }
    } else if (format === 4) {
      const segments = data.readUInt16BE(subtable + 6) / 2;
      const ends = subtable + 14;
      const starts = ends + segments * 2 + 2;
      const deltas = starts + segments * 2;
      const rangeOffsets = deltas + segments * 2;
      for (let segment = 0; segment < segments; segment++) {
        const start = data.readUInt16BE(starts + segment * 2);
        const end = data.readUInt16BE(ends + segment * 2);
        const delta = data.readUInt16BE(deltas + segment * 2);
        const rangeOffset = data.readUInt16BE(rangeOffsets + segment * 2);
        for (let code = start; code <= end && code !== 0xffff; code++) {
          let glyph = code;
          if (rangeOffset) glyph = data.readUInt16BE(rangeOffsets + segment * 2 + rangeOffset + (code - start) * 2);
          if (glyph && (glyph + delta) & 0xffff) codepoints.add(code);
        }
      }
    }
  }
  return codepoints;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(await roundedFontText());
}
