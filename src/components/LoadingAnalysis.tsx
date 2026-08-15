import React from 'react';

interface LoadingAnalysisProps {
  fileName: string;
  completedSteps: string[];
  currentStep: string;
  pendingSteps: string[];
}

const STAGES = [
  'CSV File Ingestion',
  'Dataset Scan',
  'Target Detection',
  'Problem Identification',
  'Data Quality Analysis',
  'Model Ranking',
];

export function LoadingAnalysis({
  fileName,
  completedSteps,
  currentStep,
}: LoadingAnalysisProps) {
  const currentStageIndex = Math.min(
    Math.floor((completedSteps.length / 10) * STAGES.length),
    STAGES.length - 1
  );

  return (
    <div className="loading-card card animate-fade-in">
      <div className="loading-header text-center">
        <div className="pulsing-logo-sphere">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h2 className="loading-title">Analyzing Dataset Schema</h2>
        <p className="loading-subtitle font-mono">{fileName}</p>
      </div>

      {/* Animated Pipeline Stage Nodes */}
      <div className="pipeline-stage-nodes">
        {STAGES.map((stageName, idx) => {
          const isDone = idx < currentStageIndex;
          const isActive = idx === currentStageIndex;

          return (
            <React.Fragment key={stageName}>
              <div className={`stage-node ${isDone ? 'node-done' : isActive ? 'node-active' : ''}`}>
                <div className="node-circle">
                  {isDone ? (
                    '✓'
                  ) : isActive ? (
                    <div className="node-dot-pulse" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className="stage-name">{stageName}</span>
              </div>

              {idx < STAGES.length - 1 && (
                <div className={`stage-line ${isDone ? 'line-done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Processing Message */}
      <div className="processing-status-box">
        <div className="status-indicator-dot" />
        <span className="status-text font-mono">{currentStep || 'Calculating feature statistics…'}</span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-track mt-4">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.round((completedSteps.length / 10) * 100)}%` }}
        />
      </div>

      <style>{`
        .loading-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
          padding: var(--space-10) var(--space-6);
          max-width: 760px;
          margin: 0 auto;
        }

        .pulsing-logo-sphere {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--accent-gradient);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-4);
          box-shadow: 0 0 30px var(--accent-glow);
          animation: pulseGlow 1.8s ease-in-out infinite alternate;
        }

        @keyframes pulseGlow {
          from { transform: scale(0.96); box-shadow: 0 0 20px var(--accent-glow); }
          to { transform: scale(1.08); box-shadow: 0 0 45px var(--accent-glow); }
        }

        .loading-title {
          font-size: var(--text-2xl);
          font-weight: 800;
          color: var(--text-primary);
        }

        .pipeline-stage-nodes {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          overflow-x: auto;
          padding: var(--space-2) 0;
        }

        .stage-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          min-width: 80px;
          text-align: center;
        }

        .node-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-size: var(--text-xs);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .node-done .node-circle {
          background: var(--success-light);
          border-color: var(--success);
          color: var(--success);
        }

        .node-active .node-circle {
          background: var(--accent-light);
          border-color: var(--accent);
          color: var(--accent);
          box-shadow: 0 0 15px var(--accent-glow);
        }

        .node-dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse 1.2s infinite;
        }

        .stage-name {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .node-active .stage-name {
          color: var(--accent);
          font-weight: 700;
        }

        .stage-line {
          flex: 1;
          height: 2px;
          background: var(--border);
          min-width: 20px;
          transition: background var(--transition);
        }

        .stage-line.line-done {
          background: var(--success);
        }

        .processing-status-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 18px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: 100px;
        }

        .status-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: pulse 1s infinite;
        }

        .status-text {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
