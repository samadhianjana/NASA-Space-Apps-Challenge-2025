import React from 'react';

export default function ProbBars({ probabilities }: { probabilities: Record<string, number> }) {
  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {entries.map(([cls, p]) => {
        const pct = Math.max(0, Math.min(1, Number(p))) * 100;
        return (
          <div key={cls} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 60px', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cls}</div>
            <div style={{ height: 10, background: '#0f1522', border: '1px solid #223047', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6' }} />
            </div>
            <div style={{ fontSize: 12, textAlign: 'right', opacity: 0.85 }}>{pct.toFixed(1)}%</div>
          </div>
        );
      })}
    </div>
  );
}
