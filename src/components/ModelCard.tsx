import React from 'react';
import type { ModelRecommendation } from '../types/analysis';

interface ModelCardProps {
  model: ModelRecommendation;
  onOpenExplainer: (model: ModelRecommendation) => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const color =
    score >= 85 ? '#39E079' : score >= 70 ? '#7868FF' : '#f59e0b';

  return (
    <div className="score-ring-wrapper">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke="var(--bg-muted)"
          strokeWidth="4.5"
        />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 28 28)"
          style={{ transition: 'stroke-dashoffset 800ms ease' }}
        />
      </svg>
      <div className="score-ring-text">
        <span className="score-number" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

export function ModelCard({ model, onOpenExplainer }: ModelCardProps) {
  const rankCls = model.rank === 1 ? 'rank-gold' : model.rank === 2 ? 'rank-silver' : 'rank-bronze';
  const sub = model.subScores;

  return (
    <div className={`model-card ${model.rank === 1 ? 'model-card-featured' : ''}`}>
      {/* Card Header Row */}
      <div className="model-card-top">
        <div className="model-header-left">
          <div className="rank-badge-wrapper">
            <span className={`rank-circle ${rankCls}`}>#{model.rank}</span>
            {model.rank === 1 && (
              <span className="top-choice-pill">Top Recommended</span>
            )}
          </div>
          <div className="model-title-group">
            <h3 className="model-name">{model.name}</h3>
            <span className="model-sklearn font-mono">{model.sklearnClass}</span>
          </div>
        </div>

        <div className="model-header-right">
          <ScoreRing score={model.score} />
          <span className="score-caption">Compatibility</span>
        </div>
      </div>

      {/* Horizontal Sub-score Metric Bars */}
      <div className="model-subscores-grid">
        <div className="subscore-item">
          <div className="subscore-header">
            <span>Accuracy Potential</span>
            <span className="font-mono">{sub.accuracyPotential}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${sub.accuracyPotential}%`, background: '#7868FF' }} />
          </div>
        </div>

        <div className="subscore-item">
          <div className="subscore-header">
            <span>Training Speed</span>
            <span className="font-mono">{sub.trainingSpeed}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${sub.trainingSpeed}%`, background: '#35D7FF' }} />
          </div>
        </div>

        <div className="subscore-item">
          <div className="subscore-header">
            <span>Interpretability</span>
            <span className="font-mono">{sub.interpretability}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${sub.interpretability}%`, background: '#39E079' }} />
          </div>
        </div>

        <div className="subscore-item">
          <div className="subscore-header">
            <span>Dataset Match</span>
            <span className="font-mono">{sub.datasetCompatibility}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${sub.datasetCompatibility}%`, background: '#EC3E9B' }} />
          </div>
        </div>
      </div>

      {/* Grid of Reasons & Warnings */}
      <div className="model-card-body">
        {model.reasons.length > 0 && (
          <div className="model-column">
            <p className="model-column-title text-success">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Key Drivers
            </p>
            <ul className="model-list">
              {model.reasons.map((r, i) => (
                <li key={i} className="model-list-item">
                  <span className="bullet-dot bullet-success" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {model.warnings.length > 0 && (
          <div className="model-column">
            <p className="model-column-title text-warning">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Watch Out
            </p>
            <ul className="model-list">
              {model.warnings.map((w, i) => (
                <li key={i} className="model-list-item">
                  <span className="bullet-dot bullet-warning" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Explainer Drawer Trigger Button */}
      <div className="model-explainer-trigger-row">
        <button className="btn btn-ghost explainer-btn" onClick={() => onOpenExplainer(model)}>
          Why this model? →
        </button>
      </div>

      <style>{`
        .model-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          transition: all var(--transition-bounce);
        }
        .model-card:hover {
          border-color: var(--border-strong);
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }
        .model-card-featured {
          border-color: var(--accent-border);
          background: linear-gradient(180deg, var(--accent-light) 0%, var(--bg-surface) 100%);
          box-shadow: var(--shadow-glow);
        }

        .model-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-4);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--border);
        }

        .model-header-left {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          min-width: 0;
          flex: 1;
        }

        .rank-badge-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .rank-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-family: var(--font-heading);
          font-size: var(--text-xs);
          font-weight: 800;
          flex-shrink: 0;
        }
        .rank-gold { background: linear-gradient(135deg, #fef08a 0%, #eab308 100%); color: #713f12; }
        .rank-silver { background: linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%); color: #0f172a; }
        .rank-bronze { background: linear-gradient(135deg, #ffedd5 0%, #f97316 100%); color: #7c2d12; }

        .top-choice-pill {
          font-family: var(--font-heading);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
          background: var(--accent-light);
          border: 1px solid var(--accent-border);
          padding: 2px 8px;
          border-radius: 100px;
        }

        .model-title-group { min-width: 0; }

        .model-name {
          font-family: var(--font-heading);
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          margin-bottom: 2px;
        }

        .model-sklearn {
          font-size: var(--text-xs);
          color: var(--text-muted);
          word-break: break-all;
          display: block;
        }

        .model-header-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .score-ring-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
          flex-shrink: 0;
        }

        .score-ring-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .score-number {
          font-family: var(--font-heading);
          font-size: 14px;
          font-weight: 800;
        }

        .score-caption {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .model-subscores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
        }

        .subscore-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .subscore-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .model-card-body {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-4);
        }

        .model-column {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .model-column-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .model-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .model-list-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .bullet-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 7px;
        }
        .bullet-success { background: var(--success); }
        .bullet-warning { background: var(--warning); }

        .model-explainer-trigger-row {
          display: flex;
          justify-content: flex-end;
          padding-top: var(--space-2);
          border-top: 1px dashed var(--border);
        }

        .explainer-btn {
          color: var(--accent);
          font-weight: 700;
        }
        .explainer-btn:hover {
          background: var(--accent-light);
        }
      `}</style>
    </div>
  );
}
