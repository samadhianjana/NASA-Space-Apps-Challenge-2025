export type ModelKind = "tabular" | "lightcurve";

export interface ModelInfo {
  name: string;
  version: string;
  kind: ModelKind;
  loaded: boolean;
  features?: string[];
  notes?: string | null;
}

export interface PredictResponse {
  label: number;
  proba?: number | null;
  meta?: Record<string, unknown> | null;
}
