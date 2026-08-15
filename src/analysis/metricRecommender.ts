import type {
  MetricRecommendation,
  ValidationRecommendation,
  ProblemType,
  ProblemRecommendation,
} from '../types/analysis';

/**
 * Recommend evaluation metrics and validation strategy.
 */
export function recommendMetrics(
  problemType: ProblemType,
  problem: ProblemRecommendation | null
): { metrics: MetricRecommendation; validation: ValidationRecommendation } {
  const imbalance = problem?.imbalanceLevel ?? 'none';

  if (problemType === 'binary_classification') {
    if (imbalance === 'strong' || imbalance === 'moderate') {
      return {
        metrics: {
          primaryMetric: 'F1 Score',
          secondaryMetrics: ['Precision', 'Recall', 'ROC-AUC'],
          reason:
            'Class imbalance detected. F1 Score balances Precision and Recall and is more informative than Accuracy on imbalanced datasets. ROC-AUC measures rank-ordering ability regardless of threshold.',
        },
        validation: {
          strategy: 'Stratified Train/Test Split (80/20)',
          reason:
            'Stratified splitting preserves the class imbalance ratio in both train and test sets, preventing misleading evaluation.',
        },
      };
    }
    return {
      metrics: {
        primaryMetric: 'ROC-AUC',
        secondaryMetrics: ['F1 Score', 'Precision', 'Recall', 'Accuracy'],
        reason:
          'ROC-AUC measures the model\'s ability to distinguish between classes across all thresholds. For balanced binary classification it is a robust primary metric.',
      },
      validation: {
        strategy: 'Stratified Train/Test Split (80/20)',
        reason: 'Stratified splits ensure both classes are represented proportionally in train and test sets.',
      },
    };
  }

  if (problemType === 'multiclass_classification') {
    if (imbalance === 'strong' || imbalance === 'moderate') {
      return {
        metrics: {
          primaryMetric: 'Macro F1 Score',
          secondaryMetrics: ['Per-class Precision', 'Per-class Recall', 'Weighted F1'],
          reason:
            'Macro F1 treats all classes equally regardless of frequency, which is important when some classes are underrepresented.',
        },
        validation: {
          strategy: 'Stratified Train/Test Split (80/20)',
          reason: 'Stratification ensures minority classes appear in both train and test sets.',
        },
      };
    }
    return {
      metrics: {
        primaryMetric: 'Accuracy',
        secondaryMetrics: ['Macro F1 Score', 'Per-class Precision', 'Per-class Recall'],
        reason:
          'Accuracy is interpretable for balanced multiclass problems. Supplement with per-class metrics to detect weak classes.',
      },
      validation: {
        strategy: 'Stratified Train/Test Split (80/20)',
        reason: 'Stratified splits maintain class distribution across folds.',
      },
    };
  }

  if (problemType === 'regression') {
    return {
      metrics: {
        primaryMetric: 'MAE (Mean Absolute Error)',
        secondaryMetrics: ['RMSE (Root Mean Squared Error)', 'R² Score'],
        reason:
          'MAE is easy to interpret in the original units of the target and is robust to outliers. RMSE penalizes large errors more heavily. R² shows the proportion of variance explained.',
      },
      validation: {
        strategy: 'Standard Train/Test Split (80/20)',
        reason: 'A random split is sufficient for regression. Consider k-fold cross-validation for smaller datasets.',
      },
    };
  }

  // Uncertain
  return {
    metrics: {
      primaryMetric: 'Depends on problem type',
      secondaryMetrics: [],
      reason: 'Please select a target and confirm the problem type to receive metric recommendations.',
    },
    validation: {
      strategy: 'Confirm problem type first',
      reason: 'Validation strategy depends on whether this is classification or regression.',
    },
  };
}
