'use client';

import React, { useState } from 'react';
import FlowCanvas from './FlowCanvas';
import StepInspector from './StepInspector';
import RaciMatrix from './RaciMatrix';
import AiPanel from './AiPanel';
import './mockup.css';

export default function Mockup() {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([
    { id: 's1', title: 'Receive order', description: 'Customer order received via portal', risk: 2, raci: { R: ['Alice'], A: ['Bob'] } },
    { id: 's2', title: 'Validate order', description: 'Check billing and inventory', risk: 3, raci: { R: ['Charlie'], A: ['Bob'] } },
    { id: 's3', title: 'Fulfill order', description: 'Pack and ship', risk: 4, raci: { R: ['Warehouse'], A: ['Ops Lead'] } },
  ]);
  const [edges, setEdges] = useState<any[]>([
    { id: 'e1', source: 's1', target: 's2', label: 'then' },
    { id: 'e2', source: 's2', target: 's3', label: 'then' },
  ]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  function updateStep(id: string, patch: any) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSuggestion(s: any) {
    setSuggestions((p) => [s, ...p]);
  }

  return (
    <div className="mockup-root">
      <header className="mockup-header">
        <h1>Process Mockup — Visual Map, SOP, RACI & AI</h1>
      </header>

      <div className="mockup-main">
        <div className="left-col">
          <FlowCanvas
            steps={steps}
            edges={edges}
            onSelectStep={(id) => setSelectedStepId(id)}
            onUpdateStep={(id, patch) => updateStep(id, patch)}
            onEdgesChange={setEdges}
            onStepsChange={setSteps}
          />
          <RaciMatrix steps={steps} onUpdateStep={updateStep} />
        </div>

        <aside className="right-col">
          <StepInspector
            step={steps.find((s) => s.id === selectedStepId) ?? null}
            onSave={(id, patch) => updateStep(id, patch)}
          />

          <AiPanel
            onSuggest={(sug) => {
              // simulated suggestion acceptance
              addSuggestion(sug);
              if (sug.applyToStepId) updateStep(sug.applyToStepId, { description: sug.suggestedText });
            }}
            suggestions={suggestions}
          />
        </aside>
      </div>
    </div>
  );
}
