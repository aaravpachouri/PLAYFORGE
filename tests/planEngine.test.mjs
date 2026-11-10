import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrainingWeek } from '../src/planEngine.ts';

const makeProfile = (level, environment = 'home', ageBand = '18-64', goal = 'strength') => ({
  goal,
  level,
  minutes: 25,
  environment,
  ageBand,
});

const sessionsFor = profile => buildTrainingWeek(profile, '2026-11-10', '2026-11-10', 0);
const exercisesFor = sessions => sessions.flatMap(day => day.sessions).flatMap(session => session.exercises);
const mainExercises = sessions => exercisesFor(sessions).filter(exercise => exercise.category === 'main');

test('beginner profiles get shorter targets and a lower set ceiling', () => {
  const sessions = sessionsFor(makeProfile('new'));
  const main = mainExercises(sessions);
  assert.ok(main.length > 0);
  assert.ok(main.every(exercise => exercise.sets <= 2));
  assert.ok(sessions.flatMap(day => day.sessions).every(session => session.intensity !== 'vigorous'));
  assert.ok(main.some(exercise => /[4-8]/.test(exercise.target)));
  const perSide = main.filter(exercise => /each side$/i.test(exercise.target));
  assert.ok(perSide.length > 0);
  assert.ok(perSide.every(exercise => Number.parseInt(exercise.target, 10) < 6));
});

test('regular profiles get harder movement options and more working sets', () => {
  const sessions = sessionsFor(makeProfile('regular'));
  const main = mainExercises(sessions);
  const names = main.map(exercise => exercise.name);
  assert.ok(names.some(name => [
    'Tempo bodyweight squats',
    'Floor push-ups',
    'Single-leg glute bridges',
    'Supported reverse lunges',
    'Forearm plank',
  ].includes(name)));
  assert.ok(main.some(exercise => exercise.sets >= 3));
  assert.ok(main.every(exercise => exercise.sets <= 4));
});

test('gym environment uses gym-appropriate advanced options', () => {
  const sessions = sessionsFor(makeProfile('regular', 'gym'));
  const names = mainExercises(sessions).map(exercise => exercise.name);
  assert.ok(names.some(name => name === 'Goblet squats' || name === 'Seated cable rows'));
});

test('teen and older-adult profiles keep volume and intensity limits', () => {
  const teen = sessionsFor(makeProfile('regular', 'home', '13-17'));
  const older = sessionsFor(makeProfile('regular', 'home', '65+'));
  assert.ok(teen.flatMap(day => day.sessions).every(session => session.intensity !== 'vigorous'));
  assert.ok(mainExercises(teen).every(exercise => exercise.sets <= 3));
  assert.ok(mainExercises(older).every(exercise => exercise.sets <= 2));
  assert.ok(!mainExercises(older).some(exercise => /single-leg glute bridge|floor push-ups|reverse lunges|forearm plank/i.test(exercise.name)));
});

test('every generated exercise includes actionable form and safety coaching', () => {
  const sessions = sessionsFor(makeProfile('regular'));
  const exercises = exercisesFor(sessions);
  assert.ok(exercises.length > 0);
  for (const exercise of exercises) {
    assert.ok(exercise.formGuide.setup, `${exercise.name} needs a setup cue`);
    assert.ok(exercise.formGuide.steps.length >= 2, `${exercise.name} needs movement steps`);
    assert.ok(exercise.formGuide.breathing, `${exercise.name} needs breathing guidance`);
    assert.ok(exercise.formGuide.commonMistakes.length >= 2, `${exercise.name} needs common form checks`);
    assert.ok(exercise.formGuide.easierOption, `${exercise.name} needs an easier variation`);
    assert.ok(exercise.formGuide.challengeOption, `${exercise.name} needs a progression cue`);
    assert.ok(exercise.formGuide.safetyCue, `${exercise.name} needs a safety cue`);
  }
});

test('four-week progression still enters a lower-volume consolidation week', () => {
  const profile = makeProfile('regular');
  const weekOne = sessionsFor(profile);
  const weekFour = buildTrainingWeek(profile, '2026-12-01', '2026-11-10', 0);
  assert.ok(weekOne.flatMap(day => day.sessions).every(session => session.phaseWeek === 1));
  assert.ok(weekFour.flatMap(day => day.sessions).every(session => session.phaseWeek === 4));
  assert.ok(weekFour.flatMap(day => day.sessions).every(session => session.intensity !== 'vigorous'));
});
