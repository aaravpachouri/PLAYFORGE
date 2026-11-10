export const CHALLENGE_DAY_COUNT = 7;

/** Keep only unique, valid day indices and return them in display order. */
export function normaliseCompletedDays(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value.filter((day): day is number =>
      typeof day === 'number' && Number.isInteger(day) && day >= 0 && day < CHALLENGE_DAY_COUNT
    )
  )].sort((a, b) => a - b);
}

/** Additive merge used only after the player explicitly imports device progress. */
export function mergeCompletedDays(...values: unknown[]): number[] {
  return normaliseCompletedDays(values.flatMap(value => Array.isArray(value) ? value : []));
}
