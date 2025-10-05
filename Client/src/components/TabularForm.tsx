// src/components/TabularForm.tsx
import { useEffect, useState } from "react";
import { TabularPayloadSchema } from "../lib/schemas/tabular";
import type { TabularPayload } from "../lib/schemas/tabular";

type Props = {
  onSubmit: (values: TabularPayload) => Promise<void> | void;
  initial?: Partial<Record<keyof TabularPayload, number>>;
};

// Keep the list local so we don't depend on extra exports
const featureNames = [
  "koi_period",
  "koi_period_err1",
  "koi_period_err2",
  "koi_time0bk",
  "koi_time0bk_err1",
  "koi_time0bk_err2",
  "koi_impact",
  "koi_impact_err1",
  "koi_impact_err2",
  "koi_duration",
  "koi_duration_err1",
] as const;

export default function TabularForm({ onSubmit, initial }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    featureNames.forEach((n) => {
      const v = initial?.[n];
      obj[n] = typeof v === "number" && Number.isFinite(v) ? String(v) : "";
    });
    return obj;
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Prefill when `initial` changes (e.g., after JSON upload)
  useEffect(() => {
    if (!initial) return;
    setValues((prev) => {
      const next = { ...prev };
      (Object.keys(initial) as (keyof TabularPayload)[]).forEach((k) => {
        const v = initial[k];
        next[String(k)] = typeof v === "number" && Number.isFinite(v) ? String(v) : "";
      });
      return next;
    });
  }, [initial]);

  const handleChange = (k: string, v: string) => {
    setValues((prev) => ({ ...prev, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    try {
      const prepared = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v === "" ? undefined : Number(v)])
      );
      const parsed = TabularPayloadSchema.parse(prepared) as TabularPayload;

      setBusy(true);
      await onSubmit(parsed);
    } catch (zerr: any) {
      if (zerr?.issues?.length) {
        const msg = zerr.issues
          .map((i: any) => {
            const path = Array.isArray(i.path) ? i.path.join(".") : "field";
            return `${path}: ${i.message}`;
          })
          .join(" | ");
        setErr(msg);
      } else if (zerr?.message) {
        setErr(zerr.message);
      } else {
        setErr("Invalid input");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
      {err && (
        <div style={styles.error}>
          <span style={styles.errorDot} /> {err}
        </div>
      )}

      {/* Inputs */}
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
        }}
      >
        {featureNames.map((name) => (
          <div key={name} style={{ display: "grid", gap: 6 }}>
            <label htmlFor={name} style={styles.label}>
              {name}
            </label>
            <input
              id={name}
              style={styles.input}
              inputMode="decimal"
              placeholder="e.g., 10.5"
              value={values[name] ?? ""}
              onChange={(e) => handleChange(name, e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#223042")}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          title="Clear all"
          onClick={() => setValues(Object.fromEntries(featureNames.map((n) => [n, ""])) )}
          style={styles.btnGhost}
          disabled={busy}
        >
          Clear
        </button>

        <button type="submit" disabled={busy} style={styles.btnPrimary}>
          {busy ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={styles.spinner} />
              Predicting…
            </span>
          ) : (
            "Predict"
          )}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  error: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #3a1f26",
    background: "linear-gradient(180deg,#1a1012,#12090b)",
    color: "#ff8da1",
    fontSize: 13.5,
  },
  errorDot: {
    width: 8,
    height: 8,
    background: "#f43f5e",
    borderRadius: 999,
    boxShadow: "0 0 10px #f43f5e",
  },
  label: { fontSize: 12, color: "#8ca0b3" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #223042",
    background: "#0e151e",
    color: "#e7eef6",
    outline: "none",
    transition: "border-color 200ms",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(90deg,#4aa3ff,#3b82f6)",
    color: "#001424",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 800 as any,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
  },
  btnGhost: {
    background: "transparent",
    color: "#c6d4e2",
    border: "1px solid #223042",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700 as any,
    cursor: "pointer",
  },
  spinner: {
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
