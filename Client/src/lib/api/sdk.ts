// src/lib/api/sdk.ts
import { api } from "./client";
import {
  PredictionResponseSchema,
  BackendPredictResponseSchema,
  type TabularPayload,
  type PredictionResponse,
} from "../schemas/tabular";
import { ModelInfoSchema, type ModelInfo } from "../schemas/model";
import { extractApiErrorMessage } from "./errors";

import {
  LightcurveBackendResponseSchema,
  LightcurvePredictionSchema,
  type LightcurvePrediction,
} from "../schemas/lightcurve";


// ---------- TABULAR ----------
export async function predictTabular(data: TabularPayload): Promise<PredictionResponse> {
  try {
    const res = await api.post("/api/v1/predict/tabular", { instances: [data] });

    const parsed = BackendPredictResponseSchema.parse(res.data);
    const results = parsed.results;

    const sum = { 0: 0, 1: 0 } as Record<0 | 1, number>;
    const cnt = { 0: 0, 1: 0 } as Record<0 | 1, number>;
    for (const r of results) {
      const lab = (r.label === 1 ? 1 : 0) as 0 | 1;
      sum[lab] += r.probability;
      cnt[lab] += 1;
    }
    const p1 = cnt[1] ? sum[1] / cnt[1] : 0;
    const p0 = cnt[0] ? sum[0] / cnt[0] : 0;
    const label = p1 >= p0 ? 1 : 0;

    const normalized: PredictionResponse = {
      label,
      proba: p1,
      meta: { p1, p0, results },
    };

    return PredictionResponseSchema.parse(normalized);
  } catch (e) {
    throw new Error(extractApiErrorMessage(e));
  }
}

// ---------- IMAGE (LIGHT-CURVE) ----------
/**
 * Sends a light-curve image (PNG/JPG) to the backend and returns a normalized PredictionResponse.
 * Backend may return either:
 *   { prob_exoplanet: number }  OR
 *   { results: [{ probability: number, label: 0|1 }, ...] }
 */
export async function predictLightcurveImage(file: File): Promise<PredictionResponse> {
  try {
    const fd = new FormData();
    fd.append("file", file);

    const res = await api.post("/api/v1/predict/image", fd, {
      // Let the browser set multipart boundary; don't set Content-Type manually
      headers: undefined,
    });

    const data: any = res.data;

    // Case A: direct scalar
    if (typeof data?.prob_exoplanet === "number") {
      const p1 = Number(data.prob_exoplanet);
      const p0 = 1 - p1;
      const label = p1 >= p0 ? 1 : 0;
      const normalized: PredictionResponse = {
        label,
        proba: p1,
        meta: { p1, p0, results: [{ probability: p1, label: 1 as const }, { probability: p0, label: 0 as const }] },
      };
      return PredictionResponseSchema.parse(normalized);
    }

    // Case B: array of {probability,label}
    if (Array.isArray(data?.results)) {
      const results = data.results as Array<{ probability: number; label: 0 | 1 }>;
      const sum = { 0: 0, 1: 0 } as Record<0 | 1, number>;
      const cnt = { 0: 0, 1: 0 } as Record<0 | 1, number>;
      for (const r of results) {
        const lab = (r.label === 1 ? 1 : 0) as 0 | 1;
        sum[lab] += Number(r.probability);
        cnt[lab] += 1;
      }
      const p1 = cnt[1] ? sum[1] / cnt[1] : 0;
      const p0 = cnt[0] ? sum[0] / cnt[0] : 0;
      const label = p1 >= p0 ? 1 : 0;

      const normalized: PredictionResponse = {
        label,
        proba: p1,
        meta: { p1, p0, results },
      };
      return PredictionResponseSchema.parse(normalized);
    }

    throw new Error("Unexpected backend response shape for image prediction.");
  } catch (e) {
    throw new Error(extractApiErrorMessage(e));
  }
}

// ---------- MODEL INFO / METRICS ----------
export async function getModelInfo(): Promise<ModelInfo> {
  const res = await api.get("/api/v1/model/metrics");
  return ModelInfoSchema.parse(res.data);
}

// Optional alias to keep older imports working
export const getMetrics = getModelInfo;

export async function predictLightcurve(file: File): Promise<LightcurvePrediction> {
  try {
    const form = new FormData();
    // backend expects "image"
    form.append("image", file);

    // swap to "/predict/lightcurve" if that's your exact path
    const res = await api.post("/api/v1/predict/lightcurve", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const parsed = LightcurveBackendResponseSchema.parse(res.data);
    const normalized =
      "results" in parsed ? parsed.results[0] : parsed;

    // extra guard (keeps types happy if backend changes)
    return LightcurvePredictionSchema.parse(normalized);
  } catch (err: any) {
    const detail = err?.response?.data?.detail;
    if (Array.isArray(detail) && detail[0]?.msg) {
      throw new Error(detail[0].msg);
    }
    throw new Error(extractApiErrorMessage(err));
  }
}