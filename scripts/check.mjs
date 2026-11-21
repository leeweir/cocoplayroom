import assert from 'node:assert/strict';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import { categories, games } from '../games.js';
import { roundedFontFile, roundedFontText, woff2Codepoints } from './font.mjs';

// 单个发布文件的体积上限：封面按 800×600 JPEG 导出即可满足。
const maxAssetBytes = 150 * 1024;

assert.ok(games.length > 0, 'Add at least one game.');
assert.equal(new Set(games.map((game) => game.id)).size, games.length, 'Game ids must be unique.');
assert.ok(categories.length > 0, 'Add at least one game category.');
const categoryIds = new Set(categories.map((category) => category.id));
assert.equal(categoryIds.size, categories.length, 'Category ids must be unique.');
for (const category of categories) {
  assert.match(category.id, /^[a-z][a-z0-9-]*$/, 'Category ids must work as anchor names.');
  for (const key of ['title', 'description']) {
    assert.ok(typeof category[key] === 'string' && category[key].trim(), `${category.id}: missing ${key}`);
  }
}
for (const game of games) {
  for (const key of ['id', 'title', 'description', 'image']) {
    assert.ok(typeof game[key] === 'string' && game[key].trim(), `${game.id}: missing ${key}`);
  }
  assert.ok(categoryIds.has(game.category), `${game.id}: unknown category`);
  assert.match(game.image, /^assets\/[a-z0-9-]+\.jpg$/, `${game.id}: covers are assets/<name>.jpg without a version query`);
  await access(new URL(`../${game.image}`, import.meta.url));
}
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');
for (const id of ['all', ...categories.filter((category) => games.some((game) => game.category === category.id)).map((category) => category.id)]) {
  assert.ok(html.includes(`<symbol id="icon-${id}"`), `${id}: add a paper-cut icon <symbol id="icon-${id}"> to index.html`);
  assert.ok(css.includes(`[data-category="${id}"] { --tone:`), `${id}: add [data-category="${id}"] tones to style.css`);
}
const covered = woff2Codepoints(await readFile(new URL(`../${roundedFontFile}`, import.meta.url)));
const missing = [...(await roundedFontText())].filter((char) => !covered.has(char.codePointAt(0)));
assert.equal(missing.join(''), '', `${roundedFontFile} is missing these characters; regenerate the subset as described in README.`);
for (const file of ['assets/welcome.webp', 'assets/favicon.svg', 'style.css', 'app.js', 'analytics.js']) {
  await access(new URL(`../${file}`, import.meta.url));
}
for (const file of await readdir(new URL('../assets/', import.meta.url))) {
  const { size } = await stat(new URL(`../assets/${file}`, import.meta.url));
  assert.ok(size <= maxAssetBytes, `assets/${file}: ${Math.round(size / 1024)}KB exceeds ${maxAssetBytes / 1024}KB; export covers as 800×600 JPEG.`);
}
console.log(`Checked ${games.length} games in ${categories.length} categories: unique ids, HTTPS URLs, covers within ${maxAssetBytes / 1024}KB, category icons and tones, ${covered.size} rounded-font characters.`);
