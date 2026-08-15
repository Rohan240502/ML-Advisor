import type {
  FeatureProfile,
  DataQualityAnalysis,
  MissingValueInfo,
  ProblemType,
} from '../types/analysis';

const HIGH_CARDINALITY_THRESHOLD = 50;
const HIGH_MISSING_THRESHOLD = 20; // %
const IDENTIFIER_UNIQUE_RATIO = 0.95;

function suggestImputation(type: FeatureProfile['type']): string {
  switch (type) {
    case 'numerical':
      return 'Median imputation recommended';
    case 'categorical':
    case 'boolean':
      return 'Most-frequent value imputation recommended';
    case 'datetime':
      return 'Consider forward-fill or drop rows with missing dates';
    default:
      return 'Investigate missing values before training';
  }
}

function computeOverallScore(
  missingValues: MissingValueInfo[],
  duplicateCount: number,
  rowCount: number,
  constantCount: number
): 'good' | 'fair' | 'poor' {
  const highMissingCols = missingValues.filter(m => m.percentage > HIGH_MISSING_THRESHOLD).length;
  const duplicatePct = rowCount > 0 ? (duplicateCount / rowCount) * 100 : 0;

  if (highMissingCols === 0 && duplicatePct < 1 && constantCount === 0) return 'good';
  if (highMissingCols <= 2 && duplicatePct < 5) return 'fair';
  return 'poor';
}

/**
 * Analyze data quality across all features.
 *
 * @param features     Feature profiles from the dataset profiler
 * @param duplicateRowCount  Precomputed duplicate count
 * @param rowCount     Total rows
 * @param targetColumn Name of the selected target (excluded from some checks)
 * @param problemType  Current problem type (for imbalance check)
 */
export function analyzeQuality(
  features: FeatureProfile[],
  duplicateRowCount: number,
  rowCount: number,
  targetColumn: string | null,
  _problemType: ProblemType | null
): DataQualityAnalysis {
  const missingValues: MissingValueInfo[] = [];
  const identifierColumns: string[] = [];
  const constantColumns: string[] = [];
  const highCardinalityColumns: Array<{ column: string; uniqueCount: number }> = [];

  for (const f of features) {
    // Missing values (report all columns with any missing)
    if (f.missingCount > 0) {
      missingValues.push({
        column: f.name,
        count: f.missingCount,
        percentage: f.missingPercentage,
        suggestedImputation: suggestImputation(f.type),
      });
    }

    if (f.type === 'identifier') {
      identifierColumns.push(f.name);
    }

    if (f.type === 'constant') {
      constantColumns.push(f.name);
    }

    if (
      (f.type === 'categorical' || f.type === 'boolean') &&
      f.uniqueCount >= HIGH_CARDINALITY_THRESHOLD &&
      f.name !== targetColumn
    ) {
      highCardinalityColumns.push({ column: f.name, uniqueCount: f.uniqueCount });
    }
  }

  const overallScore = computeOverallScore(
    missingValues,
    duplicateRowCount,
    rowCount,
    constantColumns.length
  );

  return {
    missingValues,
    duplicateRowCount,
    constantColumns,
    identifierColumns,
    highCardinalityColumns,
    hasMissingValues: missingValues.length > 0,
    hasDuplicates: duplicateRowCount > 0,
    overallScore,
  };
}
