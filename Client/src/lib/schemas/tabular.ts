import { z } from 'zod';

// Accepts any key -> number (coerces number-like strings)
export const FeatureRowSchema = z
  .record(
    z.union([z.string(), z.number()]),
    z.union([
      z.number(),
      z.string().transform((v, ctx) => {
        const n = Number(v);
        if (Number.isNaN(n)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Not a number' });
          return z.NEVER;
        }
        return n;
      })
    ])
  )
  .transform((obj) => {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(obj)) out[String(k)] = typeof v === 'number' ? v : Number(v);
    return out;
  });

export type FeatureRow = z.infer<typeof FeatureRowSchema>;
