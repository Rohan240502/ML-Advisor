import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
}

export function Navbar({ isDark, onToggleTheme, onNavigateHome }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`nav-bar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Brand Logo */}
        <div onClick={onNavigateHome} style={{ cursor: 'pointer' }}>
          <Logo size={28} showWordmark={true} />
        </div>

        {/* Navigation Links & Actions */}
        <div className="nav-right">
          <nav className="nav-links">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="nav-link-btn nav-link-a"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              GitHub
            </a>
          </nav>

          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .nav-bar {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 64px;
          background: rgba(8, 11, 18, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 300ms ease;
        }

        .nav-bar.scrolled {
          background: rgba(8, 11, 18, 0.92);
          border-bottom-color: rgba(124, 108, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        [data-theme='light'] .nav-bar {
          background: rgba(255, 255, 255, 0.75);
          border-bottom-color: rgba(0, 0, 0, 0.08);
        }
        [data-theme='light'] .nav-bar.scrolled {
          background: rgba(255, 255, 255, 0.95);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-6);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .nav-link-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-size: var(--text-xs);
          font-weight: 600;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }

        .nav-link-btn:hover {
          color: var(--text-primary);
          background: var(--bg-subtle);
        }

        .theme-toggle-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition);
        }

        .theme-toggle-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          transform: rotate(15deg);
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
        }
      `}</style>
    </header>
  );
}
