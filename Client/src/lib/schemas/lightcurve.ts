import { z } from "zod";

export const LightcurvePredictionSchema = z.object({
  probability: z.number().min(0).max(1),
  label: z.union([z.literal(0), z.literal(1)]),
  rationale: z.string().optional(),
  model: z.string().optional(),
});

export const LightcurveBackendResponseSchema = z.union([
  // flat: { probability, label, ... }
  LightcurvePredictionSchema,
  // wrapped: { results: [{ probability, label, ... }, ...] }
  z.object({
    results: z.array(LightcurvePredictionSchema).min(1),
  }),
]);

export type LightcurvePrediction = z.infer<typeof LightcurvePredictionSchema>;
