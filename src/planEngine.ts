export type PlanActivityType = 'Walking' | 'Strength' | 'Cycling' | 'Sport' | 'Dance' | 'Yoga & mobility' | 'Other';
export type PlanIntensity = 'easy' | 'moderate' | 'vigorous';
export type ExerciseFormGuide = {
  setup: string;
  steps: string[];
  breathing: string;
  commonMistakes: string[];
  easierOption: string;
  challengeOption: string;
  safetyCue: string;
};
export type PlanExercise = {
  name: string;
  target: string;
  sets: number;
  direction: string;
  photo: string;
  restSeconds: number;
  category: 'warmup' | 'main' | 'cooldown';
  formGuide: ExerciseFormGuide;
};
export type PlannedTrainingSession = {
  id: string;
  title: string;
  focus: string;
  durationMinutes: number;
  intensity: PlanIntensity;
  activityType: PlanActivityType;
  summary: string;
  progressionNote: string;
  phaseWeek: number;
  exercises: PlanExercise[];
};
export type TrainingDay = { date: string; weekday: string; sessions: PlannedTrainingSession[] };
export type TrainingProfile = { goal: 'consistency' | 'strength' | 'energy' | 'mobility'; level: 'new' | 'returning' | 'regular'; minutes: number; environment: 'home' | 'gym' | 'outdoor' | 'mixed'; ageBand?: '13-17' | '18-64' | '65+' };

const ORIGINAL_PHOTOS = {
  warmup: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85',
  strength: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=85',
  lower: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85',
};
function originalExercisePhoto(name: string, category: PlanExercise['category']): string {
  if (category === 'warmup' || category === 'cooldown') return ORIGINAL_PHOTOS.warmup;
  if (/squat|sit-to-stand|calf|leg|lower-body|balance/i.test(name)) return ORIGINAL_PHOTOS.lower;
  return ORIGINAL_PHOTOS.strength;
}
const REP_TARGET = /^(\d+)(?:\s*[–-]\s*(\d+))?\s*reps?$/i;
const SECOND_TARGET = /^(\d+)(?:\s*[–-]\s*(\d+))?\s*sec(?:onds?)?$/i;

/**
 * Technique notes are curated, plain-language coaching cues. They are not
 * movement verification, diagnosis, or a substitute for in-person instruction.
 */
function formGuideFor(name: string, category: PlanExercise['category']): ExerciseFormGuide {
  const common = {
    breathing: 'Keep breathing naturally. Do not hold your breath or rush to finish.',
    safetyCue: 'Use a stable surface and a comfortable, pain-free range. Stop if you feel pain, dizziness, chest discomfort or unusual symptoms.',
  };
  if (/squat|sit-to-stand|reverse lunge/i.test(name)) {
    const lunge = /lunge/i.test(name);
    return {
      setup: lunge ? 'Stand tall beside a sturdy support, feet about hip-width apart.' : 'Stand with feet around shoulder-width apart. Keep a stable chair behind you if you want a depth reference.',
      steps: lunge
        ? ['Step one foot back and keep your front foot fully planted.', 'Bend both knees only as far as you can control comfortably.', 'Push through the front foot to return; finish the repetitions before switching sides.']
        : ['Send your hips back and bend your knees, keeping your whole foot on the floor.', 'Lower only as far as you can keep your balance and control.', 'Press the floor away to stand tall; keep your knees tracking in the same direction as your toes.'],
      breathing: 'Breathe in as you lower; breathe out as you stand or return to the start.',
      commonMistakes: ['Knees collapsing inward', 'Heels lifting or feet rolling inward', 'Dropping quickly or forcing extra depth'],
      easierOption: lunge ? 'Use a smaller step and hold the support with both hands, or return to sit-to-stand.' : 'Use a higher chair or a smaller range.',
      challengeOption: /goblet/i.test(name) ? 'Use only a light, manageable load and keep the same controlled range.' : 'Slow the lowering phase slightly before adding load or repetitions.',
      safetyCue: 'Keep a stable support within reach. Do not force depth or add weight if balance or technique is uncertain.',
    };
  }
  if (/push-up/i.test(name)) {
    return {
      setup: 'Place hands a little wider than shoulder-width on a stable wall, bench or floor. Keep your body in one long line.',
      steps: ['Brace gently and bend your elbows to lower your chest toward your hands.', 'Keep your elbows angled comfortably rather than flared straight out.', 'Press the surface away and return without letting your hips sag.'],
      breathing: 'Breathe in as you lower and breathe out as you press away.',
      commonMistakes: ['Hips sagging or lower back arching', 'Head dropping forward', 'Elbows flaring sharply or rushing repetitions'],
      easierOption: 'Raise your hands to a wall or sturdy counter. A higher surface makes the movement easier.',
      challengeOption: 'Lower the hand support gradually, or use floor push-ups only while every repetition stays controlled.',
      safetyCue: 'Use a surface that cannot move or tip. Stop if your wrists, shoulders or chest hurt.',
    };
  }
  if (/bridge/i.test(name)) {
    return {
      setup: 'Lie on your back with knees bent, feet flat and about hip-width apart. Keep your arms relaxed by your sides.',
      steps: ['Gently brace your middle and press through both feet.', 'Lift your hips until your shoulders, hips and knees form a comfortable line.', 'Pause briefly, then lower slowly without dropping.'],
      breathing: 'Breathe out as your hips lift; breathe in as you lower.',
      commonMistakes: ['Arching the lower back to lift higher', 'Pushing through the toes only', 'Rushing the lowering phase'],
      easierOption: 'Lift only a small distance, or keep both feet down and skip any single-leg variation.',
      challengeOption: 'Try a brief pause at the top. Single-leg versions are optional and should only be used with steady control.',
      safetyCue: 'Keep the movement comfortable and avoid pushing into lower-back pain or cramping.',
    };
  }
  if (/bird-dog/i.test(name)) {
    return {
      setup: 'Start on hands and knees with hands under shoulders and knees under hips. Keep your gaze toward the floor.',
      steps: ['Gently brace your middle while keeping your back steady.', 'Reach one arm and the opposite leg away from you without rotating your hips.', 'Return slowly and alternate sides; a smaller reach is fine.'],
      breathing: 'Breathe out as you reach and breathe in as you return.',
      commonMistakes: ['Twisting the hips', 'Lifting the leg higher than the back can stay steady', 'Rushing or holding the breath'],
      easierOption: 'Move one arm only or one leg only, keeping the other points of support still.',
      challengeOption: 'Pause for two comfortable seconds at full reach before returning.',
      safetyCue: 'Use padding under your knees if needed. Stop if your back or wrists become painful.',
    };
  }
  if (/row/i.test(name)) {
    return {
      setup: 'Choose a light backpack or a machine setting you can control. Hinge slightly at the hips and keep your back comfortable.',
      steps: ['Let the arm reach down without rounding your back.', 'Draw your elbow toward your ribs, keeping your shoulder away from your ear.', 'Lower slowly until the arm is long again.'],
      breathing: 'Breathe out as you pull; breathe in as you lower.',
      commonMistakes: ['Jerking the load', 'Shrugging the shoulder', 'Rounding the back or twisting the torso'],
      easierOption: 'Use a lighter load, a supported position or a shorter range.',
      challengeOption: 'Add a brief controlled pause at the top; increase load only in small steps.',
      safetyCue: 'Use secure equipment and a load that never makes you jerk or strain.',
    };
  }
  if (/wall angel/i.test(name)) {
    return {
      setup: 'Stand with your back near a wall. Keep your ribs relaxed and feet slightly forward if that is more comfortable.',
      steps: ['Bring your arms to a comfortable goalpost shape.', 'Slide them upward only as far as your shoulders allow without pain.', 'Return slowly while keeping your neck relaxed.'],
      breathing: common.breathing,
      commonMistakes: ['Forcing hands or elbows against the wall', 'Arching the lower back', 'Shrugging toward the ears'],
      easierOption: 'Use a smaller range or perform the movement seated.',
      challengeOption: 'Pause briefly at a comfortable point; do not chase a larger range.',
      safetyCue: 'Shoulder mobility should feel gentle, not pinchy or painful.',
    };
  }
  if (/dead bug|brace|plank/i.test(name)) {
    const plank = /plank/i.test(name);
    const deadBug = /dead bug/i.test(name);
    return {
      setup: plank
        ? 'Use a wall, sturdy bench or floor variation that lets you keep your body steady.'
        : 'For a dead bug, lie on your back with knees bent and arms pointing upward. For a standing brace, stand comfortably tall.',
      steps: plank
        ? ['Place your hands or forearms on the chosen surface.', 'Gently brace your middle and keep your body in one line.', 'Hold only while you can breathe normally, then rest.']
        : deadBug
          ? ['Gently brace so your lower back stays comfortable and steady.', 'Slowly reach the opposite arm and leg away from your body.', 'Return and alternate sides without letting your back arch.']
          : ['Gently tighten your middle as though preparing for a light nudge.', 'Keep your ribs relaxed and shoulders soft.', 'Continue breathing while holding the brace, then release.'],
      breathing: 'Keep breathing throughout. Do not hold your breath; shorten the hold if you cannot breathe normally.',
      commonMistakes: plank
        ? ['Hips sagging or lifting too high', 'Holding the breath', 'Continuing after the position becomes uncomfortable']
        : ['Lower back arching', 'Moving too quickly', 'Bracing so hard that breathing stops'],
      easierOption: plank ? 'Use a wall or higher bench instead of the floor.' : 'Keep feet down, shorten the reach or use a seated brace.',
      challengeOption: plank ? 'Lower the support gradually only while you can keep a straight, comfortable line.' : 'Extend the arm or leg a little farther while keeping your back steady.',
      safetyCue: 'Stop the hold when breathing or control changes. Do not push through back or shoulder pain.',
    };
  }
  if (/calf raise/i.test(name)) {
    return {
      setup: 'Stand near a wall or sturdy counter and rest your fingertips on it for balance.',
      steps: ['Keep your feet pointing forward and your weight spread across the foot.', 'Rise onto the balls of your feet without rocking forward.', 'Pause briefly, then lower your heels slowly.'],
      breathing: common.breathing,
      commonMistakes: ['Bouncing at the bottom', 'Rolling the ankles outward', 'Using speed instead of control'],
      easierOption: 'Use both feet and more hand support, or reduce the height of the lift.',
      challengeOption: 'Pause at the top. A supported single-leg version is optional only if balance is secure.',
      safetyCue: 'Keep support within reach and stop if you feel calf, ankle or foot pain.',
    };
  }
  if (/balance/i.test(name)) {
    return {
      setup: 'Stand beside a stable counter or wall with your eyes open and a hand close to support.',
      steps: ['Shift your weight onto one foot while keeping your hips level.', 'Lift the other foot only a little, if steady.', 'Hold briefly, set the foot down and switch sides.'],
      breathing: common.breathing,
      commonMistakes: ['Standing far from support', 'Locking the knee', 'Closing the eyes or using an unstable surface'],
      easierOption: 'Keep the toes of the free foot lightly on the floor and use both hands for support.',
      challengeOption: 'Reduce hand support gradually, but stay beside the counter.',
      safetyCue: 'Never practise balance near stairs, sharp edges or clutter. Keep a stable support within reach.',
    };
  }
  if (/cat-cow|spine movement/i.test(name)) {
    return {
      setup: 'Start on hands and knees, or sit upright on a stable chair if floor work is unsuitable.',
      steps: ['Gently round your upper back while looking toward your body.', 'Slowly return through neutral and gently lift your chest.', 'Move between the two positions without forcing the end range.'],
      breathing: 'Breathe out as you round and breathe in as you open.',
      commonMistakes: ['Throwing the head back', 'Moving quickly', 'Forcing the lower back into a deep arch'],
      easierOption: 'Use a smaller range or the seated version.',
      challengeOption: 'Make each transition slower and smoother rather than deeper.',
      safetyCue: 'Keep the range comfortable; stop if movement causes pain, tingling or dizziness.',
    };
  }
  if (/chest opener/i.test(name)) {
    return {
      setup: 'Stand beside a wall and place your forearm against it below shoulder height.',
      steps: ['Keep your shoulders relaxed and your ribs facing forward.', 'Turn your body gently away until you feel a mild stretch across the chest.', 'Hold briefly while breathing, then release and change sides.'],
      breathing: common.breathing,
      commonMistakes: ['Forcing the arm too high', 'Twisting sharply', 'Holding your breath'],
      easierOption: 'Move closer to the wall and reduce the turn.',
      challengeOption: 'Hold a little longer only if the stretch stays mild.',
      safetyCue: 'A stretch should not feel sharp, numb or pinching in the shoulder.',
    };
  }
  if (/hip hinge/i.test(name)) {
    return {
      setup: 'Stand with feet hip-width apart and knees softly bent. Keep your hands on your hips.',
      steps: ['Push your hips backward as your torso tips forward.', 'Keep your back long and stop when you feel a comfortable stretch at the hips.', 'Press through your feet and bring your hips forward to stand.'],
      breathing: 'Breathe in as your hips move back; breathe out as you stand.',
      commonMistakes: ['Rounding the back', 'Bending the knees into a squat', 'Reaching lower than your comfortable range'],
      easierOption: 'Practise moving your hips back toward a wall a short distance behind you.',
      challengeOption: 'Add a light backpack only after the unloaded movement is consistent.',
      safetyCue: 'Do not add a load until you can hinge comfortably without back pain.',
    };
  }
  if (/walk|route|hill|stairs/i.test(name)) {
    return {
      setup: 'Choose a clear, familiar route with suitable footwear and a surface you can manage.',
      steps: ['Start at an easy pace and let your breathing settle.', 'Use a pace that still allows you to speak in short sentences.', 'Slow down gradually at the end; hills and stairs are optional.'],
      breathing: 'Breathe naturally and reduce the pace if you cannot speak comfortably.',
      commonMistakes: ['Rushing the first minutes', 'Chasing speed or distance', 'Ignoring uneven surfaces or traffic'],
      easierOption: 'Use a flat route, shorten the time or keep the whole session easy.',
      challengeOption: 'Add a little time or a gentle pace change on a safe, familiar route—not both at once.',
      safetyCue: 'Stay aware of traffic, weather, daylight and your surroundings. Skip stairs or hills if they feel unsafe.',
    };
  }
  if (/dance|song|active play/i.test(name)) {
    return {
      setup: 'Choose a clear space and music you enjoy. Wear footwear suitable for the floor.',
      steps: ['Begin with easy steps, marching or swaying.', 'Add only movements you can control without jumping if that feels better.', 'Slow the movement down before finishing.'],
      breathing: 'Keep breathing naturally and pause whenever you need.',
      commonMistakes: ['Moving too quickly too soon', 'Jumping on a slippery surface', 'Copying a move that feels uncomfortable'],
      easierOption: 'Use seated movement, marching in place or small side steps.',
      challengeOption: 'Add a little more continuous movement while keeping the steps controlled.',
      safetyCue: 'Clear nearby objects and avoid slippery floors or moves that strain your joints.',
    };
  }
  if (category === 'warmup') {
    return {
      setup: 'Start in a clear space and choose a comfortable pace or range of motion.',
      steps: ['Begin with small, relaxed movements.', 'Gradually move a little more as you feel ready.', 'Keep the movement easy; this is preparation, not a test.'],
      breathing: common.breathing,
      commonMistakes: ['Starting too quickly', 'Forcing a stretch', 'Ignoring discomfort'],
      easierOption: 'Use smaller movements or remain seated.',
      challengeOption: 'Increase range slightly only if it feels comfortable.',
      safetyCue: common.safetyCue,
    };
  }
  return {
    setup: 'Finish in a clear space and choose a comfortable position.',
    steps: ['Reduce your pace gradually.', 'Let your breathing settle without forcing deep breaths.', 'Use only gentle, comfortable movement before you stop.'],
    breathing: common.breathing,
    commonMistakes: ['Stopping abruptly after a hard effort', 'Forcing a stretch', 'Ignoring pain or dizziness'],
    easierOption: 'Sit comfortably and rest until you feel settled.',
    challengeOption: 'There is no need to make a cool-down harder; keep it relaxed.',
    safetyCue: common.safetyCue,
  };
}

const ADVANCED_VARIATIONS: Record<string, { name: string; target: string; direction: string }> = {
  'Chair or bodyweight squats': { name: 'Tempo bodyweight squats', target: '8–10 reps', direction: 'Use a controlled lowering phase and stand smoothly. Keep a chair nearby as a depth guide.' },
  'Wall or incline push-ups': { name: 'Floor push-ups', target: '6–10 reps', direction: 'Use floor push-ups only if you can keep your body aligned and breathe normally; otherwise keep the incline version.' },
  'Glute bridges': { name: 'Single-leg glute bridges', target: '6 each side', direction: 'Keep the movement small and controlled. Return to the two-foot bridge if your hips rotate or your back feels strained.' },
  'Incline push-ups': { name: 'Floor push-ups', target: '6–10 reps', direction: 'Use floor push-ups only while each repetition stays controlled; raise your hands again whenever needed.' },
  'Backpack or cable rows': { name: 'Controlled rows', target: '8–12 reps', direction: 'Use a manageable backpack or cable setting, pull without jerking and lower slowly.' },
  'Sit-to-stand': { name: 'Supported reverse lunges', target: '6 each side', direction: 'Hold a sturdy support, take a short step back and use a comfortable range. Return to sit-to-stand if balance is uncertain.' },
  'Supported calf raises': { name: 'Single-leg calf raises (supported)', target: '6–8 each side', direction: 'Keep one hand on a stable support. Use a small range and return to two-foot raises if balance is uncertain.' },
  'Supported single-leg balance': { name: 'Single-leg balance reach (supported)', target: '4 each side', direction: 'Keep a hand near a counter and reach only a short distance. Use the supported balance hold if unsteady.' },
  'Dead bug or seated brace': { name: 'Dead bug with longer reach', target: '6 each side', direction: 'Extend one leg only as far as your back stays steady. Shorten the reach whenever your back arches.' },
  'Wall plank': { name: 'Forearm plank', target: '15–20 sec', direction: 'Use the floor only if you can keep a steady body line and breathe normally; otherwise return to the wall.' },
};

function advancedVariationFor(exercise: typeof library[number]['exercises'][number], profile: TrainingProfile) {
  if (profile.environment === 'gym' && exercise.name === 'Chair or bodyweight squats') {
    return { name: 'Goblet squats', target: '8–10 reps', direction: 'Hold a light dumbbell close to your chest only if you know how to use it safely. A controlled bodyweight squat is always an option.' };
  }
  if (profile.environment === 'gym' && exercise.name === 'Backpack or cable rows') {
    return { name: 'Seated cable rows', target: '8–12 reps', direction: 'Choose a light cable setting, keep your torso steady and pull without leaning back or jerking.' };
  }
  return ADVANCED_VARIATIONS[exercise.name];
}

function adjustedTargetForLevel(target: string, level: TrainingProfile['level']): string {
  if (level !== 'new') return target;
  const timedSide = target.match(/^(\d+)(?:\s*[–-]\s*(\d+))?\s*sec(?:onds?)?\s+each side$/i);
  if (timedSide) {
    const low = Math.max(8, Math.round(Number(timedSide[1]) * 0.75));
    const high = Math.max(low, Math.round(Number(timedSide[2] || timedSide[1]) * 0.8));
    return timedSide[2] ? `${low}–${high} sec each side` : `${low} sec each side`;
  }
  const perSide = target.match(/^(\d+)\s+each side$/i);
  if (perSide) return `${Math.max(3, Math.round(Number(perSide[1]) * 0.75))} each side`;
  const reps = target.match(REP_TARGET);
  if (reps) {
    const low = Math.max(4, Math.round(Number(reps[1]) * 0.75));
    const high = Math.max(low, Math.round(Number(reps[2] || reps[1]) * 0.8));
    return reps[2] ? `${low}–${high} reps` : `${low} reps`;
  }
  const seconds = target.match(SECOND_TARGET);
  if (seconds) {
    const low = Math.max(8, Math.round(Number(seconds[1]) * 0.75));
    const high = Math.max(low, Math.round(Number(seconds[2] || seconds[1]) * 0.8));
    return seconds[2] ? `${low}–${high} sec` : `${low} sec`;
  }
  return target;
}

const library: Array<Omit<PlannedTrainingSession, 'phaseWeek' | 'progressionNote' | 'exercises'> & { tags: string[]; exercises: Array<Omit<PlanExercise, 'restSeconds' | 'photo' | 'formGuide'>> }> = [
  { id: 'foundation-full-body', title: 'Full-Body Foundation', focus: 'Strength · whole body', durationMinutes: 22, intensity: 'moderate', activityType: 'Strength', summary: 'A balanced session built around familiar patterns, with easy-to-scale movements.', tags: ['consistency', 'strength'], exercises: [
    { name: 'Warm-up & mobility', target: '4 min', sets: 1, direction: 'March comfortably, roll your shoulders and move through a comfortable range.', category: 'warmup' },
    { name: 'Chair or bodyweight squats', target: '8–10 reps', sets: 2, direction: 'Use a chair as a depth guide if helpful. Keep each repetition controlled.', category: 'main' },
    { name: 'Wall or incline push-ups', target: '6–10 reps', sets: 2, direction: 'Choose a stable surface and a variation that lets you breathe normally.', category: 'main' },
    { name: 'Glute bridges', target: '8–12 reps', sets: 2, direction: 'Move smoothly without forcing your lower back into an uncomfortable position.', category: 'main' },
    { name: 'Bird-dog reach', target: '6 each side', sets: 2, direction: 'Move slowly and keep the range comfortable; use only the arm or leg if needed.', category: 'main' },
    { name: 'Cool-down walk', target: '3 min', sets: 1, direction: 'Ease down gradually and stop if anything feels painful or unusual.', category: 'cooldown' },
  ] },
  { id: 'upper-control', title: 'Upper-Body Control', focus: 'Push · pull · posture', durationMinutes: 20, intensity: 'moderate', activityType: 'Strength', summary: 'Upper-body practice with variations that work at home or in a gym.', tags: ['strength', 'consistency'], exercises: [
    { name: 'Shoulder and arm warm-up', target: '4 min', sets: 1, direction: 'Use slow arm circles and comfortable shoulder movements.', category: 'warmup' },
    { name: 'Incline push-ups', target: '6–10 reps', sets: 2, direction: 'Choose wall, counter or bench height that keeps the movement controlled.', category: 'main' },
    { name: 'Backpack or cable rows', target: '8–12 reps', sets: 2, direction: 'Use a light load, keep your back comfortable and avoid jerking the weight.', category: 'main' },
    { name: 'Wall angels', target: '8 reps', sets: 2, direction: 'Stay within a pain-free range; do not force your shoulders back.', category: 'main' },
    { name: 'Standing brace', target: '15–25 sec', sets: 2, direction: 'Breathe normally while gently bracing your midsection.', category: 'main' },
    { name: 'Relaxed mobility', target: '3 min', sets: 1, direction: 'Finish with easy shoulder, chest and upper-back movement.', category: 'cooldown' },
  ] },
  { id: 'lower-balance', title: 'Lower-Body & Balance', focus: 'Legs · hips · control', durationMinutes: 22, intensity: 'moderate', activityType: 'Strength', summary: 'A lower-body session focused on comfortable range, control and balance.', tags: ['strength', 'mobility'], exercises: [
    { name: 'Gentle warm-up walk', target: '4 min', sets: 1, direction: 'Start easy and gradually find a comfortable pace.', category: 'warmup' },
    { name: 'Sit-to-stand', target: '8–10 reps', sets: 2, direction: 'Use a stable chair and hands for support if useful.', category: 'main' },
    { name: 'Glute bridges', target: '8–12 reps', sets: 2, direction: 'Pause briefly at the top if comfortable; avoid straining your back.', category: 'main' },
    { name: 'Supported calf raises', target: '8–12 reps', sets: 2, direction: 'Hold a stable support and lift only as high as feels comfortable.', category: 'main' },
    { name: 'Supported single-leg balance', target: '15–20 sec each side', sets: 1, direction: 'Keep a hand near a wall or chair; skip this if balance feels unsafe.', category: 'main' },
    { name: 'Easy walk & stretch', target: '3 min', sets: 1, direction: 'Finish gently and stay within a comfortable range.', category: 'cooldown' },
  ] },
  { id: 'mobility-reset', title: 'Mobility Reset', focus: 'Range · breathing · recovery', durationMinutes: 16, intensity: 'easy', activityType: 'Yoga & mobility', summary: 'A low-pressure option for days when you want to move without chasing intensity.', tags: ['mobility', 'energy', 'consistency'], exercises: [
    { name: 'Easy breathing & walk', target: '3 min', sets: 1, direction: 'Breathe comfortably and let the pace remain relaxed.', category: 'warmup' },
    { name: 'Cat-cow or seated spine movement', target: '6–8 reps', sets: 2, direction: 'Move gently through a comfortable range; a seated option is fine.', category: 'main' },
    { name: 'Wall chest opener', target: '15–20 sec each side', sets: 1, direction: 'Use light tension only; do not force a stretch.', category: 'main' },
    { name: 'Hip hinge practice', target: '8 reps', sets: 2, direction: 'Practise a small, comfortable hinge with hands on hips.', category: 'main' },
    { name: 'Ankle and shoulder mobility', target: '3 min', sets: 1, direction: 'Choose slow movements that feel useful today.', category: 'cooldown' },
  ] },
  { id: 'walk-intervals', title: 'Walk & Explore', focus: 'Cardio · fresh air', durationMinutes: 24, intensity: 'moderate', activityType: 'Walking', summary: 'Change pace in short, comfortable intervals; this is not a speed test.', tags: ['energy', 'consistency'], exercises: [
    { name: 'Easy walk warm-up', target: '5 min', sets: 1, direction: 'Begin at a conversational pace and let your body settle in.', category: 'warmup' },
    { name: 'Brisk / easy walk intervals', target: '2 min brisk + 2 min easy', sets: 4, direction: 'Brisk means noticeably quicker but still controlled. Use an easy pace throughout if preferred.', category: 'main' },
    { name: 'Steady walk', target: '4 min', sets: 1, direction: 'Return to a pace that feels sustainable.', category: 'main' },
    { name: 'Cool-down stroll', target: '3 min', sets: 1, direction: 'Gradually slow down; stop for any concerning symptoms.', category: 'cooldown' },
  ] },
  { id: 'dance-cardio', title: 'Rhythm Expedition', focus: 'Cardio · enjoyable movement', durationMinutes: 18, intensity: 'moderate', activityType: 'Dance', summary: 'A music-led session where enjoyment matters more than hitting a pace target.', tags: ['energy', 'consistency'], exercises: [
    { name: 'Choose your warm-up song', target: '3 min', sets: 1, direction: 'March, sway or step lightly to music you enjoy.', category: 'warmup' },
    { name: 'Dance or active play', target: '2 min movement + 1 min easy', sets: 4, direction: 'Pick low-impact steps if needed. You can pause, sit or switch to a gentle walk.', category: 'main' },
    { name: 'Your favourite easy song', target: '4 min', sets: 1, direction: 'Move at a pace that feels comfortable and fun.', category: 'main' },
    { name: 'Slow down', target: '3 min', sets: 1, direction: 'Let your breathing settle and finish comfortably.', category: 'cooldown' },
  ] },
  { id: 'core-stability', title: 'Core & Steady', focus: 'Stability · control', durationMinutes: 18, intensity: 'moderate', activityType: 'Strength', summary: 'Gentle stability practice using supported positions rather than max effort.', tags: ['strength', 'mobility'], exercises: [
    { name: 'Warm-up walk', target: '3 min', sets: 1, direction: 'Start with easy movement and relaxed breathing.', category: 'warmup' },
    { name: 'Dead bug or seated brace', target: '6 each side', sets: 2, direction: 'Choose a variation that keeps your back comfortable and breathing natural.', category: 'main' },
    { name: 'Wall plank', target: '15–25 sec', sets: 2, direction: 'Use the wall for support and stop before your form becomes uncomfortable.', category: 'main' },
    { name: 'Bird-dog reach', target: '6 each side', sets: 2, direction: 'Move slowly and reduce the range if needed.', category: 'main' },
    { name: 'Gentle cool-down', target: '3 min', sets: 1, direction: 'Finish with comfortable walking and movement.', category: 'cooldown' },
  ] },
  { id: 'outdoor-adventure', title: 'Outdoor Adventure', focus: 'Cardio · exploration', durationMinutes: 25, intensity: 'moderate', activityType: 'Walking', summary: 'An outdoor walk with optional short route variations, based on your surroundings.', tags: ['energy', 'consistency'], exercises: [
    { name: 'Start easy', target: '5 min', sets: 1, direction: 'Pick a safe route, daylight or a well-lit area, and a pace you can manage.', category: 'warmup' },
    { name: 'Route exploration', target: '10–15 min', sets: 1, direction: 'Take a different street, park loop or familiar route variation. No need to chase distance.', category: 'main' },
    { name: 'Optional gentle hill or stairs', target: '2–3 min', sets: 1, direction: 'Only if appropriate and safe for you; skip if uncomfortable or unsuitable.', category: 'main' },
    { name: 'Return & cool down', target: '5 min', sets: 1, direction: 'Return at a comfortable pace and finish gradually.', category: 'cooldown' },
  ] },
];

function hashSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function addDays(iso: string, offset: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function mondayOf(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dayDifference(start: string, end: string): number {
  const a = new Date(`${start}T12:00:00`).getTime();
  const b = new Date(`${end}T12:00:00`).getTime();
  return Math.max(0, Math.floor((b - a) / 86400000));
}
function increaseTarget(target: string, extra: number): string {
  const match = target.match(REP_TARGET);
  if (match) {
    const low = Number(match[1]) + extra;
    const high = Number(match[2] || match[1]) + extra;
    return match[2] ? `${low}–${high} reps` : `${low} reps`;
  }
  const seconds = target.match(SECOND_TARGET);
  if (seconds) {
    const low = Number(seconds[1]) + extra * 5;
    const high = Number(seconds[2] || seconds[1]) + extra * 5;
    return seconds[2] ? `${low}–${high} sec` : `${low} sec`;
  }
  return target;
}
function intensityFor(base: PlanIntensity, level: TrainingProfile['level'], phaseWeek: number, variant: number, ageBand?: TrainingProfile['ageBand']): PlanIntensity {
  if (level === 'new' || phaseWeek === 4 || base === 'easy') return 'easy';
  if (level === 'regular' && variant === 2 && base === 'moderate' && ageBand !== '13-17' && ageBand !== '65+') return 'vigorous';
  return 'moderate';
}
function compatibleLibrary(profile: TrainingProfile): typeof library {
  let candidates = library.filter(session => !(profile.environment === 'outdoor' && session.id === 'upper-control'));
  if (profile.goal === 'strength') candidates = [...candidates.filter(x => x.tags.includes('strength')), ...candidates.filter(x => !x.tags.includes('strength'))];
  else if (profile.goal === 'mobility') candidates = [...candidates.filter(x => x.tags.includes('mobility')), ...candidates.filter(x => !x.tags.includes('mobility'))];
  else if (profile.goal === 'energy') candidates = [...candidates.filter(x => x.tags.includes('energy')), ...candidates.filter(x => !x.tags.includes('energy'))];
  if (profile.environment === 'gym') candidates = [...candidates.filter(x => x.id === 'upper-control' || x.id === 'foundation-full-body' || x.id === 'lower-balance' || x.id === 'core-stability'), ...candidates.filter(x => !['upper-control','foundation-full-body','lower-balance','core-stability'].includes(x.id))];
  return candidates;
}
function buildSession(template: typeof library[number], date: string, generation: number, optionIndex: number, profile: TrainingProfile, phaseWeek: number): PlannedTrainingSession {
  const seed = hashSeed(`${date}|${template.id}|${generation}|${profile.goal}|${profile.level}|${profile.environment}`);
  const variant = seed % 3;
  const setCap = profile.ageBand === '13-17' ? 3 : profile.ageBand === '65+' ? 2 : 4;
  const exercises = template.exercises.map((exercise, index) => {
    const isMain = exercise.category === 'main';
    const variation = profile.level === 'regular' && isMain ? advancedVariationFor(exercise, profile) : undefined;
    const adapted = variation && profile.ageBand !== '65+'
      ? { ...exercise, ...variation }
      : exercise;
    const repeatableTarget = REP_TARGET.test(adapted.target) || SECOND_TARGET.test(adapted.target);
    const progressable = isMain && (exercise.sets > 1 || repeatableTarget);
    let sets = exercise.sets;
    if (progressable) {
      if (profile.level === 'new') {
        sets = Math.min(2, Math.max(1, sets - (sets > 1 ? 1 : 0)));
      } else if (profile.level === 'regular') {
        sets = Math.min(setCap, sets + 1);
      }
      if (phaseWeek === 3 && profile.level !== 'new' && index % 2 === 1) sets = Math.min(setCap, sets + 1);
      else if (phaseWeek === 4) sets = Math.max(1, sets - (index % 2 === 0 ? 1 : 0));
      else if (variant === 2 && profile.level === 'returning' && index % 3 === 1) sets = Math.min(setCap, sets + 1);
      else if (variant === 0 && profile.level !== 'regular' && index % 4 === 2) sets = Math.max(1, sets - 1);
    }
    const repExtra = profile.level === 'regular'
      ? (phaseWeek === 2 ? 1 : phaseWeek === 3 ? 2 : variant === 1 ? 1 : 0)
      : profile.level === 'returning'
        ? (phaseWeek === 2 ? 1 : phaseWeek === 3 ? 2 : variant === 1 ? 1 : 0)
        : 0;
    const target = isMain ? (profile.level === 'new'
      ? adjustedTargetForLevel(adapted.target, 'new')
      : increaseTarget(adapted.target, repExtra)) : adapted.target;
    return {
      ...adapted,
      target,
      sets,
      restSeconds: exercise.category === 'main'
        ? (phaseWeek === 3 ? 60 : phaseWeek === 4 ? 40 : profile.level === 'regular' ? 60 : 45)
        : 0,
      photo: originalExercisePhoto(adapted.name, adapted.category),
      formGuide: formGuideFor(adapted.name, adapted.category),
    };
  });
  const baseMinutes = profile.minutes || template.durationMinutes;
  const durationMinutes = Math.max(8, Math.min(60, Math.round((Math.min(template.durationMinutes, baseMinutes + 5) + variant * 2 + (phaseWeek === 3 ? 3 : phaseWeek === 4 ? -3 : 0)) / 2) * 2));
  const phaseNotes: Record<number, string> = {
    1: profile.level === 'new'
      ? 'Week 1 · learn each movement with the easier option and comfortable repetitions.'
      : 'Week 1 · learn the movements, keep effort controlled and prioritise form.',
    2: 'Week 2 · keep familiar movements and add a repetition only when every rep stays controlled.',
    3: 'Week 3 · add a set to selected movements only if technique and recovery feel good.',
    4: 'Week 4 · consolidate with a little less volume, then review what felt sustainable.',
  };
  return {
    id: `${date}-${generation}-${template.id}-${optionIndex}`,
    title: template.title,
    focus: template.focus,
    durationMinutes,
    intensity: intensityFor(template.intensity, profile.level, phaseWeek, variant, profile.ageBand),
    activityType: template.activityType,
    summary: template.summary,
    progressionNote: phaseNotes[phaseWeek],
    phaseWeek,
    exercises,
  };
}

export function buildTrainingWeek(profile: TrainingProfile, today: string, programStartDate: string, generation: number): TrainingDay[] {
  const weekStart = mondayOf(today);
  const phaseWeek = Math.min(4, Math.floor(dayDifference(programStartDate, today) / 7) + 1);
  const programWeekIndex = Math.max(0, Math.floor(dayDifference(mondayOf(programStartDate), weekStart) / 7));
  const profileSeed = hashSeed(`${mondayOf(programStartDate)}|${generation}|${profile.goal}|${profile.environment}|${profile.level}`);
  return Array.from({ length: 7 }, (_, dayIndex) => {
    const date = addDays(weekStart, dayIndex);
    const candidates = compatibleLibrary(profile);
    const preferredStart = profileSeed % candidates.length;
    // Stable daily offsets plus a three-step weekly advance guarantee a different three-session window next week.
    const rotation = (preferredStart + dayIndex + programWeekIndex * 3 + generation) % Math.max(1, candidates.length);
    const ordered = Array.from({ length: candidates.length }, (_, i) => candidates[(rotation + i) % candidates.length]);
    const unique = ordered.filter((item, index) => ordered.findIndex(x => x.id === item.id) === index).slice(0, 3);
    const options = unique.map((item, optionIndex) => buildSession(item, date, generation, optionIndex, profile, phaseWeek));
    const d = new Date(`${date}T12:00:00`);
    return { date, weekday: d.toLocaleDateString('en-IN', { weekday: 'long' }), sessions: options };
  });
}

export function programPhase(startDate: string, today: string) {
  const elapsedDays = dayDifference(startDate, today);
  const week = Math.min(4, Math.floor(elapsedDays / 7) + 1);
  return {
    week,
    elapsedDays,
    canStartNextBlock: elapsedDays >= 28,
    title: ['Learn the movement', 'Build comfortable reps', 'Progress a little', 'Consolidate & review'][week - 1],
    note: [
      'Practise familiar movements at a comfortable effort.',
      'Keep the exercises mostly familiar and add a repetition only when it feels controlled.',
      'Add a set to selected movements only if technique and recovery feel good.',
      'Use a little less volume, then review how the block felt before choosing the next one.',
    ][week - 1],
  };
}
