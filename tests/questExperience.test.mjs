import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDailyLifeQuests, getCheckinReflection, getQuestAcknowledgement } from '../src/questExperience.mjs';

const build = (date, minutes = 15) => buildDailyLifeQuests({ date, minutes, goal: 'consistency', level: 'new' });

test('daily life quests cover distinct non-workout lanes', () => {
  const quests = build('2026-11-10');
  assert.deepEqual(quests.map(quest => quest.category), ['Focus', 'Discipline', 'Exploration']);
  assert.equal(new Set(quests.map(quest => quest.id)).size, 3);
  assert.ok(quests.every(quest => quest.activity === 'Other' && quest.xp === 35));
  assert.ok(quests.every(quest => !/walk|workout|exercise|gym|cycling|running|stretch/i.test(`${quest.title} ${quest.description}`)));
});

test('daily rotations avoid repeating the same quest inside a seven-day run', () => {
  const rotations = Array.from({ length: 7 }, (_, day) => build(`2026-11-${String(10 + day).padStart(2, '0')}`));
  for (let lane = 0; lane < 3; lane += 1) {
    assert.equal(new Set(rotations.map(day => day[lane].title)).size, 7);
  }
});

test('quest durations respect the player time preference', () => {
  for (const quest of build('2026-11-10', 5)) {
    assert.ok(quest.duration >= 3 && quest.duration <= 5);
  }
});

test('completion acknowledgement responds to the quest lane and player note', () => {
  assert.match(getQuestAcknowledgement('Focus'), /attention/i);
  assert.match(getQuestAcknowledgement('Exploration'), /curiosity/i);
  assert.match(getQuestAcknowledgement('Discipline', 'I adapted it and did the shorter version'), /adapting/i);
});

test('check-in reflection responds to energy and mood without diagnosing', () => {
  assert.match(getCheckinReflection({ energy: 1, mood: 'Okay' }), /lower-energy/i);
  assert.match(getCheckinReflection({ energy: 5, mood: 'Good' }), /good energy/i);
  assert.match(getCheckinReflection({ energy: 5, mood: 'Low' }), /honest/i);
});
