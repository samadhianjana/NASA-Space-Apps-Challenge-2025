import React from 'react';
import ProbBars from './ProbBars';

export default function PredictionCard({
  title,
  label,
  probabilities
}: {
  title: string;
  label: string;
  probabilities?: Record<string, number>;
}) {
  return (
    <div style={{ border: '1px solid #243143', background: '#0b0f17', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <strong style={{ fontSize: 14 }}>{title}</strong>
        <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.8 }}>
          Predicted: <strong>{label}</strong>
        </span>
      </div>
      {probabilities ? <ProbBars probabilities={probabilities} /> : <div style={{ fontSize: 12, opacity: 0.7 }}>No probability breakdown.</div>}
    </div>
  );
}
