'use client';

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  MarkerType,
  ConnectionMode,
} from 'react-flow-renderer';

type Props = {
  steps: any[];
  edges: any[];
  onSelectStep: (id: string) => void;
  onUpdateStep: (id: string, patch: any) => void;
  onEdgesChange: (edges: any[]) => void;
  onStepsChange: (steps: any[]) => void;
};

export default function FlowCanvas({ steps, edges, onSelectStep, onUpdateStep, onEdgesChange, onStepsChange }: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [efs, setEfs] = useState<Edge[]>([]);

  useEffect(() => {
    setNodes(
      steps.map((s, i) => ({
        id: s.id,
        position: { x: 100 + i * 220, y: 40 + (i % 2) * 120 },
        data: { label: s.title, risk: s.risk },
        style: { border: '1px solid #777', padding: 10, borderRadius: 6, background: riskColor(s.risk) },
      }))
    );
  }, [steps]);

  useEffect(() => {
    setEfs(edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: e.label, animated: true, markerEnd: { type: MarkerType.Arrow } })));
  }, [edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = { id: `e${Date.now()}`, source: params.source!, target: params.target!, label: '' };
      onEdgesChange([...edges, newEdge]);
    },
    [edges, onEdgesChange]
  );

  const onNodeClick = (_: any, node: Node) => {
    onSelectStep(node.id);
  };

  return (
    <div style={{ height: 420, border: '1px solid #ddd', marginBottom: 12 }}>
      <ReactFlow nodes={nodes} edges={efs} onConnect={onConnect} onNodeClick={onNodeClick} connectionMode={ConnectionMode.Loose}>
        <MiniMap nodeStrokeColor={() => '#222'} nodeColor={() => '#fff'} nodeBorderRadius={5} />
        <Controls />
        <Background gap={12} />
      </ReactFlow>
    </div>
  );
}

function riskColor(score: number) {
  if (score >= 4) return '#ffcccc';
  if (score >= 3) return '#ffe6b3';
  if (score >= 2) return '#fff7cc';
  return '#e6ffe6';
}
