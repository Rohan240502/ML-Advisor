import React, { useRef, useState, useCallback } from 'react';
import type { ParsedCSV } from '../types/analysis';
import { parseDataFile, validateDataFile } from '../utils/csv';

interface FileUploaderProps {
  onFileParsed: (csv: ParsedCSV) => void;
}

export function FileUploader({ onFileParsed }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    const validationErr = validateDataFile(file);
    if (validationErr) {
      setError(validationErr.message);
      return;
    }
    setIsParsing(true);
    try {
      const parsed = await parseDataFile(file);
      onFileParsed(parsed);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'Failed to parse file.');
    } finally {
      setIsParsing(false);
    }
  }, [onFileParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="uploader-wrapper">
      {/* Hero text */}
      <div className="hero-text">
        <div className="hero-pill">
          <span className="hero-pill-dot" />
          Client-Side ML Pipeline Advisor
        </div>
        <h1 className="hero-title">
          Understand your dataset.<br />
          <span className="gradient-text">Choose smarter ML models.</span>
        </h1>
        <p className="hero-subtitle">
          Upload CSV, Excel, JSON, TSV or TXT files to automatically detect target columns, classify ML problem types, diagnose data quality issues, and rank optimal scikit-learn models.
        </p>

        <div className="privacy-badges">
          <span className="privacy-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            100% In-Browser Execution
          </span>
          <span className="privacy-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Zero Server Uploads
          </span>
          <span className="privacy-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Instant Processing
          </span>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isParsing ? 'parsing' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isParsing && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload data file"
        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json,.tsv,.txt"
          onChange={handleInputChange}
          style={{ display: 'none' }}
          id="file-input"
          aria-label="Choose data file"
        />

        <div className="upload-icon">
          {isParsing ? (
            <div className="spinner" />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>

        {isParsing ? (
          <div className="upload-text-parsing">
            <p className="upload-primary">Reading dataset schema…</p>
          </div>
        ) : (
          <div className="upload-text">
            <p className="upload-primary">
              {isDragOver ? 'Release to upload file' : 'Drag & drop your data file here'}
            </p>
            <p className="upload-secondary">or</p>
            <button
              className="btn btn-primary"
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Browse Data File
            </button>
            <p className="upload-hint">Supports CSV, Excel, JSON, TSV, TXT files up to 10 MB</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="upload-error" role="alert">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Privacy note */}
      <div className="privacy-note">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Your dataset never leaves your browser. Parsing & ML profiling are calculated strictly inside Web Workers.
      </div>

      <style>{`
        .uploader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
          padding: var(--space-10) 0;
        }

        .hero-text {
          text-align: center;
          max-width: 580px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: 100px;
          background: var(--accent-light);
          border: 1px solid var(--accent-border);
          color: var(--accent);
          font-family: var(--font-heading);
          font-size: 10px;
          font-weight: 700;
          margin-bottom: var(--space-4);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .hero-pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .hero-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin-bottom: var(--space-4);
        }

        .hero-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--space-5);
        }

        .privacy-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .privacy-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--success);
          background: var(--success-light);
          padding: 3px 10px;
          border-radius: 100px;
        }

        .upload-zone {
          width: 100%;
          max-width: 500px;
          border: 2px dashed var(--border-strong);
          border-radius: var(--radius-xl);
          padding: var(--space-10) var(--space-8);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition);
          background: var(--bg-surface-glass);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          box-shadow: var(--shadow-sm);
        }

        .upload-zone:hover,
        .upload-zone.drag-over {
          border-color: var(--accent);
          background: var(--accent-light);
          box-shadow: var(--shadow-glow);
        }

        .upload-zone:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        .upload-zone.parsing {
          cursor: default;
          opacity: 0.8;
        }

        .upload-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          background: var(--bg-subtle);
          color: var(--accent);
        }

        .upload-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
        }

        .upload-primary {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--text-primary);
        }

        .upload-secondary {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        .upload-hint {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: var(--space-1);
        }

        .upload-text-parsing {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .upload-error {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: var(--danger-light);
          color: var(--danger);
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
          max-width: 500px;
          width: 100%;
        }

        .privacy-note {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
