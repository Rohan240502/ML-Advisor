import React from 'react';
import type { DatasetAnalysis, ProblemType } from '../types/analysis';
import { problemTypeLabel } from '../utils/helpers';

interface ProblemCardProps {
  analysis: DatasetAnalysis;
  onProblemTypeChange: (type: ProblemType) => void;
}

const PROBLEM_TYPE_ICONS: Record<string, React.ReactNode> = {
  binary_classification: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
    </svg>
  ),
  multiclass_classification: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="12" cy="18" r="3" />
      <line x1="6" y1="9" x2="12" y2="15" /><line x1="18" y1="9" x2="12" y2="15" />
    </svg>
  ),
  regression: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  uncertain: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const IMBALANCE_LABELS = {
  none: null,
  moderate: { label: 'Moderate Class Imbalance', cls: 'badge-warning' },
  strong: { label: 'Strong Class Imbalance', cls: 'badge-danger' },
};

const PROBLEM_TYPES: Array<{ value: ProblemType; label: string }> = [
  { value: 'binary_classification', label: 'Binary Classification' },
  { value: 'multiclass_classification', label: 'Multiclass Classification' },
  { value: 'regression', label: 'Regression' },
  { value: 'uncertain', label: 'Uncertain / Not sure' },
];

export function ProblemCard({ analysis, onProblemTypeChange }: ProblemCardProps) {
  const { problem, selectedProblemType } = analysis;
  if (!problem) return null;

  const effectiveType = selectedProblemType ?? problem.type;
  const isUserOverride = selectedProblemType && selectedProblemType !== problem.type;
  const confidence = Math.round(problem.confidence * 100);
  const imbalanceBadge = problem.imbalanceLevel ? IMBALANCE_LABELS[problem.imbalanceLevel] : null;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          {PROBLEM_TYPE_ICONS[effectiveType] ?? PROBLEM_TYPE_ICONS['uncertain']}
        </div>
        <div>
          <p className="card-title">Problem Type</p>
          <p className="card-subtitle">The type of ML problem to solve</p>
        </div>
      </div>

      <div className="problem-display">
        <div className="problem-type-row">
          <span className="problem-type-label">{problemTypeLabel(effectiveType)}</span>
          {isUserOverride && <span className="badge badge-accent">User selected</span>}
          {!isUserOverride && (
            <span className={`badge ${confidence >= 80 ? 'badge-success' : confidence >= 60 ? 'badge-warning' : 'badge-danger'}`}>
              {confidence}% confidence
            </span>
          )}
          {imbalanceBadge && (
            <span className={`badge ${imbalanceBadge.cls}`}>{imbalanceBadge.label}</span>
          )}
        </div>

        {!isUserOverride && problem.reasons.length > 0 && (
          <ul className="problem-reasons">
            {problem.reasons.map((r, i) => (
              <li key={i} className="problem-reason">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {r}
              </li>
            ))}
          </ul>
        )}

        {/* Class distribution */}
        {problem.classDistribution && problem.classDistribution.length > 0 && (
          <div className="class-dist">
            <p className="text-xs font-semibold text-muted mb-2">Class distribution</p>
            <div className="dist-bars">
              {problem.classDistribution.slice(0, 8).map(cls => (
                <div key={cls.label} className="dist-bar-row">
                  <span className="dist-label font-mono">{cls.label}</span>
                  <div className="dist-track">
                    <div
                      className="dist-fill"
                      style={{ width: `${cls.percentage}%` }}
                    />
                  </div>
                  <span className="dist-pct">{cls.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {problem.needsUserConfirmation && !isUserOverride && (
          <div className="confirmation-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            ML Advisor recommends confirming the problem type for this target.
          </div>
        )}
      </div>

      <div className="divider" />

      <div className="problem-change">
        <label htmlFor="problem-type-select" className="text-sm font-medium text-secondary">
          Change problem type:
        </label>
        <select
          id="problem-type-select"
          value={effectiveType}
          onChange={e => onProblemTypeChange(e.target.value as ProblemType)}
        >
          {PROBLEM_TYPES.map(pt => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </select>
      </div>

      <style>{`
        .problem-display { display: flex; flex-direction: column; gap: var(--space-3); }
        .problem-type-row {
          display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;
        }
        .problem-type-label {
          font-size: var(--text-xl); font-weight: 700; color: var(--text-primary);
        }
        .problem-reasons {
          list-style: none; display: flex; flex-direction: column; gap: var(--space-1);
        }
        .problem-reason {
          display: flex; align-items: flex-start; gap: var(--space-2);
          font-size: var(--text-sm); color: var(--text-secondary);
        }
        .problem-reason svg { color: var(--success); flex-shrink: 0; margin-top: 3px; }
        .class-dist { background: var(--bg-subtle); padding: var(--space-4); border-radius: var(--radius); }
        .dist-bars { display: flex; flex-direction: column; gap: var(--space-2); }
        .dist-bar-row { display: flex; align-items: center; gap: var(--space-3); }
        .dist-label { width: 80px; font-size: var(--text-xs); color: var(--text-secondary); flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dist-track { flex: 1; height: 6px; background: var(--bg-muted); border-radius: 100px; overflow: hidden; }
        .dist-fill { height: 100%; background: var(--accent); border-radius: 100px; transition: width 500ms ease; }
        .dist-pct { font-size: var(--text-xs); color: var(--text-muted); min-width: 44px; text-align: right; }
        .confirmation-notice {
          display: flex; align-items: center; gap: var(--space-2);
          font-size: var(--text-sm); color: var(--warning);
          padding: var(--space-3); background: var(--warning-light);
          border-radius: var(--radius-sm);
        }
        .problem-change { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
