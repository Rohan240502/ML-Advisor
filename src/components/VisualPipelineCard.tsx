import React from 'react';
import type { PipelineStep } from '../types/analysis';

interface VisualPipelineCardProps {
  pipeline: PipelineStep[];
}

export function VisualPipelineCard({ pipeline }: VisualPipelineCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        </div>
        <div>
          <p className="card-title">Recommended ML Pipeline Execution Flow</p>
          <p className="card-subtitle">End-to-end data flow from raw CSV ingestion to validation</p>
        </div>
      </div>

      <div className="pipeline-flow">
        {pipeline.map((step, idx) => (
          <React.Fragment key={step.stage}>
            <div className="pipeline-step-box">
              <div className="step-number font-mono">{step.stage}</div>
              <div className="step-content">
                <div className="step-header">
                  <span className="step-title font-heading">{step.title}</span>
                  <span className={`badge badge-sm ${step.status === 'required' ? 'badge-warning' : 'badge-accent'}`}>
                    {step.badge}
                  </span>
                </div>
                <p className="step-desc">{step.description}</p>
              </div>
            </div>

            {idx < pipeline.length - 1 && (
              <div className="pipeline-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <style>{`
        .pipeline-flow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .pipeline-step-box {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          transition: transform var(--transition);
        }

        .pipeline-step-box:hover {
          transform: translateY(-2px);
          border-color: var(--accent-border);
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-light);
          color: var(--accent);
          font-weight: 800;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2);
        }

        .step-title {
          font-size: var(--text-md);
          font-weight: 700;
          color: var(--text-primary);
        }

        .step-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        .pipeline-arrow {
          color: var(--accent);
          padding: 2px 0;
          animation: bounceArrow 2s ease-in-out infinite;
        }

        @keyframes bounceArrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
      `}</style>
    </div>
  );
}
