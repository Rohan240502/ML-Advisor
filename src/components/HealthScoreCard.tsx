import React, { useEffect, useState } from 'react';
import type { DatasetHealthScore } from '../types/analysis';

interface HealthScoreCardProps {
  health: DatasetHealthScore;
}

export function HealthScoreCard({ health }: HealthScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = health.totalScore;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeProgress);
      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [health.totalScore]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedScore / 100) * circumference;

  const scoreColor =
    health.totalScore >= 80 ? '#39E079' : health.totalScore >= 65 ? '#5B8CFF' : '#f59e0b';

  return (
    <div className="card health-card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div>
          <p className="card-title">Dataset Health Score</p>
          <p className="card-subtitle">Automated assessment of dataset readiness for machine learning</p>
        </div>
      </div>

      <div className="health-body">
        {/* Animated Gauge */}
        <div className="gauge-container">
          <svg width="120" height="120" viewBox="0 0 120 120" className="gauge-svg">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--bg-muted)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 100ms linear' }}
            />
          </svg>
          <div className="gauge-center font-heading">
            <span className="gauge-num" style={{ color: scoreColor }}>{animatedScore}</span>
            <span className="gauge-denom">/ 100</span>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="health-categories">
          {health.categories.map(cat => (
            <div key={cat.name} className="health-cat-row">
              <div className="cat-top">
                <span className="cat-name">{cat.name}</span>
                <span className="cat-score font-mono">{cat.score}%</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${cat.score}%`,
                    background:
                      cat.score >= 80 ? '#39E079' : cat.score >= 65 ? '#5B8CFF' : '#f59e0b',
                  }}
                />
              </div>
              <span className="cat-desc">{cat.description}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .health-body {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          flex-wrap: wrap;
        }

        .gauge-container {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gauge-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .gauge-num {
          font-size: var(--text-2xl);
          font-weight: 800;
          line-height: 1;
        }

        .gauge-denom {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
          margin-top: 2px;
        }

        .health-categories {
          flex: 1;
          min-width: 260px;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .health-cat-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .cat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: var(--text-xs);
          font-weight: 700;
        }

        .cat-name { color: var(--text-primary); }
        .cat-score { color: var(--text-muted); }
        .cat-desc { font-size: 11px; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
