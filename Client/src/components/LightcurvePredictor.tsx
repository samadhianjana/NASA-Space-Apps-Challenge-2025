// src/components/LightcurvePredictor.tsx
import { useRef, useState } from "react";
import { predictLightcurve } from "../lib/api/sdk";

type Status = "idle" | "loading" | "error" | "done";

export default function LightcurvePredictor() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [probPlanet, setProbPlanet] = useState<number | null>(null);
  const [label, setLabel] = useState<0 | 1 | null>(null);
  const [rationale, setRationale] = useState<string | undefined>(undefined);
  const [modelName, setModelName] = useState<string | undefined>(undefined);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (f: File) => {
    setStatus("loading");
    setError(null);
    setProbPlanet(null);
    setLabel(null);
    setRationale(undefined);
    setModelName(undefined);

    try {
      const out = await predictLightcurve(f);
      setProbPlanet(out.probability); // P(planet=1)
      setLabel(out.label);
      setRationale(out.rationale);
      setModelName(out.model);
      setStatus("done");
    } catch (err: any) {
      setError(err?.message ?? "Failed to get prediction.");
      setStatus("error");
    }
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await handleFile(f);
    // Reset input so same-name re-uploads work
    if (fileRef.current) fileRef.current.value = "";
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) await handleFile(f);
  };

  const reset = () => {
    if (fileRef.current) fileRef.current.value = "";
    setStatus("idle");
    setError(null);
    setProbPlanet(null);
    setLabel(null);
    setRationale(undefined);
    setModelName(undefined);
  };

  const percent = probPlanet != null ? Math.max(0, Math.min(1, probPlanet)) * 100 : 0;

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.header}>
          <h2 style={styles.title}>Light-Curve Classifier</h2>
          <p style={styles.subtitle}>
            Upload a folded light curve (CSV/JSON) or an image (PNG/JPG) to get a planet likelihood.
          </p>
        </header>

        {/* Upload Card */}
        <section style={styles.card}>
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
              background: dragOver
                ? "linear-gradient(180deg,#101826,#0d1420)"
                : "linear-gradient(180deg,#0f1621,#0b1119)",
            }}
          >
            <div style={styles.dropHeader}>
              <span style={styles.dropTitle}>Upload</span>
              <span style={styles.modePill}>Single file</span>
            </div>

            <p style={styles.hint}>Drag & drop here, or click to choose a file</p>

            <label style={styles.btnPrimary}>
              Select file
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json,image/png,image/jpeg"
                onChange={onPick}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* Status & Errors */}
          {status === "loading" && (
            <div style={styles.loading}>
              <span style={styles.spinner} />
              Running inference…
            </div>
          )}

          {status === "error" && (
            <div style={styles.alert}>
              <span style={styles.alertDot} /> {error}
            </div>
          )}
        </section>

        {/* Results Card */}
        <section style={styles.card}>
          <div style={styles.cardHeadRow}>
            <div style={styles.pillInfo}>Prediction</div>
            {modelName && <div style={styles.modelBadge}>Model: {modelName}</div>}
          </div>

          {status !== "done" || probPlanet === null ? (
            <div style={{ color: "#9fb3c8" }}>
              Your result will appear here after uploading a file.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {/* Big number + label chip */}
              <div style={styles.resultTopRow}>
                <div>
                  <div style={styles.kicker}>Predicted Probability (Planet)</div>
                  <div style={styles.bigPercent}>{percent.toFixed(2)}%</div>
                </div>
                <div
                  style={{
                    ...styles.badge,
                    background:
                      label === 1
                        ? "linear-gradient(90deg,#34d399,#10b981)"
                        : "linear-gradient(90deg,#f59e0b,#f59e0b)",
                    color: "#001115",
                  }}
                >
                  {label === 1 ? "Likely Planet" : "Likely Non-Planet"}
                </div>
              </div>

              {/* Progress bar */}
              <div style={styles.progressWrap} aria-label="Planet probability progress">
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${percent}%`,
                    background:
                      label === 1
                        ? "linear-gradient(90deg,#34d399,#10b981)"
                        : "linear-gradient(90deg,#60a5fa,#3b82f6)",
                  }}
                />
              </div>

              {/* Rationale */}
              {rationale && (
                <div style={styles.rationale}>
                  <div style={styles.rationaleTitle}>Rationale</div>
                  <p style={styles.rationaleText}>{rationale}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={reset} style={styles.btnGhost}>
                  Reset
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    // works as a standalone section; if you already have a page bg, you can remove this
    background:
      "radial-gradient(1200px 800px at 80% -10%, rgba(59,130,246,0.12), transparent 60%), radial-gradient(1000px 700px at -10% 110%, rgba(168,85,247,0.12), transparent 60%), #0b1119",
    color: "#e7eef6",
    padding: "24px 16px",
    borderRadius: 16,
  },
  wrap: {
    maxWidth: 900,
    margin: "0 auto",
    display: "grid",
    gap: 16,
  },
  header: { display: "grid", gap: 6 },
  title: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: 0.2 },
  subtitle: { margin: 0, color: "#9fb3c8", fontSize: 14.5 },

  card: {
    background: "linear-gradient(180deg, rgba(22,32,45,0.9), rgba(14,21,30,0.9))",
    border: "1px solid #223042",
    borderRadius: 16,
    padding: 16,
    backdropFilter: "blur(6px)",
  },
  dropzone: {
    border: "1px dashed",
    borderRadius: 14,
    padding: 16,
    color: "#c6d4e2",
    textAlign: "center" as const,
    transition: "border-color 200ms, background 200ms",
  },
  dropHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dropTitle: { fontWeight: 800, fontSize: 14 },
  modePill: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    background: "#0e151e",
    border: "1px solid #223042",
    color: "#9fb3c8",
  },
  hint: { color: "#9fb3c8", fontSize: 13, margin: "6px 0 12px" },

  btnPrimary: {
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
  btnGhost: {
    background: "transparent",
    color: "#c6d4e2",
    border: "1px solid #223042",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700 as any,
    cursor: "pointer",
  },

  loading: {
    marginTop: 12,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    color: "#cfe2f3",
    fontSize: 14,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  alert: {
    marginTop: 12,
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
  alertDot: {
    width: 8,
    height: 8,
    background: "#f43f5e",
    borderRadius: 999,
    boxShadow: "0 0 10px #f43f5e",
  },

  cardHeadRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pillInfo: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#0e151e",
    border: "1px solid #223042",
    color: "#9fb3c8",
  },
  modelBadge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.4)",
    color: "#c7d2fe",
  },

  resultTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  kicker: { fontSize: 12, color: "#9fb3c8" },
  bigPercent: { fontSize: 36, fontWeight: 800, lineHeight: 1, marginTop: 2 },

  badge: {
    fontWeight: 800,
    fontSize: 13,
    padding: "8px 12px",
    borderRadius: 999,
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
    whiteSpace: "nowrap" as const,
  },

  progressWrap: {
    height: 12,
    width: "100%",
    background: "#0e151e",
    border: "1px solid #223042",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 400ms ease",
  },

  rationale: {
    background: "#0e151e",
    border: "1px solid #223042",
    borderRadius: 12,
    padding: 12,
  },
  rationaleTitle: { fontWeight: 700, fontSize: 13, marginBottom: 4, color: "#cfe2f3" },
  rationaleText: { margin: 0, fontSize: 13.5, color: "#c6d4e2", whiteSpace: "pre-wrap" as const },
};
