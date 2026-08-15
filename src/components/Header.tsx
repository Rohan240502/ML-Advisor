import React from 'react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="brand-titles">
            <span className="brand-name">ML Advisor</span>
            <span className="brand-badge">Client-Side AI</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-ghost theme-toggle"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .site-header {
          background: var(--bg-surface-glass);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-8);
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm);
          background: var(--accent-gradient);
          color: white;
          box-shadow: 0 4px 14px var(--accent-glow);
          flex-shrink: 0;
        }
        .brand-titles {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .brand-name {
          font-family: var(--font-heading);
          font-size: var(--text-lg);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .brand-badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          background: var(--accent-light);
          border: 1px solid var(--accent-border);
          padding: 2px 10px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .theme-toggle {
          width: 42px;
          height: 42px;
          padding: 0;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
        }
        .theme-toggle:hover {
          color: var(--text-primary);
          background: var(--bg-subtle);
        }
      `}</style>
    </header>
  );
}
