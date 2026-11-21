import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { categories, games } from '../games.js';

const source = new URL('../', import.meta.url);
const destination = new URL('../dist/', import.meta.url);
const fallbackMarker = '<!-- build: fallback links -->';

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js', 'games.js', 'analytics.js', 'assets', '.nojekyll']) {
  await cp(new URL(file, source), new URL(file, destination), { recursive: true });
}

// 被引用的文件先算内容哈希，再把引用它的文件里的 "path" / './path' 改成 path?v=hash。
const versions = new Map();
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
async function rewrite(file, transform = (text) => text) {
  let text = transform(await readFile(new URL(file, destination), 'utf8'));
  for (const [path, version] of versions) {
    text = text.replace(new RegExp(`(["'])(\\./)?${escapeRegExp(path)}\\1`, 'g'), `$1$2${path}?v=${version}$1`);
  }
  await writeFile(new URL(file, destination), text);
}
async function stamp(file) {
  const content = await readFile(new URL(file, destination));
  versions.set(file, createHash('sha256').update(content).digest('hex').slice(0, 10));
}

// 不启用 JavaScript 时的分类链接，和卡片共用 games.js 的数据与顺序。
const escapeHtml = (text) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
const fallback = categories
  .map((category) => [category, games.filter((game) => game.category === category.id)])
  .filter(([, members]) => members.length)
  .map(([category, members]) => [
    `<section><h3>${escapeHtml(category.title)}</h3><ul>`,
    ...members.map((game) => `  <li><a href="${escapeHtml(game.url)}">${escapeHtml(game.title)}</a></li>`),
    '</ul></section>',
  ].join('\n            '))
  .join('\n            ');

for (const file of await readdir(new URL('assets/', destination))) await stamp(`assets/${file}`);
await stamp('analytics.js');
await rewrite('games.js');
await stamp('games.js');
await rewrite('app.js');
await stamp('app.js');
await rewrite('style.css');
await stamp('style.css');
await rewrite('index.html', (html) => {
  assert.ok(html.includes(fallbackMarker), `index.html: missing ${fallbackMarker}`);
  return html.replace(fallbackMarker, fallback);
});
console.log(`Built dist/: ${games.length} games, ${versions.size} content-versioned files, generated fallback links.`);
