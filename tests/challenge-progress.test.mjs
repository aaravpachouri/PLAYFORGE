import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeChallengeDays, parseLegacyChallengeDays } from '../src/challenge-progress.ts';

test('normalizes challenge indexes from numbers and database rows', () => {
  assert.deepEqual(
    normalizeChallengeDays([0, 3, { day_index: 2 }, { day_index: '6' }, 3, -1, 7, 'bad']),
    [0, 2, 3, 6],
  );
});

test('returns an empty list for malformed or non-array values', () => {
  assert.deepEqual(normalizeChallengeDays(null), []);
  assert.deepEqual(parseLegacyChallengeDays('{not json'), []);
  assert.deepEqual(parseLegacyChallengeDays(null), []);
});

test('reads and normalizes the legacy browser checklist', () => {
  assert.deepEqual(parseLegacyChallengeDays('[0,1,1,5,9]'), [0, 1, 5]);
});
