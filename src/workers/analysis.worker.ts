/// <reference lib="webworker" />

import type {
  WorkerInMessage,
  WorkerOutMessage,
  DatasetAnalysis,
  ProblemType,
} from '../types/analysis';

import { profileDataset } from '../analysis/datasetProfiler';
import { detectTarget } from '../analysis/targetDetector';
import { detectProblem } from '../analysis/problemDetector';
import { analyzeQuality } from '../analysis/qualityAnalyzer';
import { recommendPreprocessing } from '../analysis/preprocessingRecommender';
import { recommendModels } from '../analysis/modelRecommender';
import { recommendMetrics } from '../analysis/metricRecommender';
import {
  calculateHealthScore,
  generateSmartInsights,
  generateMLPipeline,
} from '../analysis/healthAnalyzer';

const ANALYSIS_STEPS = [
  'Reading dataset columns',
  'Profiling feature types & distributions',
  'Checking data quality & duplicates',
  'Detecting target column candidate',
  'Determining ML problem classification',
  'Calculating dataset health score',
  'Generating smart data insights',
  'Building preprocessing pipeline',
  'Ranking scikit-learn algorithms',
  'Selecting evaluation metrics',
];

function postProgress(completed: string[], current: string) {
  const pending = ANALYSIS_STEPS.filter(
    s => !completed.includes(s) && s !== current
  );
  const msg: WorkerOutMessage = {
    type: 'PROGRESS',
    payload: { step: current, completed, current, pending },
  };
  self.postMessage(msg);
}

self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const { type, payload } = event.data;
  if (type !== 'ANALYZE_DATASET') return;

  const { headers, rows, fileName, targetOverride, problemTypeOverride } = payload;
  const completed: string[] = [];

  try {
    postProgress(completed, 'Reading dataset columns');
    completed.push('Reading dataset columns');

    postProgress(completed, 'Profiling feature types & distributions');
    const profile = profileDataset(headers, rows);
    completed.push('Profiling feature types & distributions');

    postProgress(completed, 'Checking data quality & duplicates');
    completed.push('Checking data quality & duplicates');

    postProgress(completed, 'Detecting target column candidate');
    const targetRec = detectTarget(profile.features, profile.rowCount);
    const effectiveTarget = targetOverride ?? targetRec?.column ?? null;
    const targetFeature = profile.features.find(f => f.name === effectiveTarget) ?? null;
    completed.push('Detecting target column candidate');

    postProgress(completed, 'Determining ML problem classification');
    let problemRec = null;
    if (targetFeature) {
      const colIdx = headers.indexOf(effectiveTarget!);
      const targetValues = rows.map(r => r[colIdx] ?? '');
      problemRec = detectProblem(targetFeature, targetValues);
    }

    if (problemTypeOverride && problemRec) {
      problemRec = { ...problemRec, type: problemTypeOverride };
    } else if (problemTypeOverride) {
      problemRec = {
        type: problemTypeOverride,
        confidence: 1,
        reasons: ['Problem type manually selected by user'],
        needsUserConfirmation: false,
        imbalanceLevel: 'none' as const,
      };
    }
    completed.push('Determining ML problem classification');

    postProgress(completed, 'Calculating dataset health score');
    const quality = analyzeQuality(
      profile.features,
      profile.duplicateRowCount,
      profile.rowCount,
      effectiveTarget,
      problemRec?.type ?? null
    );

    const health = calculateHealthScore(
      profile.rowCount,
      profile.columnCount,
      quality,
      problemRec
    );
    completed.push('Calculating dataset health score');

    postProgress(completed, 'Generating smart data insights');
    const insights = generateSmartInsights(
      profile.rowCount,
      profile.features,
      quality,
      problemRec,
      effectiveTarget
    );
    completed.push('Generating smart data insights');

    postProgress(completed, 'Building preprocessing pipeline');
    const preprocessing = recommendPreprocessing(
      profile.features,
      quality,
      effectiveTarget,
      problemRec?.type ?? null
    );
    completed.push('Building preprocessing pipeline');

    postProgress(completed, 'Ranking scikit-learn algorithms');
    const models =
      problemRec && problemRec.type !== 'uncertain'
        ? recommendModels(profile, problemRec)
        : [];
    completed.push('Ranking scikit-learn algorithms');

    postProgress(completed, 'Selecting evaluation metrics');
    const { metrics, validation } = recommendMetrics(
      problemRec?.type ?? 'uncertain',
      problemRec
    );

    const topModelName = models[0]?.name ?? 'Gradient Boosting';
    const pipeline = generateMLPipeline(quality, profile.features, effectiveTarget, topModelName);
    completed.push('Selecting evaluation metrics');

    const result: DatasetAnalysis = {
      fileName,
      analyzedAt: new Date().toISOString(),
      dataset: {
        rowCount: profile.rowCount,
        columnCount: profile.columnCount,
      },
      features: profile.features,
      target: targetRec,
      selectedTarget: effectiveTarget,
      problem: problemRec,
      selectedProblemType: (problemTypeOverride ?? problemRec?.type ?? null) as ProblemType | null,
      quality,
      health,
      insights,
      preprocessing,
      pipeline,
      models,
      metrics,
      validation,
    };

    const completeMsg: WorkerOutMessage = {
      type: 'ANALYSIS_COMPLETE',
      payload: result,
    };
    self.postMessage(completeMsg);
  } catch (err: unknown) {
    const errorMsg: WorkerOutMessage = {
      type: 'ANALYSIS_ERROR',
      payload: {
        message: err instanceof Error ? err.message : 'An unexpected error occurred during analysis.',
      },
    };
    self.postMessage(errorMsg);
  }
};
