import React, { useState, useRef, useCallback, useEffect } from 'react';
import './styles.css';

import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Navbar } from './components/Navbar';
import { FileUploader } from './components/FileUploader';
import { LoadingAnalysis } from './components/LoadingAnalysis';
import { DatasetOverview } from './components/DatasetOverview';
import { HealthScoreCard } from './components/HealthScoreCard';
import { SmartInsightsCard } from './components/SmartInsightsCard';
import { TargetCard } from './components/TargetCard';
import { ProblemCard } from './components/ProblemCard';
import { DataQualityCard } from './components/DataQualityCard';
import { PreprocessingCard } from './components/PreprocessingCard';
import { FeatureDistributionChart } from './components/FeatureDistributionChart';
import { VisualPipelineCard } from './components/VisualPipelineCard';
import { ModelRecommendations } from './components/ModelRecommendations';
import { ModelComparisonTable } from './components/ModelComparisonTable';
import { MetricsCard } from './components/MetricsCard';

import type {
  ParsedCSV,
  DatasetAnalysis,
  ProblemType,
  WorkerOutMessage,
  WorkerInMessage,
} from './types/analysis';

// ─── App State ───────────────────────────────────────────────────────────────

type AppState =
  | { phase: 'upload' }
  | { phase: 'analyzing'; csv: ParsedCSV; completedSteps: string[]; currentStep: string; pendingSteps: string[] }
  | { phase: 'results'; csv: ParsedCSV; analysis: DatasetAnalysis }
  | { phase: 'error'; message: string };

const NAV_ITEMS = [
  { id: 'sec-overview', label: 'Overview & Schema', key: 'overview' },
  { id: 'sec-health', label: 'Health & Insights', key: 'health' },
  { id: 'sec-target', label: 'Target & Problem', key: 'target' },
  { id: 'sec-quality', label: 'Data Quality', key: 'quality' },
  { id: 'sec-charts', label: 'Feature Charts', key: 'charts' },
  { id: 'sec-preprocessing', label: 'Preprocessing', key: 'preprocessing' },
  { id: 'sec-pipeline', label: 'ML Pipeline Flow', key: 'pipeline' },
  { id: 'sec-models', label: 'Model Rankings', key: 'models' },
  { id: 'sec-comparison', label: 'Comparison Matrix', key: 'comparison' },
  { id: 'sec-metrics', label: 'Metrics & Validation', key: 'metrics' },
];

export default function App() {
  const [state, setState] = useState<AppState>({ phase: 'upload' });
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('ml-advisor-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const workerRef = useRef<Worker | null>(null);
  const isClickingTabRef = useRef<boolean>(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('ml-advisor-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  // IntersectionObserver for auto-highlighting tabs on scroll
  useEffect(() => {
    if (state.phase !== 'results') return;

    const sectionElements = NAV_ITEMS.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickingTabRef.current) return;
        const visible = entries.find(e => e.isIntersecting);
        if (visible) {
          const matched = NAV_ITEMS.find(item => item.id === visible.target.id);
          if (matched) setActiveTab(matched.key);
        }
      },
      {
        rootMargin: '-100px 0px -50% 0px',
        threshold: 0.1,
      }
    );

    sectionElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [state.phase]);

  const toggleTheme = () => setIsDark(d => !d);

  // ── Start analysis ──────────────────────────────────────────────────────────
  const startAnalysis = useCallback((
    csv: ParsedCSV,
    targetOverride?: string,
    problemTypeOverride?: ProblemType
  ) => {
    workerRef.current?.terminate();

    const worker = new Worker(
      new URL('./workers/analysis.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    setState({
      phase: 'analyzing',
      csv,
      completedSteps: [],
      currentStep: 'Reading dataset columns',
      pendingSteps: [
        'Profiling feature types & distributions',
        'Checking data quality & duplicates',
        'Detecting target column candidate',
        'Determining ML problem classification',
        'Calculating dataset health score',
        'Generating smart data insights',
        'Building preprocessing pipeline',
        'Ranking scikit-learn algorithms',
        'Selecting evaluation metrics',
      ],
    });

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data;
      if (msg.type === 'PROGRESS') {
        setState(prev => {
          if (prev.phase !== 'analyzing') return prev;
          return {
            ...prev,
            completedSteps: msg.payload.completed,
            currentStep: msg.payload.current,
            pendingSteps: msg.payload.pending,
          };
        });
      } else if (msg.type === 'ANALYSIS_COMPLETE') {
        setState({ phase: 'results', csv, analysis: msg.payload });
        worker.terminate();
        workerRef.current = null;
      } else if (msg.type === 'ANALYSIS_ERROR') {
        setState({ phase: 'error', message: msg.payload.message });
        worker.terminate();
        workerRef.current = null;
      }
    };

    worker.onerror = (err) => {
      setState({ phase: 'error', message: err.message ?? 'Worker error' });
      worker.terminate();
      workerRef.current = null;
    };

    const msg: WorkerInMessage = {
      type: 'ANALYZE_DATASET',
      payload: {
        headers: csv.headers,
        rows: csv.rows,
        fileName: csv.fileName,
        targetOverride,
        problemTypeOverride,
      },
    };
    worker.postMessage(msg);
  }, []);

  // ── Handle CSV upload ───────────────────────────────────────────────────────
  const handleFileParsed = useCallback((csv: ParsedCSV) => {
    startAnalysis(csv);
  }, [startAnalysis]);

  // ── Handle target change ────────────────────────────────────────────────────
  const handleTargetChange = useCallback((column: string) => {
    if (state.phase !== 'results') return;
    const { csv, analysis } = state;
    const problemOverride = analysis.selectedProblemType !== analysis.problem?.type
      ? analysis.selectedProblemType ?? undefined
      : undefined;
    startAnalysis(csv, column, problemOverride);
  }, [state, startAnalysis]);

  // ── Handle problem type change ───────────────────────────────────────────────
  const handleProblemTypeChange = useCallback((type: ProblemType) => {
    if (state.phase !== 'results') return;
    const { csv, analysis } = state;
    startAnalysis(csv, analysis.selectedTarget ?? undefined, type);
  }, [state, startAnalysis]);

  // ── Reset to upload ──────────────────────────────────────────────────────────
  const handleReset = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setState({ phase: 'upload' });
  };

  const scrollToSection = (id: string, key: string) => {
    setActiveTab(key);
    isClickingTabRef.current = true;

    const element = document.getElementById(id);
    if (element) {
      const yOffset = -130;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    setTimeout(() => {
      isClickingTabRef.current = false;
    }, 800);
  };

  return (
    <div className="app">
      {/* Background Interactive Canvas */}
      <BackgroundCanvas />

      <Navbar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onNavigateHome={handleReset}
      />

      <main className="main-content" id="main">
        {state.phase === 'upload' && (
          <>
            <FileUploader onFileParsed={handleFileParsed} />

            {/* Informational Feature & Privacy Anchor Cards */}
            <div className="landing-info-sections">
              <section id="sec-how-it-works" className="card info-section-card">
                <h3 className="card-title text-accent mb-2">How It Works</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  ML Advisor reads your CSV dataset directly into Web Worker memory. It executes a multi-signal profiling engine to infer feature types, evaluate statistical distributions, identify candidate targets, score model compatibility, and format actionable scikit-learn preprocessing recommendations.
                </p>
              </section>

              <section id="sec-features" className="card info-section-card">
                <h3 className="card-title text-accent mb-2">Platform Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="font-semibold text-primary">Automated Target Detection</p>
                    <p className="text-xs text-muted">Heuristic scoring of column uniqueness, names, and variance.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Model Suitability Ranking</p>
                    <p className="text-xs text-muted">Transparent sub-scores for compatibility, accuracy, speed, and interpretability.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Health & Imbalance Diagnosis</p>
                    <p className="text-xs text-muted">Automated health gauge and class balance detection.</p>
                  </div>
                </div>
              </section>

              <section id="sec-privacy" className="card info-section-card">
                <h3 className="card-title text-success mb-2">Privacy Guarantee</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  Your data never leaves your browser window. Zero network payload requests, zero third-party telemetry, zero external cloud dependencies.
                </p>
              </section>
            </div>
          </>
        )}

        {state.phase === 'analyzing' && (
          <LoadingAnalysis
            fileName={state.csv.fileName}
            completedSteps={state.completedSteps}
            currentStep={state.currentStep}
            pendingSteps={state.pendingSteps}
          />
        )}

        {state.phase === 'error' && (
          <div className="error-page card">
            <div className="error-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2>Analysis Failed</h2>
            <p>{state.message}</p>
            <button className="btn btn-primary" onClick={handleReset}>
              Try Another Dataset
            </button>
          </div>
        )}

        {state.phase === 'results' && (
          <div className="results-page">
            {/* Header toolbar */}
            <div className="results-header-bar card">
              <div className="results-info-group">
                <h2 className="results-title">Dataset Analysis Report</h2>
                <div className="results-meta-row">
                  <span className="font-mono text-sm font-semibold">{state.csv.fileName}</span>
                  <span className="meta-bullet">•</span>
                  <span className="badge badge-accent">{state.csv.rowCount.toLocaleString()} Rows</span>
                  <span className="badge badge-info">{state.csv.columnCount} Columns</span>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={handleReset}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 .49-3.09"/>
                </svg>
                Analyze New CSV
              </button>
            </div>

            {/* Quick Navigation Sticky Tabs */}
            <nav className="quick-nav-tabs">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.key}
                  className={`nav-tab ${activeTab === item.key ? 'active' : ''}`}
                  onClick={() => scrollToSection(item.id, item.key)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Section 1: Overview & Schema */}
            <div id="sec-overview" className="section-block">
              <DatasetOverview analysis={state.analysis} />
            </div>

            {/* Section 2: Health Score & Smart Insights */}
            <div id="sec-health" className="section-block grid-2-col">
              <HealthScoreCard health={state.analysis.health} />
              <SmartInsightsCard insights={state.analysis.insights} />
            </div>

            {/* Section 3: Target & Problem */}
            <div id="sec-target" className="section-block grid-2-col">
              <TargetCard analysis={state.analysis} onTargetChange={handleTargetChange} />
              <ProblemCard analysis={state.analysis} onProblemTypeChange={handleProblemTypeChange} />
            </div>

            {/* Section 4: Data Quality */}
            <div id="sec-quality" className="section-block">
              <DataQualityCard quality={state.analysis.quality} />
            </div>

            {/* Section 5: Feature Distributions Chart */}
            <div id="sec-charts" className="section-block">
              <FeatureDistributionChart
                features={state.analysis.features}
                problem={state.analysis.problem}
              />
            </div>

            {/* Section 6: Preprocessing Recommendations */}
            <div id="sec-preprocessing" className="section-block">
              <PreprocessingCard recommendations={state.analysis.preprocessing} />
            </div>

            {/* Section 7: Recommended ML Visual Pipeline */}
            <div id="sec-pipeline" className="section-block">
              <VisualPipelineCard pipeline={state.analysis.pipeline} />
            </div>

            {/* Section 8: Model Rankings & Explainer */}
            <div id="sec-models" className="section-block">
              <ModelRecommendations
                models={state.analysis.models}
                problemType={state.analysis.selectedProblemType}
              />
            </div>

            {/* Section 9: Model Architecture Comparison Matrix */}
            <div id="sec-comparison" className="section-block">
              <ModelComparisonTable models={state.analysis.models} />
            </div>

            {/* Section 10: Metrics & Validation Strategy */}
            <div id="sec-metrics" className="section-block">
              <MetricsCard
                metrics={state.analysis.metrics}
                validation={state.analysis.validation}
              />
            </div>

            <div className="results-footer">
              <button className="btn btn-primary btn-lg" onClick={handleReset}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 .49-3.09"/>
                </svg>
                Analyze Another Dataset
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .landing-info-sections {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          margin-top: var(--space-12);
        }

        .results-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
          padding-bottom: var(--space-12);
        }

        .results-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          flex-wrap: wrap;
          padding: var(--space-4) var(--space-5);
        }

        .results-info-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .results-title {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--text-primary);
        }

        .results-meta-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .meta-bullet {
          color: var(--text-muted);
        }

        /* Quick Navigation Sticky Tabs */
        .quick-nav-tabs {
          position: sticky;
          top: 64px;
          z-index: 90;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          background: var(--bg-surface-glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow-x: auto;
          box-shadow: var(--shadow-sm);
        }

        .nav-tab {
          padding: 6px 14px;
          font-family: var(--font-heading);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition);
        }

        .nav-tab:hover {
          color: var(--text-primary);
          background: var(--bg-subtle);
        }

        .nav-tab.active {
          color: var(--accent);
          background: var(--accent-light);
          border: 1px solid var(--accent-border);
        }

        .section-block {
          scroll-margin-top: 140px;
        }

        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-5);
        }

        @media (min-width: 768px) {
          .grid-2-col {
            grid-template-columns: 1fr 1fr;
          }
        }

        .results-footer {
          display: flex;
          justify-content: center;
          margin-top: var(--space-6);
        }

        .error-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-12) var(--space-6);
          text-align: center;
        }

        .error-icon { color: var(--danger); }
      `}</style>
    </div>
  );
}
