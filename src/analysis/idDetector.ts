import type { FeatureProfile } from '../types/analysis';
import { looksLikeIdName } from '../utils/helpers';

const IDENTIFIER_UNIQUE_RATIO = 0.95;
const IDENTIFIER_MIN_ROWS = 20;

/**
 * Determine whether a FeatureProfile represents an identifier column.
 * Used both as part of initial feature analysis and as a standalone check
 * for the target detector penalty.
 */
export function isIdentifierColumn(
  feature: FeatureProfile,
  rowCount: number
): boolean {
  if (feature.type === 'identifier') return true;

  // High-uniqueness numeric that looks like an ID by name
  if (
    looksLikeIdName(feature.name) &&
    feature.uniqueRatio > IDENTIFIER_UNIQUE_RATIO &&
    rowCount >= IDENTIFIER_MIN_ROWS
  ) {
    return true;
  }

  return false;
}

/**
 * Return all columns that are likely identifiers.
 */
export function detectIdentifiers(
  features: FeatureProfile[],
  rowCount: number
): string[] {
  return features
    .filter(f => isIdentifierColumn(f, rowCount))
    .map(f => f.name);
}

/**
 * Heuristic identifier confidence score 0–1 for a feature.
 * Used by the target detector as a penalty signal.
 */
export function identifierLikelihood(
  feature: FeatureProfile,
  rowCount: number
): number {
  let score = 0;

  if (looksLikeIdName(feature.name)) score += 0.4;
  if (feature.uniqueRatio > 0.99) score += 0.4;
  else if (feature.uniqueRatio > 0.95) score += 0.25;
  else if (feature.uniqueRatio > 0.9) score += 0.1;

  if (feature.type === 'numerical' && rowCount >= IDENTIFIER_MIN_ROWS) {
    // Sequential integers are common IDs
    score += 0.1;
  }
  if (feature.type === 'identifier') score = 1.0;

  return Math.min(1, score);
}
