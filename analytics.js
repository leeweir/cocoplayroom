const pendingKey = 'coco-game-index:pending-clicks:v1';
const memoryClicks = [];

function readClicks(storage) {
  const raw = storage.getItem(pendingKey);
  if (!raw) return [];
  try {
    const clicks = JSON.parse(raw);
    return Array.isArray(clicks) ? clicks : [];
  } catch {
    return [];
  }
}

function sendClick(tracker, click) {
  try {
    Promise.resolve(tracker.track('game_click', click)).catch(() => {});
  } catch {
    // 统计请求失败时仍然正常打开游戏。
  }
}

export function trackGameClick(game, source, tracker = globalThis.umami) {
  if (!game?.id) return;
  const click = { game_id: game.id, game_title: game.title, entry_source: source };
  if (typeof tracker?.track === 'function') {
    sendClick(tracker, click);
    return;
  }
  // Umami 是 defer 脚本。页面已加载完仍无跟踪器时，不继续积攒点击。
  if (globalThis.document?.readyState === 'complete') return;
  try {
    const storage = globalThis.sessionStorage;
    storage.setItem(pendingKey, JSON.stringify([...readClicks(storage), click]));
  } catch {
    memoryClicks.push(click);
  }
}

export function flushGameClicks(tracker = globalThis.umami) {
  if (typeof tracker?.track !== 'function') return;
  let saved = [];
  try {
    const storage = globalThis.sessionStorage;
    const clicks = readClicks(storage);
    // 同一页面的脚本就绪和浏览器返回都可能触发补报，先取走再发。
    storage.removeItem(pendingKey);
    saved = clicks;
  } catch { /* 存储不可用时仍可发送本页内存中的点击。 */ }
  for (const click of [...saved, ...memoryClicks.splice(0)]) {
    if (click?.game_id) sendClick(tracker, click);
  }
}
