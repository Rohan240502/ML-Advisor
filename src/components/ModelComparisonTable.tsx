import React, { useState } from 'react';
import type { ModelRecommendation } from '../types/analysis';

interface ModelComparisonTableProps {
  models: ModelRecommendation[];
}

export function ModelComparisonTable({ models }: ModelComparisonTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    models.slice(0, 3).map(m => m.id)
  );

  if (models.length === 0) return null;

  const toggleModel = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(i => i !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const comparedModels = models.filter(m => selectedIds.includes(m.id));

  const comparisonRows = [
    { label: 'Compatibility Score', key: 'score', render: (m: ModelRecommendation) => <span className="font-bold text-accent">{m.score}%</span> },
    { label: 'Expected Performance', key: 'expectedPerformance', render: (m: ModelRecommendation) => m.expectedPerformance },
    { label: 'Training Speed', key: 'trainingSpeedLabel', render: (m: ModelRecommendation) => m.trainingSpeedLabel },
    { label: 'Interpretability', key: 'interpretabilityLabel', render: (m: ModelRecommendation) => m.interpretabilityLabel },
    { label: 'Missing Value Tolerance', key: 'missingValueTolerance', render: (m: ModelRecommendation) => m.missingValueTolerance },
    { label: 'Scaling Requirement', key: 'scalingRequirement', render: (m: ModelRecommendation) => m.scalingRequirement },
    { label: 'Imbalance Handling', key: 'imbalanceHandling', render: (m: ModelRecommendation) => m.imbalanceHandling },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
        <div>
          <p className="card-title">Model Architecture Comparison</p>
          <p className="card-subtitle">Side-by-side trade-off matrix for selected algorithms</p>
        </div>
      </div>

      {/* Model Selector Pills */}
      <div className="model-selector-row">
        <span className="text-xs font-semibold text-muted uppercase">Select up to 3 models:</span>
        <div className="flex flex-wrap gap-2">
          {models.map(m => {
            const isSelected = selectedIds.includes(m.id);
            return (
              <button
                key={m.id}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleModel(m.id)}
              >
                {isSelected ? '✓ ' : '+ '}
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="row-header-th">Criteria / Dimension</th>
              {comparedModels.map(m => (
                <th key={m.id} className={m.rank === 1 ? 'featured-th' : ''}>
                  <div className="th-content">
                    <span className="th-rank font-mono">#{m.rank}</span>
                    <span className="th-name">{m.name}</span>
                    {m.rank === 1 && <span className="badge badge-sm badge-accent">Top Match</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map(row => (
              <tr key={row.key}>
                <td className="row-label-td">{row.label}</td>
                {comparedModels.map(m => (
                  <td key={m.id} className={m.rank === 1 ? 'featured-td' : ''}>
                    {row.render(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .model-selector-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-5);
          flex-wrap: wrap;
        }

        .comparison-table-wrapper {
          overflow-x: auto;
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        .comparison-table th, .comparison-table td {
          padding: var(--space-3) var(--space-4);
          text-align: left;
          border-bottom: 1px solid var(--border);
          font-size: var(--text-sm);
        }

        .row-header-th {
          width: 220px;
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .th-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .th-rank { font-weight: 800; color: var(--accent); }
        .th-name { font-family: var(--font-heading); font-weight: 700; color: var(--text-primary); }

        .row-label-td {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .featured-th, .featured-td {
          background: var(--accent-light);
        }
      `}</style>
    </div>
  );
}
