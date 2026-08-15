import type {
  FeatureProfile,
  PreprocessingRecommendation,
  ProblemType,
  DataQualityAnalysis,
} from '../types/analysis';

/**
 * Generate preprocessing recommendations based on dataset profile and quality analysis.
 */
export function recommendPreprocessing(
  features: FeatureProfile[],
  quality: DataQualityAnalysis,
  targetColumn: string | null,
  problemType: ProblemType | null
): PreprocessingRecommendation[] {
  const recs: PreprocessingRecommendation[] = [];

  const nonTargetFeatures = features.filter(f => f.name !== targetColumn);

  // ── Identifier exclusion ──────────────────────────────────────
  if (quality.identifierColumns.length > 0) {
    recs.push({
      category: 'identifier',
      action: `Exclude identifier column(s): ${quality.identifierColumns.join(', ')}`,
      reason:
        'Identifier columns have near-unique values per row and provide no generalizable signal for model training.',
      severity: 'recommended',
      affectedColumns: quality.identifierColumns,
    });
  }

  // ── Constant column exclusion ─────────────────────────────────
  if (quality.constantColumns.length > 0) {
    recs.push({
      category: 'constant',
      action: `Remove constant column(s): ${quality.constantColumns.join(', ')}`,
      reason:
        'Constant columns contain no variation and contribute zero predictive information to any model.',
      severity: 'required',
      affectedColumns: quality.constantColumns,
    });
  }

  // ── Numerical imputation ──────────────────────────────────────
  const numericalMissing = quality.missingValues
    .filter(m => {
      const f = features.find(f => f.name === m.column);
      return f?.type === 'numerical';
    })
    .map(m => m.column);

  if (numericalMissing.length > 0) {
    recs.push({
      category: 'numerical',
      action: `Apply median imputation to: ${numericalMissing.join(', ')}`,
      reason:
        'Median imputation is robust to outliers and does not shift the central tendency of the distribution.',
      severity: 'required',
      affectedColumns: numericalMissing,
    });
  }

  // ── Numerical scaling ─────────────────────────────────────────
  const numericalFeatures = nonTargetFeatures.filter(f => f.type === 'numerical');
  if (numericalFeatures.length > 0) {
    recs.push({
      category: 'numerical',
      action: 'Apply StandardScaler (or MinMaxScaler) to numerical features',
      reason:
        'Scale-sensitive models such as Logistic Regression and SVM require feature scaling to converge correctly and give equal weight to all features.',
      severity: 'recommended',
      affectedColumns: numericalFeatures.map(f => f.name),
    });
  }

  // ── Categorical imputation ────────────────────────────────────
  const categoricalMissing = quality.missingValues
    .filter(m => {
      const f = features.find(f => f.name === m.column);
      return f?.type === 'categorical' || f?.type === 'boolean';
    })
    .map(m => m.column);

  if (categoricalMissing.length > 0) {
    recs.push({
      category: 'categorical',
      action: `Apply most-frequent imputation to: ${categoricalMissing.join(', ')}`,
      reason:
        'Most-frequent (mode) imputation preserves the existing class distribution for categorical features.',
      severity: 'required',
      affectedColumns: categoricalMissing,
    });
  }

  // ── One-hot encoding ──────────────────────────────────────────
  const categoricalFeatures = nonTargetFeatures.filter(
    f => f.type === 'categorical' || f.type === 'boolean'
  );
  if (categoricalFeatures.length > 0) {
    const highCard = categoricalFeatures.filter(f => f.isHighCardinality);
    const normalCard = categoricalFeatures.filter(f => !f.isHighCardinality);

    if (normalCard.length > 0) {
      recs.push({
        category: 'categorical',
        action: `One-hot encode: ${normalCard.map(f => f.name).join(', ')}`,
        reason:
          'One-hot encoding converts categorical features into numerical form required by most ML models.',
        severity: 'required',
        affectedColumns: normalCard.map(f => f.name),
      });
    }

    if (highCard.length > 0) {
      recs.push({
        category: 'categorical',
        action: `Consider target encoding or frequency encoding for high-cardinality columns: ${highCard.map(f => f.name).join(', ')}`,
        reason:
          'One-hot encoding high-cardinality columns creates many sparse features. Target encoding or frequency encoding are more practical alternatives.',
        severity: 'recommended',
        affectedColumns: highCard.map(f => f.name),
      });
    }
  }

  // ── Duplicate rows ────────────────────────────────────────────
  if (quality.duplicateRowCount > 0) {
    recs.push({
      category: 'validation',
      action: `Inspect and consider removing ${quality.duplicateRowCount} duplicate row(s)`,
      reason:
        'Duplicate rows can cause data leakage between train and test splits, inflating evaluation metrics.',
      severity: 'recommended',
    });
  }

  // ── Train/test split strategy ─────────────────────────────────
  if (
    problemType === 'binary_classification' ||
    problemType === 'multiclass_classification'
  ) {
    recs.push({
      category: 'validation',
      action: 'Use stratified train/test split (e.g., 80/20)',
      reason:
        'Stratified splitting preserves the class distribution in both train and test sets, which is especially important for imbalanced datasets.',
      severity: 'required',
    });
  } else if (problemType === 'regression') {
    recs.push({
      category: 'validation',
      action: 'Use standard train/test split (e.g., 80/20)',
      reason:
        'A random split is appropriate for regression problems. Consider cross-validation for more robust evaluation.',
      severity: 'required',
    });
  }

  return recs;
}
