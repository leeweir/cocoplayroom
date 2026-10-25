import { categories, games } from './games.js?v=20261025-new-games';
import { trackGameClick } from './analytics.js';

const groupsContainer = document.querySelector('#game-groups');
const status = document.querySelector('#status');
const categoryNav = document.querySelector('#category-nav');
const dialog = document.querySelector('#pick-dialog');
const lastGameKey = 'coco-game-index:last-game:v1';
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

function gameCard(game) {
  const card = document.createElement('article');
  card.className = `game-card ${game.color}`;
  const link = document.createElement('a');
  link.setAttribute('aria-label', `开始玩：${game.title}`);
  bindGameLink(link, game);

  const cover = document.createElement('div');
  cover.className = 'cover';
  const image = new Image();
  image.src = game.image;
  image.alt = `${game.title}的游戏画面`;
  image.width = 1200;
  image.height = 800;
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    cover.classList.add('image-missing');
    cover.textContent = game.title;
  }, { once: true });
  cover.append(image);

  const content = document.createElement('div');
  content.className = 'card-content';
  const category = document.createElement('p');
  category.className = 'card-category';
  category.textContent = game.label;
  const title = document.createElement('h4');
  title.textContent = game.title;
  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = game.description;
  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';
  const action = document.createElement('span');
  action.textContent = '开始玩';
  const arrow = document.createElement('span');
  arrow.className = 'play-arrow';
  arrow.textContent = '↗';
  arrow.setAttribute('aria-hidden', 'true');
  bottom.append(action, arrow);
  content.append(category, title, description, bottom);
  link.append(cover, content);
  card.append(link);
  return card;
}

function renderGames() {
  const sections = [];
  const links = [];
  for (const category of categories) {
    const members = games.filter((game) => game.category === category.id);
    if (!members.length) continue;
    const section = document.createElement('section');
    section.className = 'game-group';
    section.id = `category-${category.id}`;
    section.tabIndex = -1;
    section.setAttribute('aria-labelledby', `${section.id}-title`);
    const header = document.createElement('div');
    header.className = 'group-heading';
    const title = document.createElement('h3');
    title.id = `${section.id}-title`;
    title.textContent = category.title;
    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = `${members.length} 个游戏`;
    title.append(count);
    const description = document.createElement('p');
    description.textContent = category.description;
    header.append(title, description);
    const grid = document.createElement('div');
    grid.className = 'game-grid';
    grid.append(...members.map(gameCard));
    section.append(header, grid);
    sections.push(section);

    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `${location.pathname}${location.search}#${section.id}`;
    const label = document.createElement('span');
    label.textContent = category.title;
    const total = document.createElement('span');
    total.className = 'nav-count';
    total.textContent = String(members.length);
    total.setAttribute('aria-label', `${members.length} 个游戏`);
    link.append(label, total);
    item.append(link);
    links.push(item);
  }
  groupsContainer.replaceChildren(...sections);
  document.querySelector('#category-links').replaceChildren(...links);
  categoryNav.hidden = !sections.length;
  if (!sections.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-message';
    empty.textContent = '新的小游戏正在准备，过一会儿再来看看吧。';
    groupsContainer.append(empty);
  }
  document.querySelector('#game-count').textContent = `${games.length} 个游戏 / ${sections.length} 种玩法`;
  status.textContent = `全部 ${games.length} 个游戏，已按 ${sections.length} 种玩法分组。`;
  refreshCategoryLocation();
}

function refreshCategoryLocation() {
  for (const link of categoryNav.querySelectorAll('a')) {
    if (link.hash === location.hash) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

function refreshRecent() {
  let id;
  try { id = localStorage.getItem(lastGameKey); } catch { return; }
  const game = games.find((item) => item.id === id);
  document.querySelector('#recent').hidden = !game;
  if (!game) return;
  document.querySelector('#recent-title').textContent = game.title;
  const link = document.querySelector('#recent-link');
  bindGameLink(link, game, 'recent');
  link.setAttribute('aria-label', `再去玩：${game.title}`);
}

function pickGame() {
  const alternatives = games.filter((game) => game.id !== selectedGame?.id);
  const pool = alternatives.length ? alternatives : games;
  if (!pool.length) return;
  selectedGame = pool[Math.floor(Math.random() * pool.length)];
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
