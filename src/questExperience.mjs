const questLanes = [
  {
    category: 'Focus',
    type: 'learning',
    icon: 'brain',
    quests: [
      { title: 'One thing, full focus', description: 'Choose one useful task and give it a quiet 10-minute start. Close unrelated tabs or notifications, then stop or continue by choice.', duration: 10 },
      { title: 'Explain it simply', description: 'Pick one idea you are learning and explain it in three plain-language sentences, out loud or in a note.', duration: 8 },
      { title: 'Read for one insight', description: 'Read a short page or section about something that matters to you. Keep one idea worth remembering.', duration: 10 },
      { title: 'Skill practice, tiny edition', description: 'Practise one small part of a skill you want to improve. Repeat it slowly and notice one thing that got easier.', duration: 12 },
      { title: 'Close one open loop', description: 'Finish one small unfinished piece of work that has been taking up space in your mind. Keep the scope deliberately small.', duration: 10 },
      { title: 'Follow one question', description: 'Write down a question you are curious about and spend a few minutes finding one useful, trustworthy answer.', duration: 8 },
      { title: 'Teach-back challenge', description: 'Choose something you already know and teach the core idea to someone, or explain it as if a beginner were listening.', duration: 10 },
      { title: 'Make a useful note', description: 'Turn something you learned today into a short note with a title and three takeaways you can find again.', duration: 8 },
    ],
  },
  {
    category: 'Discipline',
    type: 'everyday reset',
    icon: 'timer',
    quests: [
      { title: 'Reset one small space', description: 'Choose one desk, shelf or corner and put away only what does not belong there. Stop when that one space feels clearer.', duration: 8 },
      { title: 'Tomorrow’s launchpad', description: 'Write down the first small step for tomorrow and put the one thing you need somewhere easy to find.', duration: 5 },
      { title: 'Make a three-step plan', description: 'Choose one task you have been putting off and break it into three actions small enough to begin.', duration: 8 },
      { title: 'Clear a little digital clutter', description: 'Close or organise five tabs, files or saved items you no longer need. Leave anything important untouched.', duration: 6 },
      { title: 'Prepare your workspace', description: 'Set up the materials for one task before you begin. Make the next useful action obvious and easy to start.', duration: 5 },
      { title: 'Create a focus buffer', description: 'Give your next commitment a small buffer: check the time, gather what you need and remove one avoidable distraction.', duration: 5 },
      { title: 'Put one thing in its place', description: 'Choose one everyday item that often goes missing and give it a consistent home. Use it once, then return it there.', duration: 5 },
      { title: 'Finish a five-minute favour', description: 'Do one small task that will make later today easier, such as preparing a bag or organising a reminder.', duration: 5 },
    ],
  },
  {
    category: 'Exploration',
    type: 'curiosity',
    icon: 'spark',
    quests: [
      { title: 'Make something tiny', description: 'Create a small thing just for fun: a sketch, a short paragraph, a playlist or a simple prototype. It does not need to be polished.', duration: 12 },
      { title: 'Curiosity detour', description: 'Explore a topic you know little about and collect one surprising fact from a source you trust.', duration: 10 },
      { title: 'Ask a better question', description: 'Ask someone a thoughtful question about an interest or experience of theirs. Listening counts as the whole quest.', duration: 5 },
      { title: 'Notice something new', description: 'Look closely at an ordinary object, image or place and write down three details you usually overlook.', duration: 5 },
      { title: 'Try a creative remix', description: 'Take an idea, photo, song or paragraph you like and make your own small variation without aiming for perfection.', duration: 12 },
      { title: 'Share a specific thank-you', description: 'Think of one helpful thing someone did and, when it feels appropriate, tell them exactly what you appreciated.', duration: 5 },
      { title: 'Explore a new perspective', description: 'Read or listen to a short explanation from a credible source that challenges or expands how you see a familiar topic.', duration: 10 },
      { title: 'Make a mini recommendation', description: 'Find one book, tool, idea or resource you genuinely like and write a sentence about who might enjoy it and why.', duration: 8 },
    ],
  },
];

export function buildDailyLifeQuests({ date, minutes, goal = 'consistency', level = 'new' }) {
  const parsed = new Date(`${date}T00:00:00Z`);
  const dayNumber = Number.isFinite(parsed.getTime()) ? Math.floor(parsed.getTime() / 86400000) : 0;
  const goalOffset = { consistency: 0, strength: 2, energy: 4, mobility: 6 }[goal] ?? 0;
  const levelOffset = { new: 0, returning: 1, regular: 2 }[level] ?? 0;
  const timeLimit = Math.max(3, Math.min(60, Number(minutes) || 10));

  return questLanes.map((lane, index) => {
    const laneOffset = (dayNumber + goalOffset + levelOffset + index * 3) % lane.quests.length;
    const choice = lane.quests[laneOffset];
    const duration = Math.max(3, Math.min(timeLimit, choice.duration));
    return {
      id: `quest-${lane.category.toLowerCase()}`,
      category: lane.category,
      title: choice.title,
      description: choice.description,
      duration,
      type: lane.type,
      icon: lane.icon,
      tag: lane.category.toUpperCase(),
      activity: 'Other',
      xp: 35,
      subtitle: `${duration} min · ${lane.type}`,
    };
  });
}

export function getQuestAcknowledgement(category, note = '') {
  if (/adapt|part|short|pause|stopp|gentle|easy|modif|smaller|needed|rest/i.test(note)) {
    return 'You made the challenge fit your real day. Adapting your plan is a skill too, and you still showed up.';
  }
  const messages = {
    Focus: 'You gave your attention to something that matters. That is how useful progress compounds.',
    Discipline: 'You made life a little easier for future-you. Small systems create room for bigger things.',
    Exploration: 'You made room for curiosity. New ideas and experiences often start with one small try.',
  };
  return messages[category] || 'You followed through on something you chose. That effort deserves to be noticed.';
}

export function getCheckinReflection({ energy = null, mood = 'Okay' } = {}) {
  if (mood === 'Low') return 'Thanks for being honest about how today feels. Keep the next step gentle, or simply leave it for another time.';
  if (energy !== null && energy <= 2) return 'You logged a lower-energy day. It is fine to keep expectations small and choose what feels manageable.';
  if (energy !== null && energy >= 4) return 'You are reporting good energy today. Pick one thing that matters and enjoy making progress at your pace.';
  if (mood === 'Great' || mood === 'Good') return 'Nice to see you checking in. Notice what is helping today feel good, without turning it into pressure.';
  return 'Your check-in is a snapshot, not a score. Use it to choose a next step that fits today.';
}
