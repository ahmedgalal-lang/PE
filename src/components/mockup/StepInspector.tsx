'use client';

import React, { useState, useEffect } from 'react';

export default function StepInspector({ step, onSave }: { step: any | null; onSave: (id: string, patch: any) => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [risk, setRisk] = useState(1);

  useEffect(() => {
    setTitle(step?.title ?? '');
    setDesc(step?.description ?? '');
    setRisk(step?.risk ?? 1);
  }, [step]);

  if (!step) {
    return (
      <div className="inspector">
        <h3>Step inspector</h3>
        <div>Select a step on the map to edit its SOP, RACI, and risk.</div>
      </div>
    );
  }

  return (
    <div className="inspector">
      <h3>Editing: {step.title}</h3>

      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>SOP (rich-text simulation)</label>
      <div contentEditable className="sop-editor" onInput={(e) => setDesc((e.target as HTMLElement).innerText)}>
        {desc}
      </div>

      <label>Risk score (1-5)</label>
      <input type="range" min={1} max={5} value={risk} onChange={(e) => setRisk(Number(e.target.value))} />

      <div style={{ marginTop: 8 }}>
        <strong>Current RACI:</strong>
        <pre style={{ fontSize: 12, background: '#fafafa', padding: 8 }}>{JSON.stringify(step.raci, null, 2)}</pre>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <button
          onClick={() => {
            onSave(step.id, { title, description: desc, risk });
            alert('Saved (in-memory)');
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
