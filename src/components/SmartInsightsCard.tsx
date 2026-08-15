import React from 'react';
import type { SmartInsight } from '../types/analysis';

interface SmartInsightsCardProps {
  insights: SmartInsight[];
}

export function SmartInsightsCard({ insights }: SmartInsightsCardProps) {
  if (insights.length === 0) return null;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <div>
          <p className="card-title">Smart Dataset Insights</p>
          <p className="card-subtitle">Automated diagnosis of critical dataset characteristics</p>
        </div>
      </div>

      <div className="insights-grid">
        {insights.map((insight, idx) => {
          const isWarning = insight.type === 'warning';
          const isSuccess = insight.type === 'success';
          const icon = isWarning ? '⚠' : isSuccess ? '✓' : '💡';
          const badgeCls = isWarning ? 'badge-warning' : isSuccess ? 'badge-success' : 'badge-info';

          return (
            <div
              key={insight.id}
              className={`insight-box ${isWarning ? 'box-warning' : isSuccess ? 'box-success' : 'box-info'} animate-fade-in`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="insight-top">
                <span className={`badge ${badgeCls}`}>
                  <span className="insight-icon">{icon}</span>
                  {insight.title}
                </span>
              </div>
              <p className="insight-desc">{insight.description}</p>
            </div>
          );
        })}
      </div>

      <style>{`
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--space-4);
        }

        .insight-box {
          padding: var(--space-4);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--bg-subtle);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          transition: transform var(--transition);
        }

        .insight-box:hover {
          transform: translateY(-2px);
        }

        .box-warning { border-color: rgba(245, 158, 11, 0.3); background: var(--warning-light); }
        .box-success { border-color: rgba(57, 224, 121, 0.3); background: var(--success-light); }
        .box-info    { border-color: rgba(91, 140, 255, 0.3); background: var(--info-light); }

        .insight-top {
          display: flex;
          align-items: center;
        }

        .insight-icon {
          font-weight: bold;
          margin-right: 4px;
        }

        .insight-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
