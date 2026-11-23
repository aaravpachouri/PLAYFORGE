import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const challengeHtml = await readFile(new URL('../public/challenge/index.html', import.meta.url), 'utf8');
const challengeAuth = await readFile(new URL('../src/challenge-auth.ts', import.meta.url), 'utf8');
const accountShell = await readFile(new URL('../src/auth/MultiUserApp.tsx', import.meta.url), 'utf8');

test('signed-out visitors can read all seven challenge days and How it works', () => {
  assert.match(challengeHtml, /<main class="wrap" id="challengeContent">(?! hidden)/);
  assert.match(challengeHtml, /id="challenge"/);
  assert.match(challengeHtml, /id="how-it-works"/);
  assert.match(challengeHtml, /Explore all 7 days first/);
  for (let day = 0; day < 7; day += 1) assert.match(challengeHtml, new RegExp('data-day="' + day + '" disabled'));
  assert.match(challengeAuth, /challengeContent\.hidden = false;/);
  assert.match(challengeAuth, /challengeFooter\.hidden = false;/);
});

test('signed-out challenge checklist remains disabled and asks for sign-in to save', () => {
  const signedOut = challengeAuth.slice(challengeAuth.indexOf('function showSignedOut'), challengeAuth.indexOf('function updateProgress'));
  assert.match(signedOut, /input\.disabled = true;/);
  assert.match(challengeAuth, /Sign in to your PLAYFORGE account to save challenge progress/);
});

test('first-quest signup tells users an account is needed and preserves the example', () => {
  assert.match(accountShell, /Free account required to save your quests and XP across devices/);
  assert.match(accountShell, /Read for 10 minutes/);
  assert.match(accountShell, /Back to PLAYFORGE overview/);
  assert.match(accountShell, /setShowIntro\(true\)/);
});
