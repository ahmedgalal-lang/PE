'use client';

import React from 'react';

export default function RaciMatrix({ steps, onUpdateStep }: { steps: any[]; onUpdateStep: (id: string, patch: any) => void }) {
  const roles = ['R', 'A', 'C', 'I'];

  function toggleRole(stepId: string, role: string) {
    const s = steps.find((x) => x.id === stepId);
    const list = (s.raci && s.raci[role]) || [];
    const sampleUser = `User${Math.floor(Math.random() * 10) + 1}`;
    // toggle: if already present remove, otherwise add
    const has = list.includes(sampleUser);
    const newList = has ? list.filter((u) => u !== sampleUser) : [...list, sampleUser];
    onUpdateStep(stepId, { raci: { ...(s.raci ?? {}), [role]: newList } });
  }

  return (
    <div className="raci-matrix">
      <h3>RACI Matrix (matrix view)</h3>
      <table>
        <thead>
          <tr>
            <th>Step</th>
            {roles.map((r) => (
              <th key={r}>{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {steps.map((s) => (
            <tr key={s.id}>
              <td style={{ width: 200 }}>{s.title}</td>
              {roles.map((r) => (
                <td key={r}>
                  <div style={{ fontSize: 12, minHeight: 36 }}>{(s.raci && s.raci[r])?.join(', ') ?? '-'}</div>
                  <button onClick={() => toggleRole(s.id, r)} style={{ marginTop: 4 }}>
                    toggle {r}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
