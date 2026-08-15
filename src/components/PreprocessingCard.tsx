import React from 'react';
import type { PreprocessingRecommendation, PreprocessingCategory } from '../types/analysis';

interface PreprocessingCardProps {
  recommendations: PreprocessingRecommendation[];
}

const CATEGORY_CONFIG: Record<PreprocessingCategory, { label: string; icon: React.ReactNode }> = {
  numerical: {
    label: 'Numerical Features',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  categorical: {
    label: 'Categorical Features',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  identifier: {
    label: 'Identifier Columns',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
  constant: {
    label: 'Constant Columns',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>,
  },
  validation: {
    label: 'Validation Strategy',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
};

const SEVERITY_CONFIG = {
  required: { icon: '●', cls: 'sev-required' },
  recommended: { icon: '◆', cls: 'sev-recommended' },
  optional: { icon: '◇', cls: 'sev-optional' },
};

export function PreprocessingCard({ recommendations }: PreprocessingCardProps) {
  // Group by category
  const grouped = recommendations.reduce<Record<string, PreprocessingRecommendation[]>>(
    (acc, rec) => {
      const key = rec.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(rec);
      return acc;
    },
    {}
  );

  const categoryOrder: PreprocessingCategory[] = ['numerical', 'categorical', 'identifier', 'constant', 'validation'];
  const orderedGroups = categoryOrder
    .filter(cat => grouped[cat])
    .map(cat => ({ category: cat, recs: grouped[cat] }));

  if (recommendations.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <p className="card-title">Preprocessing Plan</p>
        </div>
        <p className="text-sm text-muted">No preprocessing recommendations available. Select a target column to generate a plan.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div>
          <p className="card-title">Preprocessing Plan</p>
          <p className="card-subtitle">{recommendations.length} step{recommendations.length > 1 ? 's' : ''} recommended</p>
        </div>
      </div>

      <div className="prep-groups">
        {orderedGroups.map(({ category, recs }) => {
          const config = CATEGORY_CONFIG[category];
          return (
            <div key={category} className="prep-group">
              <div className="prep-group-header">
                <span className="prep-group-icon">{config.icon}</span>
                <span className="prep-group-label">{config.label}</span>
              </div>
              <div className="prep-recs">
                {recs.map((rec, idx) => {
                  const sev = SEVERITY_CONFIG[rec.severity];
                  return (
                    <div key={idx} className={`prep-rec ${sev.cls}`}>
                      <span className="prep-rec-bullet">{sev.icon}</span>
                      <div>
                        <p className="prep-rec-action">{rec.action}</p>
                        <p className="prep-rec-reason">{rec.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="prep-legend">
        <span className="legend-item"><span className="sev-required">●</span> Required</span>
        <span className="legend-item"><span className="sev-recommended">◆</span> Recommended</span>
        <span className="legend-item"><span className="sev-optional">◇</span> Optional</span>
      </div>

      <style>{`
        .prep-groups { display: flex; flex-direction: column; gap: var(--space-5); }
        .prep-group {}
        .prep-group-header {
          display: flex; align-items: center; gap: var(--space-2);
          font-size: var(--text-xs); font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: var(--space-3);
        }
        .prep-group-icon { color: var(--accent); }
        .prep-recs { display: flex; flex-direction: column; gap: var(--space-2); }
        .prep-rec {
          display: flex; align-items: flex-start; gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-sm);
          background: var(--bg-subtle);
          border-left: 3px solid transparent;
        }
        .sev-required { border-left-color: var(--danger); }
        .sev-recommended { border-left-color: var(--accent); }
        .sev-optional { border-left-color: var(--border-strong); }
        .prep-rec-bullet { font-size: 10px; flex-shrink: 0; margin-top: 4px; }
        .sev-required .prep-rec-bullet { color: var(--danger); }
        .sev-recommended .prep-rec-bullet { color: var(--accent); }
        .sev-optional .prep-rec-bullet { color: var(--text-muted); }
        .prep-rec-action { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
        .prep-rec-reason { font-size: var(--text-xs); color: var(--text-muted); margin-top: 3px; line-height: 1.5; }
        .prep-legend {
          display: flex; align-items: center; gap: var(--space-4);
          margin-top: var(--space-4); padding-top: var(--space-4);
          border-top: 1px solid var(--border);
          font-size: var(--text-xs); color: var(--text-muted);
        }
        .legend-item { display: flex; align-items: center; gap: 5px; }
      `}</style>
    </div>
  );
}
