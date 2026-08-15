import type {
  FeatureProfile,
  ProblemRecommendation,
  ProblemType,
} from '../types/analysis';
import { frequencyMap } from '../utils/statistics';

// If a numeric target has ≤ this many unique values, flag as possibly ordinal
const NUMERIC_LOW_CARDINALITY_THRESHOLD = 10;
// Confidence reduction for ambiguous ordinal numerics
const ORDINAL_CONFIDENCE_PENALTY = 0.25;

interface ClassInfo {
  label: string;
  count: number;
  percentage: number;
}

function getImbalanceLevel(distribution: ClassInfo[]): 'none' | 'moderate' | 'strong' {
  if (distribution.length < 2) return 'none';
  const sorted = [...distribution].sort((a, b) => b.percentage - a.percentage);
  const majorityPct = sorted[0].percentage;
  if (majorityPct >= 90) return 'strong';
  if (majorityPct >= 70) return 'moderate';
  return 'none';
}

/**
 * Determine the ML problem type given the selected target feature
 * and its raw column values.
 */
export function detectProblem(
  targetFeature: FeatureProfile,
  targetValues: string[]  // raw string values for the target column
): ProblemRecommendation {
  const nonEmpty = targetValues.filter(v => v.trim() !== '');
  const freq = frequencyMap(nonEmpty.map(v => v.trim()));
  const uniqueCount = freq.size;

  const totalNonEmpty = nonEmpty.length;
  const distribution: ClassInfo[] = [...freq.entries()].map(([label, count]) => ({
    label,
    count,
    percentage: Math.round((count / totalNonEmpty) * 1000) / 10,
  }));
  distribution.sort((a, b) => b.count - a.count);

  // ── Boolean → Binary classification ──────────────────────────
  if (targetFeature.type === 'boolean') {
    return {
      type: 'binary_classification',
      confidence: 0.95,
      reasons: [
        'Target contains boolean values (true/false, yes/no, 0/1)',
        'Clearly a two-class classification problem',
      ],
      needsUserConfirmation: false,
      classDistribution: distribution,
      imbalanceLevel: getImbalanceLevel(distribution),
    };
  }

  // ── Categorical ───────────────────────────────────────────────
  if (targetFeature.type === 'categorical') {
    if (uniqueCount === 2) {
      return {
        type: 'binary_classification',
        confidence: 0.92,
        reasons: [
          'Target contains exactly two distinct classes',
          'Binary classification is the appropriate problem type',
        ],
        needsUserConfirmation: false,
        classDistribution: distribution,
        imbalanceLevel: getImbalanceLevel(distribution),
      };
    }
    if (uniqueCount >= 3 && uniqueCount <= 20) {
      return {
        type: 'multiclass_classification',
        confidence: 0.88,
        reasons: [
          `Target contains ${uniqueCount} distinct classes`,
          'Multiclass classification is the appropriate problem type',
        ],
        needsUserConfirmation: false,
        classDistribution: distribution,
        imbalanceLevel: getImbalanceLevel(distribution),
      };
    }
    // Very high cardinality categorical — uncertain
    return {
      type: 'uncertain',
      confidence: 0.35,
      reasons: [
        `Target contains ${uniqueCount} distinct values — very high cardinality`,
        'This may not be a suitable target column, or may require special treatment',
      ],
      needsUserConfirmation: true,
      classDistribution: distribution,
      imbalanceLevel: 'none',
    };
  }

  // ── Numerical ─────────────────────────────────────────────────
  if (targetFeature.type === 'numerical') {
    // Numeric 0/1 binary
    const keys = [...freq.keys()];
    const isBinaryNumeric =
      uniqueCount === 2 &&
      keys.every(k => k === '0' || k === '1');
    if (isBinaryNumeric) {
      return {
        type: 'binary_classification',
        confidence: 0.9,
        reasons: [
          'Target contains only 0 and 1 values',
          'Binary classification is the appropriate problem type',
        ],
        needsUserConfirmation: false,
        classDistribution: distribution,
        imbalanceLevel: getImbalanceLevel(distribution),
      };
    }

    // Low-cardinality numeric (ordinal / multiclass ambiguity)
    if (uniqueCount <= NUMERIC_LOW_CARDINALITY_THRESHOLD) {
      return {
        type: 'multiclass_classification',
        confidence: 0.62,
        reasons: [
          `Numeric target with only ${uniqueCount} unique values`,
          'Could be ordinal classification or multiclass — confirm problem type',
          'For true regression, target should have many continuous values',
        ],
        needsUserConfirmation: true,
        classDistribution: distribution,
        imbalanceLevel: getImbalanceLevel(distribution),
      };
    }

    // Continuous numeric → regression
    return {
      type: 'regression',
      confidence: 0.87,
      reasons: [
        `Target has ${uniqueCount} distinct continuous numerical values`,
        'Regression is the appropriate problem type',
      ],
      needsUserConfirmation: false,
      imbalanceLevel: 'none',
    };
  }

  // ── Fallback ──────────────────────────────────────────────────
  return {
    type: 'uncertain',
    confidence: 0.3,
    reasons: [
      `Target column type is "${targetFeature.type}" — problem type is unclear`,
      'Please select a different target column or specify the problem type manually',
    ],
    needsUserConfirmation: true,
    imbalanceLevel: 'none',
  };
}
