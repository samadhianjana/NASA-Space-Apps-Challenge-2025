// src/lib/api/errors.ts
import { AxiosError } from "axios";

export function extractApiErrorMessage(err: unknown): string {
  // Axios 422 from FastAPI
  const ax = err as AxiosError<any>;
  if (ax?.isAxiosError) {
    const detail = ax.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d: any) => {
          const path = Array.isArray(d?.loc) ? d.loc.join(".") : "";
          return `${path ? path + ": " : ""}${d?.msg ?? "Invalid input"}`;
        })
        .join(" | ");
    }
    if (typeof ax.response?.data === "string") return ax.response.data;
    if (ax.message) return ax.message;
  }
  // ZodError
  const zIssues = (err as any)?.issues;
  if (Array.isArray(zIssues) && zIssues.length) {
    return zIssues
      .map((i: any) => `${(i.path ?? []).join(".") || "field"}: ${i.message}`)
      .join(" | ");
  }
  // Fallback
  return (err as any)?.message || "Something went wrong. Please try again.";
}
