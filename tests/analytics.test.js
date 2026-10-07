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
