import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { z } from 'zod';
import PredictionCard from './components/PredictionCard';
import { predictTabular, getMetrics } from './lib/api/sdk';
import { FeatureRowSchema } from './lib/schemas/tabular';

type PredictResponse = { label: string; probabilities?: Record<string, number>; meta?: Record<string, unknown> };

const styles = {
  box: { border: '1px solid #243143', background: '#0f1522', borderRadius: 12, padding: 16 },
  btn: { background: '#1e2a3a', border: '1px solid #2b3b54', color: '#e6e9ef', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' },
  input: { background: '#0b0f17', color: '#e6e9ef', border: '1px solid #243143', borderRadius: 10, padding: 10, width: '100%' }
} as const;

export default function App() {
  const [jsonText, setJsonText] = useState('{"feature_1": 0.12, "feature_2": 7}');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [single, setSingle] = useState<PredictResponse | null>(null);
  const [batch, setBatch] = useState<PredictResponse[]>([]);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);

  const parsed = useMemo(() => {
    try { return FeatureRowSchema.parse(JSON.parse(jsonText)); } catch { return null; }
  }, [jsonText]);

  const doPredict = async () => {
    setError(''); setBusy(true); setSingle(null);
    try {
      if (!parsed) throw new Error('Invalid JSON');
      const res = await predictTabular({ features: parsed });
      setSingle(res);
    } catch (e: any) { setError(e?.message || 'Prediction failed'); }
    finally { setBusy(false); }
  };

  const doMetrics = async () => {
    setError(''); setBusy(true);
    try { setMetrics(await getMetrics()); }
    catch (e: any) { setError(e?.message || 'Failed to load metrics'); }
    finally { setBusy(false); }
  };

  const onCsv = async (file: File) => {
    setError(''); setBusy(true); setBatch([]);
    try {
      const rows = await new Promise<any[]>((resolve, reject) => {
        Papa.parse(file, { header: true, skipEmptyLines: true, complete: r => resolve(r.data as any[]), error: reject });
      });
      const valid = rows.flatMap((r, i) => { try { return [FeatureRowSchema.parse(r)]; } catch { return []; } });
      const sample = valid.slice(0, Math.min(valid.length, 50));
      const results = await Promise.all(sample.map(features => predictTabular({ features })));
      setBatch(results);
    } catch (e: any) { setError(e?.message || 'CSV upload failed'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20, color: '#e6e9ef' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: '#22c55e' }} />
        <h1 style={{ margin: 0, fontSize: 22 }}>Exoplanet Predictor — MVP</h1>
        <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>
          API: {import.meta.env.VITE_API_URL || 'not set'}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <section style={styles.box}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Single Prediction (JSON)</h2>
          <textarea
            style={{ ...styles.input, height: 160, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={styles.btn} onClick={doPredict} disabled={busy || !parsed}>{busy ? 'Predicting…' : 'Predict'}</button>
            <button style={{ ...styles.btn, background: '#162033' }} onClick={() => setSingle(null)} disabled={busy}>Clear</button>
          </div>
          {error && <div style={{ marginTop: 12, color: '#fda4af', fontSize: 13 }}>{error}</div>}
          {single && <div style={{ marginTop: 14 }}><PredictionCard title="Single Prediction" label={single.label} probabilities={single.probabilities} /></div>}
        </section>

        <section style={styles.box}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Batch Prediction (CSV)</h2>
          <label>
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onCsv(f); }} />
            <span style={styles.btn}>Choose CSV…</span>
          </label>
          {batch.length > 0 && (
            <div style={{ marginTop: 12, display: 'grid', gap: 10, maxHeight: 280, overflow: 'auto' }}>
              {batch.map((r, i) => (
                <PredictionCard key={i} title={`Row ${i + 1}`} label={r.label} probabilities={r.probabilities} />
              ))}
            </div>
          )}
        </section>

        <section style={{ ...styles.box, gridColumn: '1 / span 2' }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Model Metrics</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={styles.btn} onClick={doMetrics} disabled={busy}>{busy ? 'Loading…' : 'Load Metrics'}</button>
            <button style={{ ...styles.btn, background: '#162033' }} onClick={() => setMetrics(null)} disabled={busy}>Clear</button>
          </div>
          {metrics && (
            <pre style={{ marginTop: 12, ...styles.input, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
{JSON.stringify(metrics, null, 2)}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
