import React from 'react';
import type { DatasetAnalysis, FeatureProfile } from '../types/analysis';

interface DatasetOverviewProps {
  analysis: DatasetAnalysis;
}

const TYPE_COLORS: Record<string, string> = {
  numerical: 'badge-info',
  categorical: 'badge-accent',
  boolean: 'badge-success',
  datetime: 'badge-warning',
  identifier: 'badge-muted',
  constant: 'badge-muted',
};

const TYPE_LABELS: Record<string, string> = {
  numerical: 'Numerical',
  categorical: 'Categorical',
  boolean: 'Boolean',
  datetime: 'Datetime',
  identifier: 'Identifier',
  constant: 'Constant',
};

export function DatasetOverview({ analysis }: DatasetOverviewProps) {
  const { features, dataset } = analysis;

  const typeCounts = features.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {});

  const typeRows = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <div>
          <p className="card-title">Dataset Profile & Schema</p>
          <p className="card-subtitle font-mono text-sm">{analysis.fileName}</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="overview-grid">
        <div className="metric-box">
          <div className="metric-box-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </div>
          <div className="metric-box-data">
            <span className="metric-box-val">{dataset.rowCount.toLocaleString()}</span>
            <span className="metric-box-lbl">Total Rows</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-box-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
          </div>
          <div className="metric-box-data">
            <span className="metric-box-val">{dataset.columnCount}</span>
            <span className="metric-box-lbl">Total Columns</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-box-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          </div>
          <div className="metric-box-data">
            <span className="metric-box-val">{analysis.quality.duplicateRowCount}</span>
            <span className="metric-box-lbl">Duplicates</span>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Feature type breakdown */}
      <div className="overview-types">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Feature Distributions</p>
        <div className="type-grid">
          {typeRows.map(([type, count]) => (
            <div key={type} className="type-row">
              <span className={`badge ${TYPE_COLORS[type] ?? 'badge-muted'}`}>
                {TYPE_LABELS[type] ?? type}
              </span>
              <span className="type-count">{count} {count === 1 ? 'col' : 'cols'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Column inspection table */}
      <div className="column-table-wrapper">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Column Schema</p>
        <div className="column-table">
          <div className="col-table-header">
            <span>Column Name</span>
            <span>Type</span>
            <span>Unique Ratio</span>
            <span>Missing</span>
            <span>Sample Values</span>
          </div>
          {features.map((f: FeatureProfile) => (
            <div key={f.name} className="col-table-row">
              <span className="col-name font-mono font-semibold">{f.name}</span>
              <span>
                <span className={`badge badge-sm ${TYPE_COLORS[f.type] ?? 'badge-muted'}`}>
                  {TYPE_LABELS[f.type] ?? f.type}
                </span>
              </span>
              <span className="text-secondary font-mono text-xs">
                {f.uniqueCount.toLocaleString()}
                <span className="text-muted"> ({(f.uniqueRatio * 100).toFixed(0)}%)</span>
              </span>
              <span className={f.missingPercentage > 20 ? 'text-warning font-semibold' : f.missingPercentage > 0 ? 'text-secondary' : 'text-muted'}>
                {f.missingCount > 0 ? `${f.missingCount} (${f.missingPercentage.toFixed(1)}%)` : '0 (0%)'}
              </span>
              <span className="sample-vals text-muted font-mono">
                {f.sampleValues.slice(0, 3).join(', ')}
                {f.sampleValues.length > 3 ? '…' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--space-4);
        }
        .metric-box {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .metric-box-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background: var(--bg-surface);
          color: var(--accent);
          border: 1px solid var(--border);
          flex-shrink: 0;
        }
        .metric-box-data {
          display: flex;
          flex-direction: column;
        }
        .metric-box-val {
          font-family: var(--font-heading);
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
        }
        .metric-box-lbl {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 2px;
        }
        .type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: var(--space-3);
        }
        .type-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--space-3);
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }
        .type-count {
          font-family: var(--font-heading);
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-primary);
        }
        .column-table-wrapper {
          overflow-x: auto;
        }
        .column-table {
          min-width: 650px;
        }
        .col-table-header, .col-table-row {
          display: grid;
          grid-template-columns: 180px 110px 110px 110px 1fr;
          gap: var(--space-3);
          padding: var(--space-3);
          align-items: center;
        }
        .col-table-header {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }
        .col-table-row {
          border-bottom: 1px solid var(--border);
          font-size: var(--text-sm);
          transition: background var(--transition);
        }
        .col-table-row:last-child { border-bottom: none; }
        .col-table-row:hover { background: var(--bg-subtle); }
        .col-name {
          font-size: var(--text-xs);
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sample-vals {
          font-size: var(--text-xs);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .badge-sm {
          font-size: 10px;
          padding: 2px 8px;
        }
      `}</style>
    </div>
  );
}
