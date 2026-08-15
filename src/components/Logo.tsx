import React, { useState, useEffect } from 'react';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
}

export function Logo({ size = 32, showWordmark = true }: LogoProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  // Subtle idle pulse every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1200);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`logo-container ${isPulsing ? 'pulse-active' : ''}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
    >
      <div className="logo-symbol-wrapper" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo-svg"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C6CFF" />
              <stop offset="50%" stopColor="#5B8CFF" />
              <stop offset="100%" stopColor="#EC3E9B" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection Lines forming abstract M + L + Decision Branch */}
          <path
            d="M 8 30 L 14 12 L 20 22 L 26 12 L 32 30"
            stroke="url(#logoGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-path-base"
          />
          {/* Upward recommendation branch */}
          <path
            d="M 26 12 L 34 8"
            stroke="#35D7FF"
            strokeWidth="2.8"
            strokeLinecap="round"
            className="logo-path-branch"
          />

          {/* Neural Data Nodes */}
          <circle cx="8" cy="30" r="3" fill="#7C6CFF" />
          <circle cx="14" cy="12" r="3" fill="#60A5FA" />
          <circle cx="20" cy="22" r="3" fill="#A855F7" />
          <circle cx="26" cy="12" r="3.5" fill="#35D7FF" />
          <circle cx="32" cy="30" r="3" fill="#EC3E9B" />

          {/* Final Spark Recommendation Node */}
          <circle
            cx="34"
            cy="8"
            r="4.2"
            fill="#35D7FF"
            filter="url(#glow)"
            className="logo-spark-node"
          />
          <circle cx="34" cy="8" r="1.8" fill="#ffffff" />
        </svg>
      </div>

      {showWordmark && (
        <div className="logo-wordmark-group">
          <span className="logo-wordmark">
            <span className="word-ml">ML</span>
            <span className="word-advisor">Advisor</span>
          </span>
          <span className="logo-pill-badge">CLIENT-SIDE AI</span>
        </div>
      )}

      <style>{`
        .logo-container {
          cursor: pointer;
          user-select: none;
        }

        .logo-symbol-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .logo-container:hover .logo-symbol-wrapper {
          transform: scale(1.08) rotate(-2deg);
        }

        .logo-svg {
          overflow: visible;
        }

        .logo-spark-node {
          transition: r 300ms ease;
        }

        .logo-container:hover .logo-spark-node,
        .logo-container.pulse-active .logo-spark-node {
          animation: sparkPulse 600ms ease infinite alternate;
        }

        @keyframes sparkPulse {
          from { transform: scale(1); filter: drop-shadow(0 0 4px #35D7FF); }
          to { transform: scale(1.3); filter: drop-shadow(0 0 10px #35D7FF); }
        }

        .logo-wordmark-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-wordmark {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          letter-spacing: -0.03em;
          display: flex;
          gap: 3px;
        }

        .word-ml {
          font-weight: 800;
          color: var(--text-primary);
        }

        .word-advisor {
          font-weight: 500;
          color: var(--text-secondary);
        }

        .logo-pill-badge {
          font-family: var(--font-heading);
          font-size: 9px;
          font-weight: 700;
          color: #7C6CFF;
          background: rgba(124, 108, 255, 0.12);
          border: 1px solid rgba(124, 108, 255, 0.3);
          padding: 2px 7px;
          border-radius: 100px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
