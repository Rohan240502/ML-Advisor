import React from 'react';
import type { DataQualityAnalysis } from '../types/analysis';

interface DataQualityCardProps {
  quality: DataQualityAnalysis;
}

const SCORE_CONFIG = {
  good:  { label: 'Good',  cls: 'badge-success', icon: '✓' },
  fair:  { label: 'Fair',  cls: 'badge-warning', icon: '~' },
  poor:  { label: 'Poor',  cls: 'badge-danger',  icon: '!' },
};

export function DataQualityCard({ quality }: DataQualityCardProps) {
  const score = SCORE_CONFIG[quality.overallScore];

  const hasIssues =
    quality.hasMissingValues ||
    quality.hasDuplicates ||
    quality.constantColumns.length > 0 ||
    quality.identifierColumns.length > 0 ||
    quality.highCardinalityColumns.length > 0;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="card-title">Data Quality</p>
            <p className="card-subtitle">Issues to address before training</p>
          </div>
          <span className={`badge ${score.cls}`}>{score.label}</span>
        </div>
      </div>

      {!hasIssues ? (
        <div className="quality-clean">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>No significant data quality issues detected.</span>
        </div>
      ) : (
        <div className="quality-issues">

          {/* Missing values */}
          {quality.missingValues.length > 0 && (
            <div className="quality-section">
              <p className="quality-section-title">Missing Values</p>
              <div className="missing-list">
                {quality.missingValues.map(m => (
                  <div key={m.column} className="missing-row">
                    <div className="missing-col-info">
                      <span className="font-mono text-sm">{m.column}</span>
                      <span className={`badge badge-sm ${m.percentage > 20 ? 'badge-danger' : m.percentage > 5 ? 'badge-warning' : 'badge-muted'}`}>
                        {m.count} ({m.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <p className="missing-suggestion">{m.suggestedImputation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicates */}
          {quality.hasDuplicates && (
            <div className="quality-section">
              <p className="quality-section-title">Duplicate Rows</p>
              <div className="quality-alert quality-alert-warning">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{quality.duplicateRowCount} duplicate row{quality.duplicateRowCount > 1 ? 's' : ''} detected. Inspect before training to avoid data leakage.</span>
              </div>
            </div>
          )}

          {/* Identifiers */}
          {quality.identifierColumns.length > 0 && (
            <div className="quality-section">
              <p className="quality-section-title">Possible Identifiers</p>
              <div className="tag-list">
                {quality.identifierColumns.map(col => (
                  <div key={col} className="quality-tag quality-tag-warning">
                    <span className="font-mono">{col}</span>
                    <span className="tag-note">Consider excluding from training</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constants */}
          {quality.constantColumns.length > 0 && (
            <div className="quality-section">
              <p className="quality-section-title">Constant Columns</p>
              <div className="tag-list">
                {quality.constantColumns.map(col => (
                  <div key={col} className="quality-tag quality-tag-muted">
                    <span className="font-mono">{col}</span>
                    <span className="tag-note">No variation — remove before training</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* High cardinality */}
          {quality.highCardinalityColumns.length > 0 && (
            <div className="quality-section">
              <p className="quality-section-title">High-Cardinality Categoricals</p>
              <div className="tag-list">
                {quality.highCardinalityColumns.map(({ column, uniqueCount }) => (
                  <div key={column} className="quality-tag quality-tag-info">
                    <span className="font-mono">{column}</span>
                    <span className="tag-note">{uniqueCount} unique values — use encoding carefully</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .quality-clean {
          display: flex; align-items: center; gap: var(--space-3);
          color: var(--success); font-size: var(--text-sm); font-weight: 500;
          padding: var(--space-3); background: var(--success-light);
          border-radius: var(--radius-sm);
        }
        .quality-issues { display: flex; flex-direction: column; gap: var(--space-5); }
        .quality-section {}
        .quality-section-title {
          font-size: var(--text-xs); font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: var(--space-3);
        }
        .missing-list { display: flex; flex-direction: column; gap: var(--space-2); }
        .missing-row {
          padding: var(--space-3);
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
        }
        .missing-col-info { display: flex; align-items: center; gap: var(--space-2); margin-bottom: 4px; }
        .missing-suggestion { font-size: var(--text-xs); color: var(--text-muted); }
        .quality-alert {
          display: flex; align-items: flex-start; gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
        }
        .quality-alert-warning { background: var(--warning-light); color: var(--warning); }
        .quality-alert svg { flex-shrink: 0; margin-top: 2px; }
        .tag-list { display: flex; flex-direction: column; gap: var(--space-2); }
        .quality-tag {
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
          flex-wrap: wrap;
        }
        .quality-tag-warning { background: var(--warning-light); color: var(--warning); }
        .quality-tag-muted { background: var(--bg-subtle); color: var(--text-secondary); }
        .quality-tag-info { background: var(--info-light); color: var(--info); }
        .tag-note { font-size: var(--text-xs); opacity: 0.85; }
        .badge-sm { font-size: 10px; padding: 2px 6px; }
      `}</style>
    </div>
  );
}
