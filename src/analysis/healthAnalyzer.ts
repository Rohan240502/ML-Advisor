import type {
  FeatureProfile,
  DataQualityAnalysis,
  ProblemRecommendation,
  DatasetHealthScore,
  HealthCategoryScore,
  SmartInsight,
  PipelineStep,
} from '../types/analysis';

export function calculateHealthScore(
  rowCount: number,
  columnCount: number,
  quality: DataQualityAnalysis,
  problem: ProblemRecommendation | null
): DatasetHealthScore {
  // 1. Completeness (100 - missing percentage penalty)
  const totalMissingCells = quality.missingValues.reduce((acc, m) => acc + m.count, 0);
  const totalCells = rowCount * Math.max(columnCount, 1);
  const missingRatio = totalCells > 0 ? totalMissingCells / totalCells : 0;
  const completenessScore = Math.max(0, Math.round(100 - missingRatio * 300));

  // 2. Balance (100 if regression or balanced; lower if imbalanced)
  let balanceScore = 95;
  if (problem?.imbalanceLevel === 'strong') balanceScore = 55;
  else if (problem?.imbalanceLevel === 'moderate') balanceScore = 75;

  // 3. Feature Quality (penalize constants and identifiers)
  let featureQualityScore = 90;
  if (quality.constantColumns.length > 0) featureQualityScore -= quality.constantColumns.length * 15;
  if (quality.highCardinalityColumns.length > 0) featureQualityScore -= quality.highCardinalityColumns.length * 10;
  featureQualityScore = Math.max(20, featureQualityScore);

  // 4. Dataset Size
  let sizeScore = 90;
  if (rowCount < 100) sizeScore = 40;
  else if (rowCount < 500) sizeScore = 65;
  else if (rowCount > 100_000) sizeScore = 95;

  // 5. Noise Risk (duplicate rows)
  const dupRatio = rowCount > 0 ? quality.duplicateRowCount / rowCount : 0;
  const noiseScore = Math.max(20, Math.round(100 - dupRatio * 400));

  const totalScore = Math.round(
    completenessScore * 0.25 +
    balanceScore * 0.2 +
    featureQualityScore * 0.2 +
    sizeScore * 0.2 +
    noiseScore * 0.15
  );

  const categories: HealthCategoryScore[] = [
    {
      name: 'Completeness',
      score: completenessScore,
      status: completenessScore >= 85 ? 'excellent' : completenessScore >= 70 ? 'good' : 'warning',
      description: missingRatio === 0 ? 'No missing cells detected' : `${(missingRatio * 100).toFixed(1)}% overall missing cells`,
    },
    {
      name: 'Balance',
      score: balanceScore,
      status: balanceScore >= 85 ? 'excellent' : balanceScore >= 70 ? 'good' : 'warning',
      description: problem?.imbalanceLevel === 'strong' ? 'Strong target class imbalance' : problem?.imbalanceLevel === 'moderate' ? 'Moderate class imbalance' : 'Balanced target distribution',
    },
    {
      name: 'Feature Quality',
      score: featureQualityScore,
      status: featureQualityScore >= 85 ? 'excellent' : featureQualityScore >= 70 ? 'good' : 'warning',
      description: quality.constantColumns.length > 0 ? `${quality.constantColumns.length} constant column(s)` : 'Clean feature diversity',
    },
    {
      name: 'Dataset Size',
      score: sizeScore,
      status: sizeScore >= 80 ? 'excellent' : sizeScore >= 60 ? 'good' : 'warning',
      description: `${rowCount.toLocaleString()} observations`,
    },
    {
      name: 'Noise Risk',
      score: noiseScore,
      status: noiseScore >= 85 ? 'excellent' : noiseScore >= 70 ? 'good' : 'warning',
      description: quality.duplicateRowCount > 0 ? `${quality.duplicateRowCount} duplicate row(s)` : 'Zero duplicate rows detected',
    },
  ];

  return { totalScore, categories };
}

export function generateSmartInsights(
  rowCount: number,
  features: FeatureProfile[],
  quality: DataQualityAnalysis,
  problem: ProblemRecommendation | null,
  targetColumn: string | null
): SmartInsight[] {
  const insights: SmartInsight[] = [];

  // Imbalance insight
  if (problem?.imbalanceLevel === 'strong' || problem?.imbalanceLevel === 'moderate') {
    const minClass = problem.classDistribution?.[problem.classDistribution.length - 1];
    insights.push({
      id: 'imbalance',
      type: 'warning',
      title: 'Class Imbalance Detected',
      description: minClass
        ? `Minority class "${minClass.label}" represents only ${minClass.percentage.toFixed(1)}% of samples. Consider stratified sampling or class weighting.`
        : 'Target distribution shows significant class imbalance.',
    });
  }

  // Missing values insight
  if (quality.hasMissingValues) {
    insights.push({
      id: 'missing',
      type: 'warning',
      title: 'Missing Values Found',
      description: `${quality.missingValues.length} column(s) contain missing values. Median imputation for numerical features and mode imputation for categorical features are recommended.`,
    });
  }

  // Size healthy insight
  if (rowCount >= 500) {
    insights.push({
      id: 'size',
      type: 'success',
      title: 'Dataset Size Looks Healthy',
      description: `With ${rowCount.toLocaleString()} observations, there are sufficient samples for standard supervised learning algorithms without severe sample starvation.`,
    });
  }

  // Scaling recommendation
  const numericals = features.filter(f => f.type === 'numerical' && f.name !== targetColumn);
  if (numericals.length > 0) {
    const hasDifferentScales = numericals.some(f => (f.max ?? 0) - (f.min ?? 0) > 100);
    if (hasDifferentScales) {
      insights.push({
        id: 'scaling',
        type: 'info',
        title: 'Feature Scaling Recommended',
        description: 'Several numerical columns operate on significantly different scales. Apply StandardScaler or MinMaxScaler before fitting distance-based or gradient-based models.',
      });
    }
  }

  // Identifiers insight
  if (quality.identifierColumns.length > 0) {
    insights.push({
      id: 'identifier',
      type: 'info',
      title: 'Identifier Columns Flagged',
      description: `Column(s) [${quality.identifierColumns.join(', ')}] appear to be high-cardinality keys. Excluding them prevents artificial data memorization.`,
    });
  }

  return insights;
}

export function generateMLPipeline(
  quality: DataQualityAnalysis,
  features: FeatureProfile[],
  targetColumn: string | null,
  topModelName: string
): PipelineStep[] {
  const steps: PipelineStep[] = [
    {
      stage: 1,
      title: 'Raw Dataset Ingestion',
      description: 'Parsed and profiled in-browser memory',
      status: 'recommended',
      badge: 'Completed',
    },
  ];

  let stage = 2;
  if (quality.hasMissingValues) {
    steps.push({
      stage: stage++,
      title: 'Missing Value Handling',
      description: 'Median imputation for numericals, mode imputation for categoricals',
      status: 'required',
      badge: 'Imputation Required',
    });
  }

  const categoricals = features.filter(f => (f.type === 'categorical' || f.type === 'boolean') && f.name !== targetColumn);
  if (categoricals.length > 0) {
    steps.push({
      stage: stage++,
      title: 'Categorical Encoding',
      description: `One-hot encoding applied to ${categoricals.length} categorical feature(s)`,
      status: 'required',
      badge: 'One-Hot Encoder',
    });
  }

  const numericals = features.filter(f => f.type === 'numerical' && f.name !== targetColumn);
  if (numericals.length > 0) {
    steps.push({
      stage: stage++,
      title: 'Feature Scaling',
      description: 'StandardScaler normalization for numeric variance alignment',
      status: 'recommended',
      badge: 'StandardScaler',
    });
  }

  steps.push({
    stage: stage++,
    title: `${topModelName || 'Gradient Boosting'} Estimator`,
    description: 'Hyperparameter fitting & candidate optimization',
    status: 'recommended',
    badge: 'Estimator',
  });

  steps.push({
    stage: stage++,
    title: 'Cross Validation & Evaluation',
    description: 'Stratified k-fold validation & metric assessment',
    status: 'recommended',
    badge: 'Validation',
  });

  return steps;
}
