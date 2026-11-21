import assert from 'node:assert/strict';
import { test } from 'node:test';
import { trackGameClick } from '../analytics.js';

const game = { id: 'cococat', title: '喵呜小屋' };

test('game clicks carry one consistent event with game and entry source', () => {
  const events = [];
  const tracker = { track: (...args) => { events.push(args); } };
  for (const source of ['card', 'recent', 'random']) trackGameClick(game, source, tracker);
  assert.equal(events.length, 3);
  assert.deepEqual(events.map(([name, data]) => [name, data.game_id, data.entry_source]), [
    ['game_click', 'cococat', 'card'],
    ['game_click', 'cococat', 'recent'],
    ['game_click', 'cococat', 'random'],
  ]);
});

test('a missing or broken tracker does not interrupt opening a game', async () => {
  assert.doesNotThrow(() => trackGameClick(game, 'card', undefined));
  assert.doesNotThrow(() => trackGameClick(game, 'card', {}));
  assert.doesNotThrow(() => trackGameClick(game, 'card', { track() { throw new Error('blocked'); } }));
  assert.doesNotThrow(() => trackGameClick(game, 'card', { track() { return Promise.reject(new Error('offline')); } }));
  await new Promise(resolve => setImmediate(resolve));
});

test('a slow request returns immediately so navigation is not held up', () => {
  const pending = new Promise(() => {});
  assert.equal(trackGameClick(game, 'card', { track: () => pending }), undefined);
});

function useSessionStorage(t, get) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'sessionStorage', previous);
    else delete globalThis.sessionStorage;
  });
}

test('early clicks survive a same-tab navigation and are handed to Umami only once', async (t) => {
  const values = new Map();
  useSessionStorage(t, () => ({
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  }));
  const entry = await import('../analytics.js?first-visit');
  entry.trackGameClick(game, 'random', null);
  entry.trackGameClick(game, 'recent', null);
  entry.flushGameClicks(null);

  const returning = await import('../analytics.js?return-visit');
  const events = [];
  const tracker = { track: (name, data) => events.push([name, data]) };
  returning.flushGameClicks(tracker);
  returning.flushGameClicks(tracker);
  entry.flushGameClicks(tracker);
  assert.deepEqual(events, ['random', 'recent'].map(entry_source => ['game_click', {
    game_id: game.id, game_title: game.title, entry_source,
  }]));
  assert.equal(values.size, 0);
});

test('blocked session storage still allows an early click to be sent on the same page', async (t) => {
  useSessionStorage(t, () => { throw new Error('storage blocked'); });
  const entry = await import('../analytics.js?blocked-storage');
  entry.trackGameClick(game, 'card', null);
  const sources = [];
  const tracker = { track: (_, data) => sources.push(data.entry_source) };
  entry.flushGameClicks(tracker);
  entry.flushGameClicks(tracker);
  assert.deepEqual(sources, ['card']);
});
