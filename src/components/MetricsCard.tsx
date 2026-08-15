import React from 'react';
import type { MetricRecommendation, ValidationRecommendation } from '../types/analysis';

interface MetricsCardProps {
  metrics: MetricRecommendation;
  validation: ValidationRecommendation;
}

export function MetricsCard({ metrics, validation }: MetricsCardProps) {
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
          <p className="card-title">Evaluation Metrics & Validation Strategy</p>
          <p className="card-subtitle">Recommended performance metrics and cross-validation protocol</p>
        </div>
      </div>

      <div className="metrics-body">
        {/* Metric Selection Columns */}
        <div className="metrics-columns-grid">
          <div className="metric-group">
            <p className="metric-group-title">Primary Metric</p>
            <div className="primary-metric-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {metrics.primaryMetric}
            </div>
          </div>

          {metrics.secondaryMetrics.length > 0 && (
            <div className="metric-group">
              <p className="metric-group-title">Secondary Metrics to Monitor</p>
              <div className="secondary-pills-row">
                {metrics.secondaryMetrics.map(m => (
                  <span key={m} className="secondary-pill">{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reason Explanation Box */}
        <div className="metrics-explanation">
          <p className="explanation-text">{metrics.reason}</p>
        </div>

        <div className="divider" />

        {/* Validation Strategy Box */}
        <div className="validation-box">
          <div className="validation-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="validation-label-text font-heading">Recommended Validation Strategy</span>
          </div>
          <p className="validation-strategy-name font-heading">{validation.strategy}</p>
          <p className="validation-reason-text">{validation.reason}</p>
        </div>
      </div>

      <style>{`
        .metrics-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .metrics-columns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-6);
        }

        .metric-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .metric-group-title {
          font-size: var(--text-xs);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .primary-metric-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: var(--accent-gradient);
          color: #ffffff;
          border-radius: 100px;
          font-family: var(--font-heading);
          font-size: var(--text-md);
          font-weight: 700;
          box-shadow: 0 4px 12px var(--accent-glow);
          align-self: flex-start;
        }

        .secondary-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .secondary-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          background: var(--bg-subtle);
          color: var(--text-secondary);
          border: 1px solid var(--border-strong);
          border-radius: 100px;
          font-size: var(--text-sm);
          font-weight: 600;
        }

        .metrics-explanation {
          padding: var(--space-4);
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }

        .explanation-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .validation-box {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-4);
          background: var(--accent-light);
          border: 1px solid var(--accent-border);
          border-radius: var(--radius);
        }

        .validation-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--accent);
        }

        .validation-label-text {
          font-size: var(--text-xs);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .validation-strategy-name {
          font-size: var(--text-lg);
          font-weight: 800;
          color: var(--text-primary);
        }

        .validation-reason-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
