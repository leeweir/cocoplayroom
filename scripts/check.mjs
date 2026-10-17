import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { categories, games } from '../games.js';

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
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
for (const game of games) {
  for (const key of ['id', 'title', 'description', 'label', 'image']) {
    assert.ok(typeof game[key] === 'string' && game[key].trim(), `${game.id}: missing ${key}`);
  }
  assert.ok(categoryIds.has(game.category), `${game.id}: unknown category`);
  assert.ok(['peach', 'sage', 'butter', 'pink', 'blue', 'lavender'].includes(game.color), `${game.id}: unknown color`);
  assert.equal(new URL(game.url).protocol, 'https:', `${game.id}: use HTTPS`);
  assert.ok(game.image.startsWith('assets/') && !game.image.includes('..'), `${game.id}: invalid asset path`);
  await access(new URL(`../${game.image}`, import.meta.url));
  assert.ok(html.includes(`href="${game.url}"`), `${game.id}: add the link to the noscript fallback too`);
}
for (const file of ['assets/welcome.png', 'assets/favicon.svg', 'style.css', 'app.js', 'analytics.js']) {
  await access(new URL(`../${file}`, import.meta.url));
}
for (const category of categories) {
  const members = games.filter((game) => game.category === category.id);
  if (!members.length) continue;
  const start = html.indexOf(`<h3>${category.title}</h3>`);
  assert.ok(start >= 0, `${category.id}: add the category to the noscript fallback`);
  const fallback = html.slice(start, html.indexOf('</section>', start));
  for (const game of members) {
    assert.ok(fallback.includes(`href="${game.url}"`), `${game.id}: fallback category does not match the game category`);
  }
}
console.log(`Checked ${games.length} games in ${categories.length} categories: unique ids, HTTPS URLs, local covers and fallback links.`);
