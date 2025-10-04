import { api } from './client';

export async function predictTabular(payload: { features: Record<string, number> }) {
  const { data } = await api.post('/predict/tabular', payload);
  return data as { label: string; probabilities?: Record<string, number>; meta?: Record<string, unknown> };
}

export async function getMetrics() {
  const { data } = await api.get('/model/metrics');
  return data as Record<string, unknown>;
}
