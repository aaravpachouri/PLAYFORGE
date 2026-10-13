export type PlanActivityType = 'Walking' | 'Strength' | 'Cycling' | 'Sport' | 'Dance' | 'Yoga & mobility' | 'Other';
export type PlanIntensity = 'easy' | 'moderate' | 'vigorous';
export type PlanExercise = {
  name: string;
  target: string;
  sets: number;
  direction: string;
  photo: string;
  restSeconds: number;
  category: 'warmup' | 'main' | 'cooldown';
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
export type TrainingProfile = { goal: 'consistency' | 'strength' | 'energy' | 'mobility'; level: 'new' | 'returning' | 'regular'; minutes: number; environment: 'home' | 'gym' | 'outdoor' | 'mixed' };

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

const library: Array<Omit<PlannedTrainingSession, 'phaseWeek' | 'progressionNote' | 'exercises'> & { tags: string[]; exercises: Array<Omit<PlanExercise, 'restSeconds' | 'photo'>> }> = [
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
function intensityFor(base: PlanIntensity, level: TrainingProfile['level'], phaseWeek: number, variant: number): PlanIntensity {
  if (level === 'new' || phaseWeek === 4) return 'easy';
  if (base === 'easy') return 'easy';
  if (level === 'regular' && variant === 2 && base === 'moderate') return 'vigorous';
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
  const exercises = template.exercises.map((exercise, index) => {
    const isMain = exercise.category === 'main';
    let sets = exercise.sets;
    if (isMain && sets > 1) {
      if (phaseWeek === 3 && index % 2 === 1) sets = Math.min(4, sets + 1);
      else if (phaseWeek === 4) sets = Math.max(1, sets - (index % 2 === 0 ? 1 : 0));
      else if (variant === 2 && index % 3 === 1) sets = Math.min(3, sets + 1);
      else if (variant === 0 && index % 4 === 2) sets = Math.max(1, sets - 1);
    }
    const repExtra = phaseWeek === 2 ? 1 : phaseWeek === 3 ? 2 : variant === 1 ? 1 : 0;
    return {
      ...exercise,
      target: isMain ? increaseTarget(exercise.target, repExtra) : exercise.target,
      sets,
      restSeconds: exercise.category === 'main' ? (phaseWeek === 3 ? 60 : phaseWeek === 4 ? 40 : 45) : 0,
      photo: originalExercisePhoto(exercise.name, exercise.category),
    };
  });
  const baseMinutes = profile.minutes || template.durationMinutes;
  const durationMinutes = Math.max(8, Math.min(60, Math.round((Math.min(template.durationMinutes, baseMinutes + 5) + variant * 2 + (phaseWeek === 3 ? 3 : phaseWeek === 4 ? -3 : 0)) / 2) * 2));
  const phaseNotes: Record<number, string> = {
    1: 'Week 1 · learn the movements, keep effort comfortable and prioritise form.',
    2: 'Week 2 · keep the familiar movement patterns and add a rep where it feels comfortable.',
    3: 'Week 3 · add a set to selected movements only if recovery and technique feel good.',
    4: 'Week 4 · consolidate with a slightly easier volume, then review what felt sustainable.',
  };
  return {
    id: `${date}-${generation}-${template.id}-${optionIndex}`,
    title: template.title,
    focus: template.focus,
    durationMinutes,
    intensity: intensityFor(template.intensity, profile.level, phaseWeek, variant),
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
