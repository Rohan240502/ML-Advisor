import React, { useState } from 'react';
import type { ModelRecommendation } from '../types/analysis';
import { ModelCard } from './ModelCard';
import { ModelExplainerDrawer } from './ModelExplainerDrawer';

interface ModelRecommendationsProps {
  models: ModelRecommendation[];
  problemType: string | null;
}

export function ModelRecommendations({ models, problemType }: ModelRecommendationsProps) {
  const [selectedModel, setSelectedModel] = useState<ModelRecommendation | null>(null);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <div>
          <p className="card-title">Recommended Machine Learning Models</p>
          <p className="card-subtitle">
            Ranked based on your dataset characteristics · Compatibility scores reflect algorithmic fit (0–100%)
          </p>
        </div>
      </div>

      {models.length === 0 ? (
        <div className="empty-state">
          <p className="text-sm text-muted">
            {problemType === 'uncertain'
              ? 'Please confirm a valid problem type to view model recommendations.'
              : 'Select a valid target column and problem type to generate model rankings.'}
          </p>
        </div>
      ) : (
        <div className="model-stack">
          {models.map(m => (
            <ModelCard key={m.name} model={m} onOpenExplainer={m => setSelectedModel(m)} />
          ))}
        </div>
      )}

      {/* Model Detail Drawer Explainer */}
      <ModelExplainerDrawer
        model={selectedModel}
        onClose={() => setSelectedModel(null)}
      />

      <style>{`
        .model-stack {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }
      `}</style>
    </div>
  );
}
