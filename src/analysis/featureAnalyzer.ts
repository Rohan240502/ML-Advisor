import type { FeatureProfile, FeatureType } from '../types/analysis';
import {
  isNumericString,
  isBooleanString,
  isDatetimeString,
  looksLikeIdName,
} from '../utils/helpers';
import {
  mean,
  median,
  stdDev,
  missingCount,
  uniqueValues,
  frequencyMap,
  topN,
  round,
} from '../utils/statistics';

const HIGH_CARDINALITY_THRESHOLD = 50;
const IDENTIFIER_UNIQUE_RATIO_THRESHOLD = 0.95;
const MIN_SAMPLE_FOR_TYPE_DETECTION = 20;

/**
 * Given a column's non-empty string values, infer the FeatureType.
 * We sample up to MIN_SAMPLE_FOR_TYPE_DETECTION rows for performance.
 */
function inferType(
  name: string,
  nonEmptyValues: string[],
  uniqueCount: number,
  uniqueRatio: number,
  rowCount: number
): FeatureType {
  if (uniqueCount <= 1) return 'constant';

  // Identifier: name pattern + very high uniqueness
  if (looksLikeIdName(name) && uniqueRatio > IDENTIFIER_UNIQUE_RATIO_THRESHOLD) {
    return 'identifier';
  }
  // Identifier: extremely high uniqueness even without a name hint
  if (uniqueRatio > 0.99 && rowCount > 50 && uniqueCount > 50) {
    return 'identifier';
  }

  const sample = nonEmptyValues.slice(0, MIN_SAMPLE_FOR_TYPE_DETECTION);
  const total = sample.length;
  if (total === 0) return 'categorical';

  const numericCount = sample.filter(v => isNumericString(v)).length;
  const boolCount = sample.filter(v => isBooleanString(v)).length;
  const dateCount = sample.filter(v => isDatetimeString(v)).length;

  const numericRatio = numericCount / total;
  const boolRatio = boolCount / total;
  const dateRatio = dateCount / total;

  if (boolRatio >= 0.9 && uniqueCount <= 4) return 'boolean';
  if (dateRatio >= 0.8) return 'datetime';
  if (numericRatio >= 0.85) return 'numerical';

  return 'categorical';
}

/**
 * Build a FeatureProfile for one column.
 */
export function analyzeFeature(
  name: string,
  values: string[],  // one entry per row (may be empty string = missing)
  rowCount: number
): FeatureProfile {
  const missing = missingCount(values);
  const missingPct = round((missing / rowCount) * 100);
  const nonEmpty = values.filter(v => v.trim() !== '');
  const uv = uniqueValues(values);
  const uniqueCount = uv.size;
  const uniqueRatio = round(rowCount > 0 ? uniqueCount / rowCount : 0, 4);

  const type = inferType(name, nonEmpty, uniqueCount, uniqueRatio, rowCount);

  // Sample values (first 5 unique non-empty, original casing)
  const seen = new Set<string>();
  const sampleValues: string[] = [];
  for (const v of values) {
    const t = v?.trim();
    if (t && !seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      sampleValues.push(t);
    }
    if (sampleValues.length >= 5) break;
  }

  const profile: FeatureProfile = {
    name,
    type,
    uniqueCount,
    uniqueRatio,
    missingCount: missing,
    missingPercentage: missingPct,
    sampleValues,
  };

  // Numerical stats
  if (type === 'numerical') {
    const nums = nonEmpty
      .map(v => parseFloat(v.replace(/,/g, '')))
      .filter(n => !isNaN(n));
    if (nums.length > 0) {
      profile.min = round(Math.min(...nums));
      profile.max = round(Math.max(...nums));
      profile.mean = round(mean(nums));
      profile.median = round(median(nums));
      profile.stdDev = round(stdDev(nums));
    }
  }

  // Categorical stats
  if (type === 'categorical' || type === 'boolean') {
    const freq = frequencyMap(values);
    profile.topCategories = topN(freq, 10).map(({ value, count }) => ({
      value,
      count,
    }));
    profile.isHighCardinality = uniqueCount >= HIGH_CARDINALITY_THRESHOLD;
  }

  return profile;
}
