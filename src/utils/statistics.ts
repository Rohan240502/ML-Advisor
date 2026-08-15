// ─── Pure math / statistics helpers ─────────────────────────────────────────

/**
 * Arithmetic mean of a numeric array. Returns NaN for empty arrays.
 */
export function mean(values: number[]): number {
  if (values.length === 0) return NaN;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Median of a numeric array (sorts a copy). Returns NaN for empty arrays.
 */
export function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Population standard deviation.
 */
export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Count of non-null, non-undefined, non-empty-string items.
 */
export function nonMissingCount(values: string[]): number {
  return values.filter(v => v !== null && v !== undefined && v.trim() !== '').length;
}

/**
 * Count of null / undefined / empty-string items.
 */
export function missingCount(values: string[]): number {
  return values.length - nonMissingCount(values);
}

/**
 * Set of unique non-empty string values.
 */
export function uniqueValues(values: string[]): Set<string> {
  const s = new Set<string>();
  for (const v of values) {
    const t = v?.trim();
    if (t) s.add(t.toLowerCase());
  }
  return s;
}

/**
 * Frequency map: value → count (case-insensitive, trimmed).
 */
export function frequencyMap(values: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const v of values) {
    const t = v?.trim().toLowerCase();
    if (!t) continue;
    map.set(t, (map.get(t) ?? 0) + 1);
  }
  return map;
}

/**
 * Top N entries from a frequency map, sorted by count desc.
 */
export function topN(
  map: Map<string, number>,
  n: number
): Array<{ value: string; count: number }> {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([value, count]) => ({ value, count }));
}

/**
 * Clamp a number to [min, max].
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Round to N decimal places.
 */
export function round(val: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(val * factor) / factor;
}
