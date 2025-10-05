// src/components/JsonUpload.tsx
import { useCallback, useState } from "react";
import { TabularPayloadSchema } from "../lib/schemas/tabular";
import type { TabularPayload } from "../lib/schemas/tabular";

type Props = {
  onParsed: (values: TabularPayload) => void;
  mode?: "prefill" | "submit"; // how the parent will use parsed values
  title?: string;
  hint?: string;
};

export default function JsonUpload({
  onParsed,
  mode = "prefill",
  title = "Upload JSON",
  hint = "Drop a .json file or click to select",
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const readFile = useCallback(async (file: File) => {
    setErr(null);
    if (!file.name.toLowerCase().endsWith(".json")) {
      setErr("Please select a .json file.");
      return;
    }
    try {
      const text = await file.text();
      const raw = JSON.parse(text);

      // Accept either exact numeric fields OR strings that can be cast to numbers
      const normalized: Record<string, number | undefined> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (v === "" || v === null || typeof v === "undefined") {
          normalized[k] = undefined;
        } else if (typeof v === "number") {
          normalized[k] = v;
        } else if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) {
          normalized[k] = Number(v);
        } else {
          normalized[k] = undefined;
        }
      }

      // Validate via zod schema
      const parsed = TabularPayloadSchema.parse(normalized) as TabularPayload;
      onParsed(parsed);
    } catch (e: any) {
      if (e?.issues?.length) {
        const msg = e.issues
          .map((i: any) => `${Array.isArray(i.path) ? i.path.join(".") : "field"}: ${i.message}`)
          .join(" | ");
        setErr(msg);
      } else {
        setErr(e?.message ?? "Invalid JSON or schema mismatch.");
      }
    }
  }, [onParsed]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) readFile(f);
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) readFile(f);
    e.target.value = ""; // reset for re-upload
  };

  return (
    <div style={styles.wrap}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={onDrop}
        style={{
          ...styles.dropzone,
          borderColor: dragOver ? "#3b82f6" : "#223042",
          background: dragOver ? "linear-gradient(180deg,#101826,#0d1420)" : "linear-gradient(180deg,#0f1621,#0b1119)",
        }}
        title={mode === "submit" ? "Upload JSON and submit" : "Upload JSON to prefill"}
      >
        <div style={styles.titleRow}>
          <div style={styles.title}>{title}</div>
          <div style={styles.modePill}>
            {mode === "submit" ? "Submit on upload" : "Prefill form"}
          </div>
        </div>

        <div style={styles.hint}>{hint}</div>

        <label style={styles.btn} tabIndex={0}>
          Select file
          <input
            type="file"
            accept="application/json"
            onChange={onPick}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {err && (
        <div style={styles.error}>
          <span style={styles.errorDot} /> {err}
        </div>
      )}

      <div style={styles.example}>
        <div style={styles.exampleTitle}>Expected JSON shape</div>
        <pre style={styles.pre}>
{`{
  "koi_period": 10.5,
  "koi_period_err1": 0.12,
  "koi_period_err2": -0.10,
  "koi_time0bk": 134.23,
  "koi_time0bk_err1": 0.02,
  "koi_time0bk_err2": -0.03,
  "koi_impact": 0.5,
  "koi_impact_err1": 0.1,
  "koi_impact_err2": -0.1,
  "koi_duration": 3.2,
  "koi_duration_err1": 0.05
}`}
        </pre>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: "grid", gap: 10 },
  dropzone: {
    border: "1px dashed",
    borderRadius: 14,
    padding: 16,
    color: "#c6d4e2",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontWeight: 800, fontSize: 14 },
  modePill: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    background: "#0e151e",
    border: "1px solid #223042",
    color: "#9fb3c8",
  },
  hint: { color: "#9fb3c8", fontSize: 13, marginBottom: 10 },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: 10,
    background: "linear-gradient(90deg,#4aa3ff,#3b82f6)",
    color: "#001424",
    fontWeight: 800 as any,
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
  },
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
  example: {
    background: "#0e151e",
    border: "1px solid #223042",
    borderRadius: 12,
    padding: 12,
    color: "#9fb3c8",
  },
  exampleTitle: { fontWeight: 700, fontSize: 12, marginBottom: 6 },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    fontSize: 12,
    color: "#cfe2f3",
  },
};
