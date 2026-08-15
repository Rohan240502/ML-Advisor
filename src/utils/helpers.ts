// ─── String / column helpers ──────────────────────────────────────────────────

const BOOLEAN_VALUES = new Set([
  'true', 'false',
  'yes', 'no',
  '1', '0',
  't', 'f',
  'y', 'n',
]);

const DATETIME_PATTERNS = [
  // ISO 8601
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/,
  // MM/DD/YYYY or DD/MM/YYYY
  /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
  // DD-Mon-YYYY
  /^\d{1,2}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/i,
  // Month DD, YYYY
  /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}$/i,
];

const ID_NAME_PATTERNS = [
  /\bid\b/i,
  /^id$/i,
  /_id$/i,
  /^uuid$/i,
  /^guid$/i,
  /^key$/i,
  /^pk$/i,
  /^row_?num(ber)?$/i,
  /^index$/i,
  /^record_?id$/i,
  /^serial$/i,
];

const TARGET_NAME_BOOSTS: Record<string, number> = {
  target: 30,
  label: 28,
  class: 26,
  outcome: 24,
  output: 20,
  churn: 22,
  fraud: 22,
  default: 20,
  approved: 20,
  survived: 20,
  survival: 18,
  price: 18,
  salary: 18,
  income: 12,
  revenue: 15,
  risk: 18,
  status: 16,
  sales: 15,
  result: 18,
  response: 18,
  purchased: 20,
  converted: 20,
  clicked: 18,
  score: 14,
  rating: 12,
  grade: 14,
  diagnosis: 22,
  disease: 20,
  death: 18,
  readmitted: 20,
  defaulted: 20,
};

/** Check if a string value looks numeric (int or float). */
export function isNumericString(v: string): boolean {
  if (!v || !v.trim()) return false;
  return !isNaN(Number(v.trim().replace(/,/g, '')));
}

/** Check if a value string is a known boolean. */
export function isBooleanString(v: string): boolean {
  return BOOLEAN_VALUES.has(v.trim().toLowerCase());
}

/** Check if a value string looks like a datetime. */
export function isDatetimeString(v: string): boolean {
  const t = v.trim();
  if (!t) return false;
  return DATETIME_PATTERNS.some(p => p.test(t));
}

/** Normalize a column name: lowercase, strip special chars, trim. */
export function normalizeColumnName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s\-]/g, '_');
}

/** Check if a column name matches known ID patterns. */
export function looksLikeIdName(name: string): boolean {
  return ID_NAME_PATTERNS.some(p => p.test(name.trim()));
}

/** Get the target name boost score for a column (0 if no match). */
export function getTargetNameBoost(name: string): number {
  const normalized = normalizeColumnName(name).replace(/_/g, '');
  for (const [keyword, boost] of Object.entries(TARGET_NAME_BOOSTS)) {
    if (normalized.includes(keyword.replace(/_/g, ''))) {
      return boost;
    }
  }
  return 0;
}

/** Format a number as a percentage string. */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format file size bytes to human readable. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Capitalize first letter of each word. */
export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Get a short display name for ProblemType. */
export function problemTypeLabel(type: string): string {
  switch (type) {
    case 'binary_classification': return 'Binary Classification';
    case 'multiclass_classification': return 'Multiclass Classification';
    case 'regression': return 'Regression';
    default: return 'Uncertain';
  }
}
