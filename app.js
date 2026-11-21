import { categories, games } from './games.js';
import { trackGameClick } from './analytics.js';

const groupsContainer = document.querySelector('#game-groups');
const status = document.querySelector('#status');
const categoryNav = document.querySelector('#category-nav');
const dialog = document.querySelector('#pick-dialog');
const lastGameKey = 'coco-game-index:last-game:v1';
const categoryById = new Map(categories.map((category) => [category.id, category]));
const activeCategories = categories.filter((category) => games.some((game) => game.category === category.id));
let selectedGame;

function rememberGame(id) {
  // 只记录入口使用情况，绝不读写各个游戏的存档。
  try { localStorage.setItem(lastGameKey, id); } catch { /* 禁止存储时仍然能打开游戏。 */ }
}

function openGame(game, source) {
  rememberGame(game.id);
  trackGameClick(game, source);
}

function bindGameLink(link, game, source = 'card') {
  link.href = game.url;
  link.dataset.gameId = game.id;
  link.dataset.entrySource = source;
  // 使用可替换的处理函数，避免刷新「上次玩了」或随机推荐时重复埋点。
  link.onclick = () => openGame(game, source);
  link.onauxclick = (event) => {
    if (event.button === 1) openGame(game, source);
  };
}

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#icon-${name}`);
  svg.append(use);
  return svg;
}

function gameCard(game) {
  const card = document.createElement('article');
  card.className = 'game-card';
  card.dataset.category = game.category;
  const link = document.createElement('a');
  link.setAttribute('aria-label', `开始玩：${game.title}`);
  bindGameLink(link, game);

  const cover = document.createElement('div');
  cover.className = 'cover';
  const image = new Image();
  image.src = game.image;
  image.alt = `${game.title}的游戏画面`;
  image.width = 800;
  image.height = 600;
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    cover.classList.add('image-missing');
    cover.textContent = game.title;
  }, { once: true });
  cover.append(image);

  const category = document.createElement('p');
  category.className = 'card-category';
  category.append(icon(game.category), categoryById.get(game.category).title);
  const title = document.createElement('h3');
  title.textContent = game.title;
  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = game.description;
  link.append(cover, category, title, description);
  card.append(link);
  return card;
}

function renderGames() {
  const cards = games.map(gameCard);
  const links = [{ id: '', title: '全部', count: games.length }, ...activeCategories.map((category) => ({
    ...category, count: games.filter((game) => game.category === category.id).length,
  }))].map((category) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const hash = category.id ? `category-${category.id}` : 'games';
    link.href = `${location.pathname}${location.search}#${hash}`;
    link.dataset.category = category.id || 'all';
    if (category.id) link.id = hash;
    const label = document.createElement('span');
    label.textContent = category.title;
    const total = document.createElement('span');
    total.className = 'nav-count';
    const unit = document.createElement('span');
    unit.className = 'sr-only';
    unit.textContent = '个游戏';
    total.append(String(category.count), unit);
    link.append(icon(link.dataset.category), label, total);
    item.append(link);
    return item;
  });
  groupsContainer.replaceChildren(...cards);
  document.querySelector('#category-links').replaceChildren(...links);
  categoryNav.hidden = !cards.length;
  if (!cards.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-message';
    empty.textContent = '新的小游戏正在准备，过一会儿再来看看吧。';
    groupsContainer.append(empty);
  }
  refreshCategoryLocation();
}

function refreshCategoryLocation() {
  const selected = activeCategories.find((category) => location.hash === `#category-${category.id}`);
  let visible = 0;
  for (const card of groupsContainer.querySelectorAll('.game-card')) {
    card.hidden = !!selected && card.dataset.category !== selected.id;
    if (!card.hidden) visible++;
  }
  for (const link of categoryNav.querySelectorAll('a')) {
    if (link.hash === (selected ? location.hash : '#games')) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  // 筛选后卡片上的分类标签与标题重复，只在「全部」中显示。
  groupsContainer.classList.toggle('is-filtered', !!selected);
  document.querySelector('#games-title').textContent = selected?.title ?? '所有游戏';
  status.textContent = `正在显示${selected?.title ?? '全部'}，共 ${visible} 个游戏。`;
}

function refreshRecent() {
  let id;
  try { id = localStorage.getItem(lastGameKey); } catch { return; }
  const game = games.find((item) => item.id === id);
  document.querySelector('#recent').hidden = !game;
  if (!game) return;
  document.querySelector('#recent-title').textContent = game.title;
  document.querySelector('#recent-image').src = game.image;
  const link = document.querySelector('#recent-link');
  bindGameLink(link, game, 'recent');
  link.setAttribute('aria-label', `再去玩：${game.title}`);
}

function pickGame() {
  const alternatives = games.filter((game) => game.id !== selectedGame?.id);
  const pool = alternatives.length ? alternatives : games;
  if (!pool.length) return;
  selectedGame = pool[Math.floor(Math.random() * pool.length)];
  dialog.dataset.category = selectedGame.category;
  document.querySelector('#pick-title').textContent = selectedGame.title;
  document.querySelector('#pick-description').textContent = selectedGame.description;
  const image = document.querySelector('#pick-image');
  image.hidden = false;
  image.onerror = () => { image.hidden = true; };
  image.src = selectedGame.image;
  image.alt = `${selectedGame.title}的游戏画面`;
  const link = document.querySelector('#pick-link');
  bindGameLink(link, selectedGame, 'random');
  link.setAttribute('aria-label', `就玩这个：${selectedGame.title}`);
  document.querySelector('#pick-again').disabled = games.length < 2;
  if (!dialog.open) dialog.showModal();
}

window.addEventListener('hashchange', refreshCategoryLocation);
document.querySelector('#surprise').addEventListener('click', pickGame);
document.querySelector('#pick-again').addEventListener('click', pickGame);
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
window.addEventListener('pageshow', refreshRecent);
window.addEventListener('storage', (event) => {
  if (event.key === lastGameKey || event.key === null) refreshRecent();
});

renderGames();
refreshRecent();
document.querySelector('#surprise').hidden = !games.length;
