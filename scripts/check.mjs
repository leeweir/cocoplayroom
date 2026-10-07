import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { games } from '../games.js';

assert.ok(games.length > 0, 'Add at least one game.');
assert.equal(new Set(games.map((game) => game.id)).size, games.length, 'Game ids must be unique.');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
for (const game of games) {
  for (const key of ['id', 'title', 'description', 'label', 'image']) {
    assert.ok(typeof game[key] === 'string' && game[key].trim(), `${game.id}: missing ${key}`);
  }
  assert.ok(['puzzle', 'adventure', 'relax'].includes(game.category), `${game.id}: unknown category`);
  assert.ok(['peach', 'sage', 'butter', 'pink', 'blue', 'lavender'].includes(game.color), `${game.id}: unknown color`);
  assert.equal(new URL(game.url).protocol, 'https:', `${game.id}: use HTTPS`);
  assert.ok(game.image.startsWith('assets/') && !game.image.includes('..'), `${game.id}: invalid asset path`);
  await access(new URL(`../${game.image}`, import.meta.url));
  assert.ok(html.includes(`href="${game.url}"`), `${game.id}: add the link to the noscript fallback too`);
}
for (const file of ['assets/welcome.png', 'assets/favicon.svg', 'style.css', 'app.js', 'analytics.js']) {
  await access(new URL(`../${file}`, import.meta.url));
}
console.log(`Checked ${games.length} games: unique ids, HTTPS URLs, local covers and fallback links.`);
