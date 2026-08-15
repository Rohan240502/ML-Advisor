import React from 'react';
import type { DatasetAnalysis } from '../types/analysis';

interface TargetCardProps {
  analysis: DatasetAnalysis;
  onTargetChange: (column: string) => void;
}

export function TargetCard({ analysis, onTargetChange }: TargetCardProps) {
  const { target, selectedTarget, features } = analysis;

  const allColumns = features.map(f => f.name);
  const effectiveTarget = selectedTarget ?? target?.column ?? '';
  const confidence = target ? Math.round(target.confidence * 100) : 0;

  const isUserOverride = selectedTarget && selectedTarget !== target?.column;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div>
          <p className="card-title">Target Detection</p>
          <p className="card-subtitle">Column predicted by downstream models</p>
        </div>
      </div>

      {target?.hasLowConfidence && !isUserOverride ? (
        <div className="target-low-confidence">
          <div className="low-conf-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="low-conf-title">No Clear Target Identified</p>
            <p className="low-conf-desc">
              ML Advisor is uncertain which column you intend to predict.
              Please select your target column from the dropdown below.
            </p>
          </div>
        </div>
      ) : (
        <div className="target-display">
          <div className="target-name-row">
            <span className="target-column-name font-mono">{effectiveTarget}</span>
            {isUserOverride ? (
              <span className="badge badge-accent">User Override</span>
            ) : (
              <span className="badge badge-success">Top Match ({confidence}% Confidence)</span>
            )}
          </div>

          {!isUserOverride && target && (
            <>
              <div className="confidence-row">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Detection Score</span>
                <span className="confidence-pct font-mono">{confidence}%</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              {target.reasons.length > 0 && (
                <ul className="target-reasons">
                  {target.reasons.map((r, i) => (
                    <li key={i} className="target-reason">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      <div className="divider" />

      <div className="target-change">
        <label htmlFor="target-select" className="text-sm font-semibold text-secondary">
          Select alternative target column:
        </label>
        <select
          id="target-select"
          value={effectiveTarget}
          onChange={e => onTargetChange(e.target.value)}
        >
          {allColumns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <style>{`
        .target-low-confidence {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--warning-light);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius);
          color: var(--warning);
        }
        .low-conf-icon { flex-shrink: 0; margin-top: 2px; }
        .low-conf-title { font-family: var(--font-heading); font-weight: 700; font-size: var(--text-sm); margin-bottom: 4px; }
        .low-conf-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; }
        .target-display { display: flex; flex-direction: column; gap: var(--space-3); }
        .target-name-row { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
        .target-column-name {
          font-size: var(--text-2xl);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .confidence-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: var(--space-1);
        }
        .confidence-pct {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--accent);
        }
        .target-reasons {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: var(--space-2);
        }
        .target-reason {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .target-reason svg { color: var(--success); flex-shrink: 0; margin-top: 3px; }
        .target-change { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
