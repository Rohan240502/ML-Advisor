// ─── Feature Types ───────────────────────────────────────────────────────────

export type FeatureType =
  | 'numerical'
  | 'categorical'
  | 'boolean'
  | 'datetime'
  | 'identifier'
  | 'constant';

export interface FeatureProfile {
  name: string;
  type: FeatureType;
  uniqueCount: number;
  uniqueRatio: number;
  missingCount: number;
  missingPercentage: number;
  sampleValues: string[];
  // Numerical stats
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  // Categorical
  topCategories?: Array<{ value: string; count: number }>;
  isHighCardinality?: boolean;
}

// ─── Dataset Profile ─────────────────────────────────────────────────────────

export interface DatasetProfile {
  rowCount: number;
  columnCount: number;
  duplicateRowCount: number;
  features: FeatureProfile[];
  numericalCount: number;
  categoricalCount: number;
  booleanCount: number;
  datetimeCount: number;
  identifierCount: number;
  constantCount: number;
}

// ─── Target Detection ─────────────────────────────────────────────────────────

export interface TargetCandidate {
  column: string;
  score: number;
  confidence: number;
  reasons: string[];
}

export interface TargetRecommendation {
  column: string;
  score: number;
  confidence: number;
  reasons: string[];
  alternatives: TargetCandidate[];
  hasLowConfidence: boolean;
}

// ─── Problem Detection ────────────────────────────────────────────────────────

export type ProblemType =
  | 'binary_classification'
  | 'multiclass_classification'
  | 'regression'
  | 'uncertain';

export interface ProblemRecommendation {
  type: ProblemType;
  confidence: number;
  reasons: string[];
  needsUserConfirmation: boolean;
  classDistribution?: Array<{ label: string; count: number; percentage: number }>;
  imbalanceLevel?: 'none' | 'moderate' | 'strong';
}

// ─── Data Quality & Health ──────────────────────────────────────────────────

export interface MissingValueInfo {
  column: string;
  count: number;
  percentage: number;
  suggestedImputation: string;
}

export interface DataQualityAnalysis {
  missingValues: MissingValueInfo[];
  duplicateRowCount: number;
  constantColumns: string[];
  identifierColumns: string[];
  highCardinalityColumns: Array<{ column: string; uniqueCount: number }>;
  hasMissingValues: boolean;
  hasDuplicates: boolean;
  overallScore: 'good' | 'fair' | 'poor';
}

export interface HealthCategoryScore {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
}

export interface DatasetHealthScore {
  totalScore: number;
  categories: HealthCategoryScore[];
}

export interface SmartInsight {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
}

// ─── Preprocessing ────────────────────────────────────────────────────────────

export type PreprocessingCategory =
  | 'numerical'
  | 'categorical'
  | 'identifier'
  | 'constant'
  | 'validation';

export interface PreprocessingRecommendation {
  category: PreprocessingCategory;
  action: string;
  reason: string;
  severity: 'required' | 'recommended' | 'optional';
  affectedColumns?: string[];
}

// ─── Model Recommendations ────────────────────────────────────────────────────

export interface SubScores {
  accuracyPotential: number; // 0-100
  trainingSpeed: number;     // 0-100
  interpretability: number;  // 0-100
  datasetCompatibility: number; // 0-100
}

export interface ModelDetailExplainer {
  datasetFactors: string[];
  advantages: string[];
  limitations: string[];
  preprocessingNeeds: string[];
  complexity: string;
  suggestedMetrics: string[];
}

export interface ModelRecommendation {
  id: string;
  name: string;
  rank: number;
  score: number; // 0-100 (Compatibility Score)
  sklearnClass: string;
  reasons: string[];
  warnings: string[];
  subScores: SubScores;
  details: ModelDetailExplainer;
  // Comparison metrics
  expectedPerformance: string;
  trainingSpeedLabel: string;
  interpretabilityLabel: string;
  missingValueTolerance: string;
  scalingRequirement: string;
  imbalanceHandling: string;
}

// ─── Metrics & Validation ──────────────────────────────────────────────────────

export interface MetricRecommendation {
  primaryMetric: string;
  secondaryMetrics: string[];
  reason: string;
}

export interface ValidationRecommendation {
  strategy: string;
  reason: string;
}

// ─── ML Recommended Visual Pipeline Step ──────────────────────────────────────

export interface PipelineStep {
  stage: number;
  title: string;
  description: string;
  status: 'recommended' | 'required' | 'optional';
  badge: string;
}

// ─── Top-Level Result Object ──────────────────────────────────────────────────

export interface DatasetAnalysis {
  fileName: string;
  analyzedAt: string;

  dataset: {
    rowCount: number;
    columnCount: number;
  };

  features: FeatureProfile[];

  target: TargetRecommendation | null;
  selectedTarget: string | null;

  problem: ProblemRecommendation | null;
  selectedProblemType: ProblemType | null;

  quality: DataQualityAnalysis;
  health: DatasetHealthScore;
  insights: SmartInsight[];

  preprocessing: PreprocessingRecommendation[];
  pipeline: PipelineStep[];

  models: ModelRecommendation[];

  metrics: MetricRecommendation;
  validation: ValidationRecommendation;
}

// ─── Worker Messages ──────────────────────────────────────────────────────────

export type WorkerMessageType =
  | 'ANALYZE_DATASET'
  | 'PROGRESS'
  | 'ANALYSIS_COMPLETE'
  | 'ANALYSIS_ERROR';

export interface WorkerInMessage {
  type: 'ANALYZE_DATASET';
  payload: {
    headers: string[];
    rows: string[][];
    fileName: string;
    targetOverride?: string;
    problemTypeOverride?: ProblemType;
  };
}

export interface WorkerProgressMessage {
  type: 'PROGRESS';
  payload: {
    step: string;
    completed: string[];
    current: string;
    pending: string[];
  };
}

export interface WorkerCompleteMessage {
  type: 'ANALYSIS_COMPLETE';
  payload: DatasetAnalysis;
}

export interface WorkerErrorMessage {
  type: 'ANALYSIS_ERROR';
  payload: { message: string };
}

export type WorkerOutMessage =
  | WorkerProgressMessage
  | WorkerCompleteMessage
  | WorkerErrorMessage;

// ─── Parsed CSV ───────────────────────────────────────────────────────────────

export interface ParsedCSV {
  headers: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
  fileName: string;
  fileSizeBytes: number;
}
