import React, { useState } from 'react';
import type { FeatureProfile, ProblemRecommendation } from '../types/analysis';

interface FeatureDistributionChartProps {
  features: FeatureProfile[];
  problem: ProblemRecommendation | null;
}

export function FeatureDistributionChart({ features, problem }: FeatureDistributionChartProps) {
  const [activeTab, setActiveTab] = useState<'types' | 'missing' | 'target'>('types');

  const typeCounts = features.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {});

  const totalCols = features.length;
  const missingCols = features.filter(f => f.missingCount > 0);

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
          <p className="card-title">Interactive Data Science Visualizations</p>
          <p className="card-subtitle">Visual feature distribution, missingness matrix, and class target balance</p>
        </div>
      </div>

      {/* Chart Selector Tabs */}
      <div className="chart-tabs">
        <button
          className={`chart-tab ${activeTab === 'types' ? 'active' : ''}`}
          onClick={() => setActiveTab('types')}
        >
          Feature Types ({totalCols})
        </button>
        <button
          className={`chart-tab ${activeTab === 'missing' ? 'active' : ''}`}
          onClick={() => setActiveTab('missing')}
        >
          Missing Values Matrix ({missingCols.length})
        </button>
        {problem?.classDistribution && (
          <button
            className={`chart-tab ${activeTab === 'target' ? 'active' : ''}`}
            onClick={() => setActiveTab('target')}
          >
            Target Class Balance
          </button>
        )}
      </div>

      {/* Tab 1: Feature Types Visual Breakdown */}
      {activeTab === 'types' && (
        <div className="chart-body">
          <div className="stacked-bar-container">
            {Object.entries(typeCounts).map(([type, count]) => {
              const pct = (count / totalCols) * 100;
              const color =
                type === 'numerical' ? '#38D9FF' :
                type === 'categorical' ? '#7868FF' :
                type === 'boolean' ? '#39E079' :
                type === 'datetime' ? '#fbbf24' : '#9099AA';

              return (
                <div
                  key={type}
                  className="stacked-bar-segment"
                  style={{ width: `${pct}%`, background: color }}
                  title={`${type}: ${count} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>

          <div className="type-legend-grid">
            {Object.entries(typeCounts).map(([type, count]) => {
              const pct = (count / totalCols) * 100;
              const color =
                type === 'numerical' ? '#38D9FF' :
                type === 'categorical' ? '#7868FF' :
                type === 'boolean' ? '#39E079' :
                type === 'datetime' ? '#fbbf24' : '#9099AA';

              return (
                <div key={type} className="legend-item">
                  <span className="legend-color-dot" style={{ background: color }} />
                  <span className="legend-name capitalize">{type}</span>
                  <span className="legend-count font-mono">{count} ({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Missing Values Chart */}
      {activeTab === 'missing' && (
        <div className="chart-body">
          {missingCols.length === 0 ? (
            <div className="empty-chart">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39E079" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <p className="text-sm font-semibold">100% Complete Dataset — No missing values detected in any feature.</p>
            </div>
          ) : (
            <div className="missing-bar-list">
              {missingCols.map(f => (
                <div key={f.name} className="missing-bar-row">
                  <span className="col-name font-mono">{f.name}</span>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${f.missingPercentage}%`, background: '#f59e0b' }} />
                  </div>
                  <span className="missing-pct font-mono text-warning">{f.missingCount} ({f.missingPercentage.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Target Class Balance Chart */}
      {activeTab === 'target' && problem?.classDistribution && (
        <div className="chart-body">
          <div className="target-balance-list">
            {problem.classDistribution.map(cls => (
              <div key={cls.label} className="target-balance-row">
                <div className="target-bal-header">
                  <span className="font-mono font-semibold text-sm">{cls.label}</span>
                  <span className="font-mono text-xs text-muted">{cls.count.toLocaleString()} samples ({cls.percentage.toFixed(1)}%)</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${cls.percentage}%`, background: '#7868FF' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .chart-tabs {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-5);
          border-bottom: 1px solid var(--border);
          padding-bottom: var(--space-3);
          overflow-x: auto;
        }

        .chart-tab {
          padding: 6px 14px;
          font-family: var(--font-heading);
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition);
        }

        .chart-tab:hover { color: var(--text-primary); background: var(--bg-subtle); }
        .chart-tab.active { color: var(--accent); background: var(--accent-light); }

        .stacked-bar-container {
          width: 100%;
          height: 14px;
          border-radius: 100px;
          overflow: hidden;
          display: flex;
          margin-bottom: var(--space-5);
          border: 1px solid var(--border);
        }

        .stacked-bar-segment {
          height: 100%;
          transition: width 400ms ease;
        }

        .type-legend-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: var(--space-3);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
        }

        .legend-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-name { flex: 1; font-weight: 600; text-transform: capitalize; }
        .legend-count { color: var(--text-muted); }

        .missing-bar-list, .target-balance-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .missing-bar-row, .target-balance-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .target-bal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .empty-chart {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--success-light);
          border-radius: var(--radius);
          color: var(--success);
        }
      `}</style>
    </div>
  );
}
