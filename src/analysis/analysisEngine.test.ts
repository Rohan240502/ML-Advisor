import { describe, it, expect } from 'vitest';
import { profileDataset } from './datasetProfiler';
import { detectTarget } from './targetDetector';
import { detectProblem } from './problemDetector';
import { recommendModels } from './modelRecommender';

describe('ML Advisor Analysis Engine', () => {
  it('profiles tabular CSV dataset correctly', () => {
    const headers = ['id', 'age', 'income', 'country', 'churn'];
    const rows = [
      ['1', '25', '45000', 'US', 'No'],
      ['2', '32', '62000', 'US', 'Yes'],
      ['3', '45', '89000', 'UK', 'No'],
      ['4', '22', '31000', 'US', 'No'],
    ];

    const profile = profileDataset(headers, rows);

    expect(profile.rowCount).toBe(4);
    expect(profile.columnCount).toBe(5);

    const idFeat = profile.features.find(f => f.name === 'id');
    expect(idFeat?.type).toBe('identifier');

    const churnFeat = profile.features.find(f => f.name === 'churn');
    expect(churnFeat?.type).toBe('boolean');
    expect(churnFeat?.uniqueCount).toBe(2);
  });

  it('detects binary classification target (churn)', () => {
    const headers = ['user_id', 'tenure', 'monthly_charges', 'churn'];
    const rows = [
      ['101', '12', '55.4', 'No'],
      ['102', '24', '70.2', 'Yes'],
      ['103', '3', '20.1', 'No'],
      ['104', '48', '95.0', 'Yes'],
    ];

    const profile = profileDataset(headers, rows);
    const targetRec = detectTarget(profile.features, profile.rowCount);

    expect(targetRec?.column).toBe('churn');
    expect(targetRec?.confidence).toBeGreaterThan(0.6);

    const targetFeat = profile.features.find(f => f.name === 'churn')!;
    const problemRec = detectProblem(targetFeat, ['No', 'Yes', 'No', 'Yes']);

    expect(problemRec.type).toBe('binary_classification');
  });

  it('detects regression target (house prices)', () => {
    const headers = ['sqft', 'bedrooms', 'year_built', 'price'];
    const prices = [
      '350000', '520000', '210000', '780000', '410000',
      '620000', '290000', '850000', '460000', '510000',
      '390000', '680000', '310000', '920000', '440000'
    ];
    const rows = prices.map((p, i) => [`${1000 + i * 100}`, '3', '2000', p]);

    const profile = profileDataset(headers, rows);
    const targetRec = detectTarget(profile.features, profile.rowCount);

    expect(targetRec?.column).toBe('price');

    const targetFeat = profile.features.find(f => f.name === 'price')!;
    const problemRec = detectProblem(targetFeat, prices);

    expect(problemRec.type).toBe('regression');

    const models = recommendModels(profile, problemRec);
    expect(models.length).toBeGreaterThanOrEqual(3);
    expect(models[0].score).toBeGreaterThan(0);
  });
});
