export function normalizeChallengeDays(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  const indexes = value
    .map((entry) => {
      if (typeof entry === 'number') return entry;
      if (entry && typeof entry === 'object' && 'day_index' in entry) {
        return Number((entry as { day_index: unknown }).day_index);
      }
      return Number.NaN;
    })
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);

  return [...new Set(indexes)].sort((a, b) => a - b);
}

export function parseLegacyChallengeDays(raw: string | null): number[] {
  if (!raw) return [];
  try {
    return normalizeChallengeDays(JSON.parse(raw));
  } catch {
    return [];
  }
}
