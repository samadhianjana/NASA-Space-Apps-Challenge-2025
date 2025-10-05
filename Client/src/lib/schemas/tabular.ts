// src/lib/schemas/tabular.ts
import { z } from "zod";

export const TabularPayloadSchema = z.object({
  koi_period: z.coerce.number().finite(),
  koi_period_err1: z.coerce.number().finite(),
  koi_period_err2: z.coerce.number().finite(),
  koi_time0bk: z.coerce.number().finite(),
  koi_time0bk_err1: z.coerce.number().finite(),
  koi_time0bk_err2: z.coerce.number().finite(),
  koi_impact: z.coerce.number().finite(),
  koi_impact_err1: z.coerce.number().finite(),
  koi_impact_err2: z.coerce.number().finite(),
  koi_duration: z.coerce.number().finite(),
  koi_duration_err1: z.coerce.number().finite(),
});
export type TabularPayload = z.infer<typeof TabularPayloadSchema>;

// raw backend
export const BackendResultSchema = z.object({
  probability: z.number(),
  label: z.number(), // 0 or 1
});
export const BackendPredictResponseSchema = z.object({
  results: z.array(BackendResultSchema).min(1),
});

// normalized for UI
export const PredictionResponseSchema = z.object({
  label: z.number(),                 // 1 if p1 >= p0 else 0
  proba: z.number().nullable(),      // P(label=1)
  meta: z.object({
    p1: z.number(),
    p0: z.number(),
    results: z.array(BackendResultSchema)
  })
});
export type PredictionResponse = z.infer<typeof PredictionResponseSchema>;
