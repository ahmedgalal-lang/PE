'use client';

import React, { useState } from 'react';

export default function AiPanel({ onSuggest, suggestions }: { onSuggest: (s: any) => void; suggestions: any[] }) {
  const [text, setText] = useState('');
  const [applyTo, setApplyTo] = useState<string | ''>('');

  function simulateSuggestion() {
    const sug = {
      id: `sug-${Date.now()}`,
      suggestedText: text || 'Add a verification step to confirm billing address',
      raci: [{ role: 'R', hint: 'Billing Clerk' }, { role: 'A', hint: 'Finance Lead' }],
      riskFlags: ['missing_control', 'manual_step'],
      applyToStepId: applyTo || null,
      notes: 'Simulated suggestion (no LLM called in mockup)',
    };
    onSuggest(sug);
  }

  return (
    <div className="ai-panel">
      <h3>AI Assistant (simulated)</h3>
      <label>Suggestion prompt (free text)</label>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Suggest step improvements..." />
      <label>Apply to step id (optional)</label>
      <input value={applyTo} onChange={(e) => setApplyTo(e.target.value)} placeholder="s1, s2, ..." />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={simulateSuggestion}>Generate Suggestion</button>
      </div>

      <h4 style={{ marginTop: 12 }}>Recent suggestions</h4>
      <div>
        {suggestions.length === 0 && <div style={{ fontSize: 13, color: '#666' }}>No suggestions yet</div>}
        {suggestions.map((s: any) => (
          <div key={s.id} style={{ border: '1px solid #eee', padding: 8, marginTop: 8 }}>
            <div style={{ fontWeight: 600 }}>{s.suggestedText}</div>
            <div style={{ fontSize: 12, color: '#444' }}>{s.notes}</div>
            <div style={{ marginTop: 6 }}>
              <button
                onClick={() => {
                  alert('Applied (simulate)');
                }}
              >
                Apply
              </button>{' '}
              <button
                onClick={() => {
                  alert('Reject (simulate)');
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
