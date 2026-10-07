import { games } from './games.js';

const grid = document.querySelector('#game-grid');
const status = document.querySelector('#status');
const filters = document.querySelector('#filters');
const dialog = document.querySelector('#pick-dialog');
const lastGameKey = 'coco-game-index:last-game:v1';
let selectedGame;

function rememberGame(id) {
  // 只记录入口使用情况，绝不读写各个游戏的存档。
  try { localStorage.setItem(lastGameKey, id); } catch { /* 禁止存储时仍然能打开游戏。 */ }
}

function bindGameLink(link, game) {
  link.href = game.url;
  link.dataset.gameId = game.id;
  link.addEventListener('click', () => rememberGame(game.id));
  link.addEventListener('auxclick', (event) => {
    if (event.button === 1) rememberGame(game.id);
  });
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
  const title = document.createElement('h3');
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

function renderGames(filter = 'all') {
  const visible = games.filter((game) => filter === 'all' || game.category === filter);
  grid.replaceChildren(...visible.map(gameCard));
  if (!visible.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-message';
    empty.textContent = '这里还没有游戏，试试「全部游戏」吧。';
    grid.append(empty);
  }
  document.querySelector('#game-count').textContent = `${visible.length} 个游戏`;
  status.textContent = `显示 ${visible.length} 个游戏`;
  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
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
  link.href = game.url;
  link.setAttribute('aria-label', `再去玩：${game.title}`);
  link.onclick = () => rememberGame(game.id);
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
  link.href = selectedGame.url;
  link.onclick = () => rememberGame(selectedGame.id);
  link.setAttribute('aria-label', `就玩这个：${selectedGame.title}`);
  document.querySelector('#pick-again').disabled = games.length < 2;
  if (!dialog.open) dialog.showModal();
}

filters.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (button) renderGames(button.dataset.filter);
});
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
filters.hidden = false;
document.querySelector('#surprise').hidden = !games.length;
