import { z } from "zod";

// Adjust field names/types to whatever your FastAPI returns
export const ModelInfoSchema = z.object({
  model_name: z.string(),
  version: z.string().optional(),
  trained_on: z.string().optional(),
  metrics: z.object({
    accuracy: z.number().optional(),
    f1: z.number().optional(),
    precision: z.number().optional(),
    recall: z.number().optional(),
    roc_auc: z.number().optional(),
  }).passthrough(), // allow extra metrics
});
export type ModelInfo = z.infer<typeof ModelInfoSchema>;
