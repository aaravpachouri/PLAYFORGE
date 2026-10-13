import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupMealPhoto } from '../mealPhotos.mjs';

const originalFetch = globalThis.fetch;
const commonsPayload = (overrides = {}) => ({
  query: { pages: { '123': {
    title: 'File:Masala_Paneer_Plate.jpg',
    imageinfo: [{
      thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Paneer.jpg/760px-Paneer.jpg',
      descriptionurl: 'https://commons.wikimedia.org/wiki/File:Masala_Paneer_Plate.jpg',
      mime: 'image/jpeg',
      extmetadata: {
        Artist: { value: '<a href="https://commons.wikimedia.org/wiki/User:Test">Sample Photographer</a>' },
        LicenseShortName: { value: 'CC BY-SA 4.0' },
        LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0/' },
      },
      ...overrides,
    }],
  } } },
});
function jsonResponse(payload, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

test('finds a real matching Commons file and returns source/licence attribution', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url: String(url), options }); return jsonResponse(commonsPayload()); };
  try {
    const result = await lookupMealPhoto('Masala paneer plate');
    assert.ok(result);
    assert.match(result.photoUrl, /^https:\/\/upload\.wikimedia\.org\//);
    assert.match(result.sourceUrl, /^https:\/\/commons\.wikimedia\.org\//);
    assert.equal(result.license, 'CC BY-SA 4.0');
    assert.equal(result.creator, 'Sample Photographer');
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /gsrnamespace=6/);
  } finally { globalThis.fetch = originalFetch; }
});

test('rejects untrusted image hosts and non-photo matches', async () => {
  globalThis.fetch = async () => jsonResponse({
    query: { pages: { '1': { title: 'File:Masala_Paneer.jpg', imageinfo: [{
      thumburl: 'https://example.com/fake.jpg',
      descriptionurl: 'https://commons.wikimedia.org/wiki/File:Masala_Paneer.jpg',
      mime: 'image/jpeg', extmetadata: {},
    }] } } },
  });
  try { assert.equal(await lookupMealPhoto('Masala paneer untrusted host'), null); }
  finally { globalThis.fetch = originalFetch; }
});

test('does not cache temporary upstream failures, allowing a later retry', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; if (calls === 1) throw new Error('network offline'); return jsonResponse(commonsPayload()); };
  try {
    assert.equal(await lookupMealPhoto('retry test masala paneer'), null);
    const result = await lookupMealPhoto('retry test masala paneer');
    assert.ok(result);
    assert.equal(calls, 2);
  } finally { globalThis.fetch = originalFetch; }
});
