import type {
  FeatureProfile,
  TargetRecommendation,
  TargetCandidate,
} from '../types/analysis';
import { getTargetNameBoost, looksLikeIdName } from '../utils/helpers';
import { clamp } from '../utils/statistics';
import { identifierLikelihood } from './idDetector';

const LOW_CONFIDENCE_THRESHOLD = 0.55;
const IDENTIFIER_PENALTY = 45;
const CONSTANT_PENALTY = 50;
const HIGH_MISSING_PENALTY = 20; // applied when > 50% missing
const MODERATE_MISSING_PENALTY = 10; // 20-50% missing

/**
 * Score a single feature as a target candidate (0–100).
 *
 * Signals:
 *  + Column name matches known target keywords
 *  + Boolean / low-cardinality categorical (good for classification)
 *  + Later position in dataset
 *  - Very high uniqueness (likely ID)
 *  - Very high missingness
 *  - Constant column
 */
function scoreCandidate(
  feature: FeatureProfile,
  position: number,     // 0-indexed column index
  totalColumns: number,
  rowCount: number
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 50;

  // ── Name boost ───────────────────────────────────────────────
  const nameBoost = getTargetNameBoost(feature.name);
  if (nameBoost > 0) {
    score += nameBoost;
    reasons.push(`Column name resembles a target or outcome variable`);
  }

  // ── Type signals ─────────────────────────────────────────────
  if (feature.type === 'boolean') {
    score += 15;
    reasons.push('Binary/boolean column — strong indicator of a classification target');
  } else if (feature.type === 'categorical') {
    if (feature.uniqueCount === 2) {
      score += 18;
      reasons.push('Contains exactly two classes — binary classification target candidate');
    } else if (feature.uniqueCount >= 3 && feature.uniqueCount <= 20) {
      score += 10;
      reasons.push(`Contains ${feature.uniqueCount} classes — multiclass target candidate`);
    } else if (feature.uniqueCount > 20) {
      // High-cardinality categorical — less likely to be target
      score -= 8;
    }
  } else if (feature.type === 'numerical') {
    // Continuous: could be regression target
    score += 5;
    reasons.push('Continuous numerical column — possible regression target');
  } else if (feature.type === 'constant') {
    score -= CONSTANT_PENALTY;
    reasons.push('Constant column — no predictive or target value');
  }

  // ── Identifier penalty ───────────────────────────────────────
  const idLikelihood = identifierLikelihood(feature, rowCount);
  if (idLikelihood > 0.7) {
    score -= IDENTIFIER_PENALTY;
    reasons.push('High uniqueness ratio — likely an identifier, not a target');
  } else if (idLikelihood > 0.4) {
    score -= 20;
    reasons.push('Moderate identifier likelihood — may not be a predictive target');
  }

  if (looksLikeIdName(feature.name) && feature.type !== 'boolean') {
    score -= 15;
    reasons.push('Column name pattern suggests an identifier');
  }

  // ── Missingness penalty ──────────────────────────────────────
  if (feature.missingPercentage > 50) {
    score -= HIGH_MISSING_PENALTY;
    reasons.push(`${feature.missingPercentage.toFixed(1)}% missing values — unusual for a target column`);
  } else if (feature.missingPercentage > 20) {
    score -= MODERATE_MISSING_PENALTY;
    reasons.push(`${feature.missingPercentage.toFixed(1)}% missing values`);
  }

  // ── Position bonus ───────────────────────────────────────────
  // Give small bonus for columns in the last 25% of the dataset
  const relativePosition = position / Math.max(totalColumns - 1, 1);
  if (relativePosition >= 0.75) {
    score += 5;
    reasons.push('Appears near the end of the dataset — targets often appear last');
  }

  return { score: clamp(score, 0, 100), reasons };
}

/**
 * Detect the most likely target column from a list of feature profiles.
 */
export function detectTarget(
  features: FeatureProfile[],
  rowCount: number
): TargetRecommendation | null {
  if (features.length === 0) return null;

  // Score every feature
  const candidates: TargetCandidate[] = features.map((f, idx) => {
    const { score, reasons } = scoreCandidate(f, idx, features.length, rowCount);
    return {
      column: f.name,
      score,
      confidence: clamp(score / 100, 0, 1),
      reasons,
    };
  });

  // Sort descending
  candidates.sort((a, b) => b.score - a.score);

  const top = candidates[0];
  const alternatives = candidates.slice(1, 4); // next 3 options

  const hasLowConfidence = top.confidence < LOW_CONFIDENCE_THRESHOLD;

  return {
    column: top.column,
    score: top.score,
    confidence: top.confidence,
    reasons: top.reasons,
    alternatives,
    hasLowConfidence,
  };
}
