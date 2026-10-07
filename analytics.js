// 页面浏览由 Umami 官方脚本自动统计；这里只记录入口的游戏点击。
// 保持原生链接跳转，统计请求失败时也能正常打开游戏。
export function trackGameClick(game, source, tracker = globalThis.umami) {
  if (!game?.id || typeof tracker?.track !== 'function') return;
  try {
    const request = tracker.track('game_click', {
      game_id: game.id,
      game_title: game.title,
      entry_source: source,
    });
    Promise.resolve(request).catch(() => {});
  } catch {
    // 统计被浏览器拦截或暂不可用时，不影响入口功能。
  }
}
