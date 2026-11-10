import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeCompletedDays, normaliseCompletedDays } from '../src/challengeProgress.ts';

test('normalises only integer challenge days in the seven-day range', () => {
  assert.deepEqual(normaliseCompletedDays([6, 2, 2, -1, 7, 3.5, '4', null]), [2, 6]);
});

test('returns an empty list for invalid storage payloads', () => {
  assert.deepEqual(normaliseCompletedDays(null), []);
  assert.deepEqual(normaliseCompletedDays({ days: [0, 1] }), []);
  assert.deepEqual(normaliseCompletedDays('0,1,2'), []);
});

test('merges guest and account progress without duplicates', () => {
  assert.deepEqual(mergeCompletedDays([0, 1, 4], [1, 2, 6], [6, 9]), [0, 1, 2, 4, 6]);
});

test('does not accept boolean or string values as day indices', () => {
  assert.deepEqual(normaliseCompletedDays([false, true, '2', 2]), [2]);
});
