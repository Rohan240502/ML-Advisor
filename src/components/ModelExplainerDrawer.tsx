import React from 'react';
import type { ModelRecommendation } from '../types/analysis';

interface ModelExplainerDrawerProps {
  model: ModelRecommendation | null;
  onClose: () => void;
}

export function ModelExplainerDrawer({ model, onClose }: ModelExplainerDrawerProps) {
  if (!model) return null;

  const { details } = model;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="badge badge-accent mb-1">Model Architecture Deep-Dive</span>
            <h2 className="drawer-title">{model.name}</h2>
            <p className="font-mono text-xs text-muted">{model.sklearnClass}</p>
          </div>
          <button className="btn btn-ghost drawer-close-btn" onClick={onClose} aria-label="Close drawer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {/* Score overview */}
          <div className="explainer-score-box">
            <div className="score-number-big">{model.score}%</div>
            <div>
              <p className="font-heading font-semibold text-sm">Compatibility Match Score</p>
              <p className="text-xs text-muted">Evaluated against tabular feature types, missingness, and problem formulation</p>
            </div>
          </div>

          {/* Dataset Factors */}
          <div className="explainer-section">
            <h4 className="explainer-sec-title text-accent">Dataset Drivers & Suitability</h4>
            <ul className="explainer-list">
              {details.datasetFactors.map((factor, i) => (
                <li key={i}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Advantages */}
          <div className="explainer-section">
            <h4 className="explainer-sec-title text-success">Key Advantages</h4>
            <ul className="explainer-list">
              {details.advantages.map((adv, i) => (
                <li key={i}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {adv}
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations & Caveats */}
          <div className="explainer-section">
            <h4 className="explainer-sec-title text-warning">Limitations & Trade-offs</h4>
            <ul className="explainer-list">
              {details.limitations.map((lim, i) => (
                <li key={i}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {lim}
                </li>
              ))}
            </ul>
          </div>

          {/* Preprocessing Requirements */}
          <div className="explainer-section">
            <h4 className="explainer-sec-title text-info">Preprocessing Requirements</h4>
            <ul className="explainer-list">
              {details.preprocessingNeeds.map((need, i) => (
                <li key={i}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="12" x2="12" y2="12"/></svg>
                  {need}
                </li>
              ))}
            </ul>
          </div>

          {/* Complexity & Metrics */}
          <div className="explainer-footer-grid">
            <div className="footer-meta-card">
              <span className="meta-lbl">Training Time Complexity</span>
              <span className="meta-val font-mono">{details.complexity}</span>
            </div>
            <div className="footer-meta-card">
              <span className="meta-lbl">Recommended Evaluation Metrics</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {details.suggestedMetrics.map(m => (
                  <span key={m} className="badge badge-sm badge-accent">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 200ms ease;
        }

        .drawer-panel {
          width: 100%;
          max-width: 480px;
          height: 100%;
          background: var(--bg-surface);
          border-left: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          animation: slideInRight 350ms cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }

        .drawer-header {
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: sticky;
          top: 0;
          background: var(--bg-surface);
          z-index: 10;
        }

        .drawer-title {
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--text-primary);
        }

        .drawer-close-btn {
          padding: 6px;
          border-radius: var(--radius-sm);
        }

        .drawer-body {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .explainer-score-box {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--accent-light);
          border: 1px solid var(--accent-border);
          border-radius: var(--radius);
        }

        .score-number-big {
          font-family: var(--font-heading);
          font-size: var(--text-3xl);
          font-weight: 800;
          color: var(--accent);
        }

        .explainer-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .explainer-sec-title {
          font-size: var(--text-xs);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .explainer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .explainer-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .explainer-list svg {
          flex-shrink: 0;
          margin-top: 3px;
        }

        .explainer-footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }

        .footer-meta-card {
          padding: var(--space-3);
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-lbl {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .meta-val {
          font-size: var(--text-xs);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
