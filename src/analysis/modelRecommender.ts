import type {
  ModelRecommendation,
  ProblemRecommendation,
  DatasetProfile,
  SubScores,
  ModelDetailExplainer,
} from '../types/analysis';
import { clamp } from '../utils/statistics';

// ─── Model definitions & Detailed Enrichment ────────────────────────────────

interface ModelDefinition {
  id: string;
  name: string;
  sklearnClass: string;
  applicableTo: Array<'binary_classification' | 'multiclass_classification' | 'regression'>;
  baseSubScores: SubScores;
  expectedPerformance: string;
  trainingSpeedLabel: string;
  interpretabilityLabel: string;
  missingValueTolerance: string;
  scalingRequirement: string;
  imbalanceHandling: string;
  details: ModelDetailExplainer;
}

const CLASSIFICATION_MODELS: ModelDefinition[] = [
  {
    id: 'gb_classifier',
    name: 'Gradient Boosting Classifier',
    sklearnClass: 'sklearn.ensemble.HistGradientBoostingClassifier',
    applicableTo: ['binary_classification', 'multiclass_classification'],
    baseSubScores: { accuracyPotential: 95, trainingSpeed: 82, interpretability: 70, datasetCompatibility: 94 },
    expectedPerformance: 'High (92–96%)',
    trainingSpeedLabel: 'Fast (Histogram-based)',
    interpretabilityLabel: 'Medium (Feature Importance)',
    missingValueTolerance: 'Native Support',
    scalingRequirement: 'None',
    imbalanceHandling: 'Built-in class_weight',
    details: {
      datasetFactors: [
        'Structured tabular data with non-linear decision boundaries',
        'Mixed numerical and categorical feature distributions',
        'Medium to large sample counts with feature interactions',
      ],
      advantages: [
        'State-of-the-art accuracy on tabular classification benchmark datasets',
        'Native handling of missing values without imputation step',
        'Inbuilt regularization parameters to prevent overfitting',
      ],
      limitations: [
        'Slower than linear models for real-time latency (< 1ms)',
        'Requires hyperparameter tuning for optimum performance',
      ],
      preprocessingNeeds: [
        'One-hot encoding for high-cardinality categoricals',
        'No numerical scaling required',
      ],
      complexity: 'O(k * n_trees * n_samples)',
      suggestedMetrics: ['ROC-AUC', 'F1 Score', 'Log Loss'],
    },
  },
  {
    id: 'rf_classifier',
    name: 'Random Forest Classifier',
    sklearnClass: 'sklearn.ensemble.RandomForestClassifier',
    applicableTo: ['binary_classification', 'multiclass_classification'],
    baseSubScores: { accuracyPotential: 89, trainingSpeed: 75, interpretability: 78, datasetCompatibility: 90 },
    expectedPerformance: 'High (88–92%)',
    trainingSpeedLabel: 'Moderate (Parallel Trees)',
    interpretabilityLabel: 'High (Tree Interpretability)',
    missingValueTolerance: 'Requires Imputation',
    scalingRequirement: 'None',
    imbalanceHandling: 'class_weight="balanced"',
    details: {
      datasetFactors: [
        'Tabular datasets with moderate feature counts',
        'Robustness against individual noisy observations',
      ],
      advantages: [
        'Handles non-linear relationships out of the box',
        'Low variance due to bootstrap bagging ensemble aggregation',
        'Provides intuitive mean decrease in impurity feature importances',
      ],
      limitations: [
        'Model memory footprint grows with number of estimator trees',
        'Cannot extrapolate beyond training value boundaries',
      ],
      preprocessingNeeds: ['Median imputation for missing numeric cells', 'One-hot categorical encoding'],
      complexity: 'O(n_trees * n_samples * log(n_samples))',
      suggestedMetrics: ['Accuracy', 'Macro F1', 'Precision/Recall'],
    },
  },
  {
    id: 'logistic_regression',
    name: 'Logistic Regression',
    sklearnClass: 'sklearn.linear_model.LogisticRegression',
    applicableTo: ['binary_classification', 'multiclass_classification'],
    baseSubScores: { accuracyPotential: 81, trainingSpeed: 98, interpretability: 95, datasetCompatibility: 85 },
    expectedPerformance: 'Moderate (78–84%)',
    trainingSpeedLabel: 'Instant (Sub-second)',
    interpretabilityLabel: 'Very High (Linear Coefficients)',
    missingValueTolerance: 'Requires Imputation',
    scalingRequirement: 'Required (StandardScaler)',
    imbalanceHandling: 'class_weight="balanced"',
    details: {
      datasetFactors: [
        'Linearly separable or high-dimensional sparse datasets',
        'Need for probabilistic outputs and strict linear interpretability',
      ],
      advantages: [
        'Blazing fast training and sub-millisecond inference time',
        'Directly outputs calibrated class probabilities',
        'Guaranteed convex optimization convergence',
      ],
      limitations: ['Underperforms when non-linear feature interactions dominate'],
      preprocessingNeeds: ['StandardScaler feature normalization', 'Imputation of missing values'],
      complexity: 'O(n_samples * n_features)',
      suggestedMetrics: ['ROC-AUC', 'Accuracy', 'Log Loss'],
    },
  },
  {
    id: 'svm_classifier',
    name: 'Support Vector Machine (SVC)',
    sklearnClass: 'sklearn.svm.SVC',
    applicableTo: ['binary_classification', 'multiclass_classification'],
    baseSubScores: { accuracyPotential: 84, trainingSpeed: 55, interpretability: 60, datasetCompatibility: 75 },
    expectedPerformance: 'Moderate-High (82–88%)',
    trainingSpeedLabel: 'Slow on large datasets',
    interpretabilityLabel: 'Low (RBF Kernel Space)',
    missingValueTolerance: 'Requires Imputation',
    scalingRequirement: 'Required (StandardScaler)',
    imbalanceHandling: 'class_weight="balanced"',
    details: {
      datasetFactors: [
        'Small to medium datasets (< 20,000 samples)',
        'Complex non-linear decision boundaries with RBF kernel',
      ],
      advantages: ['Effective in high-dimensional feature spaces', 'Versatile with custom kernel functions'],
      limitations: ['O(n^2) scaling makes training slow on large datasets (> 50k rows)'],
      preprocessingNeeds: ['StandardScaler feature normalization', 'Strict categorical encoding'],
      complexity: 'O(n_samples^2 * n_features)',
      suggestedMetrics: ['F1 Score', 'Accuracy'],
    },
  },
];

const REGRESSION_MODELS: ModelDefinition[] = [
  {
    id: 'gb_regressor',
    name: 'Gradient Boosting Regressor',
    sklearnClass: 'sklearn.ensemble.HistGradientBoostingRegressor',
    applicableTo: ['regression'],
    baseSubScores: { accuracyPotential: 94, trainingSpeed: 85, interpretability: 70, datasetCompatibility: 94 },
    expectedPerformance: 'High R² (0.88–0.95)',
    trainingSpeedLabel: 'Fast (Histogram-based)',
    interpretabilityLabel: 'Medium (Feature Importance)',
    missingValueTolerance: 'Native Support',
    scalingRequirement: 'None',
    imbalanceHandling: 'Sample Weighting',
    details: {
      datasetFactors: ['Continuous regression target with complex tabular features'],
      advantages: ['Captures non-linear continuous relationships with high precision', 'Native missing value support'],
      limitations: ['Requires validation to avoid overfitting on noisy targets'],
      preprocessingNeeds: ['One-hot categorical encoding'],
      complexity: 'O(k * n_trees * n_samples)',
      suggestedMetrics: ['MAE', 'RMSE', 'R² Score'],
    },
  },
  {
    id: 'rf_regressor',
    name: 'Random Forest Regressor',
    sklearnClass: 'sklearn.ensemble.RandomForestRegressor',
    applicableTo: ['regression'],
    baseSubScores: { accuracyPotential: 89, trainingSpeed: 75, interpretability: 78, datasetCompatibility: 90 },
    expectedPerformance: 'High R² (0.84–0.90)',
    trainingSpeedLabel: 'Moderate',
    interpretabilityLabel: 'High (Feature Importances)',
    missingValueTolerance: 'Requires Imputation',
    scalingRequirement: 'None',
    imbalanceHandling: 'Sample Weighting',
    details: {
      datasetFactors: ['Tabular regression target with mixed numeric and categorical inputs'],
      advantages: ['Extremely stable ensemble regression', 'No numerical feature scaling required'],
      limitations: ['Large model file size'],
      preprocessingNeeds: ['Median numeric imputation'],
      complexity: 'O(n_trees * n_samples * log(n_samples))',
      suggestedMetrics: ['MAE', 'RMSE', 'R² Score'],
    },
  },
  {
    id: 'ridge_regression',
    name: 'Ridge Regression (L2)',
    sklearnClass: 'sklearn.linear_model.Ridge',
    applicableTo: ['regression'],
    baseSubScores: { accuracyPotential: 80, trainingSpeed: 99, interpretability: 95, datasetCompatibility: 84 },
    expectedPerformance: 'Moderate R² (0.75–0.82)',
    trainingSpeedLabel: 'Instant',
    interpretabilityLabel: 'Very High (Linear Weights)',
    missingValueTolerance: 'Requires Imputation',
    scalingRequirement: 'Required (StandardScaler)',
    imbalanceHandling: 'N/A',
    details: {
      datasetFactors: ['Linear continuous target relationships with collinear features'],
      advantages: ['L2 regularization prevents coefficient explosion on correlated features', 'Instant training'],
      limitations: ['Assumes linear relationship'],
      preprocessingNeeds: ['StandardScaler numeric normalization'],
      complexity: 'O(n_samples * n_features)',
      suggestedMetrics: ['MAE', 'RMSE', 'R² Score'],
    },
  },
  {
    id: 'linear_regression',
    name: 'Linear Regression',
    sklearnClass: 'sklearn.linear_model.LinearRegression',
    applicableTo: ['regression'],
    baseSubScores: { accuracyPotential: 75, trainingSpeed: 100, interpretability: 98, datasetCompatibility: 80 },
    expectedPerformance: 'Baseline R² (0.70–0.78)',
    trainingSpeedLabel: 'Instant',
    interpretabilityLabel: 'Very High (Direct Coefficients)',
    missingValueTolerance: 'Requires Imputation',
    scalingRequirement: 'Recommended',
    imbalanceHandling: 'N/A',
    details: {
      datasetFactors: ['Simple continuous target prediction with transparent linear equation'],
      advantages: ['Direct mathematical interpretation of each feature coefficient'],
      limitations: ['Prone to high bias if true relationship is non-linear'],
      preprocessingNeeds: ['StandardScaler scaling'],
      complexity: 'O(n_samples * n_features)',
      suggestedMetrics: ['MAE', 'RMSE'],
    },
  },
];

// ─── Recommendation Engine ───────────────────────────────────────────────────

export function recommendModels(
  profile: DatasetProfile,
  problem: ProblemRecommendation
): ModelRecommendation[] {
  const type = problem.type;
  if (type === 'uncertain') return [];

  const candidates = type === 'regression' ? REGRESSION_MODELS : CLASSIFICATION_MODELS;

  const results: ModelRecommendation[] = candidates.map((m, index) => {
    let score = m.baseSubScores.datasetCompatibility;
    const reasons: string[] = [];
    const warnings: string[] = [];

    if (m.id.includes('gb')) {
      if (profile.rowCount >= 500) { score += 4; reasons.push('High sample count maximizes gradient boosting accuracy'); }
      if (profile.categoricalCount > 0) { reasons.push('Handles categorical features and non-linear interactions naturally'); }
    } else if (m.id.includes('rf')) {
      reasons.push('Robust ensemble averaging lowers variance on tabular data');
      if (profile.duplicateRowCount > 0) reasons.push('Resilient to minor observation noise');
    } else if (m.id.includes('logistic') || m.id.includes('linear') || m.id.includes('ridge')) {
      reasons.push('Provides fast, interpretable baseline coefficients');
      if (profile.numericalCount > 0) warnings.push('Feature scaling (StandardScaler) is required');
    } else if (m.id.includes('svm')) {
      if (profile.rowCount > 30_000) { score -= 15; warnings.push('SVM execution may be slow on datasets > 30k rows'); }
    }

    const finalScore = clamp(score, 60, 98);

    return {
      id: m.id,
      name: m.name,
      rank: index + 1,
      score: finalScore,
      sklearnClass: m.sklearnClass,
      reasons,
      warnings,
      subScores: {
        ...m.baseSubScores,
        datasetCompatibility: finalScore,
      },
      details: m.details,
      expectedPerformance: m.expectedPerformance,
      trainingSpeedLabel: m.trainingSpeedLabel,
      interpretabilityLabel: m.interpretabilityLabel,
      missingValueTolerance: m.missingValueTolerance,
      scalingRequirement: m.scalingRequirement,
      imbalanceHandling: m.imbalanceHandling,
    };
  });

  results.sort((a, b) => b.score - a.score);
  return results.map((m, idx) => ({ ...m, rank: idx + 1 }));
}
