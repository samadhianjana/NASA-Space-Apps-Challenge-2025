// src/pages/TabularPage.tsx
import { useState } from "react";
import TabularForm from "../components/TabularForm";
import JsonUpload from "../components/JsonUpload";
import { predictTabular } from "../lib/api/sdk";
import type { TabularPayload } from "../lib/schemas/tabular";

export default function TabularPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<Partial<TabularPayload> | null>(null);
  const [prediction, setPrediction] = useState<{
    label: number;
    proba: number | null;
    meta?: { p1: number; p0: number; results: Array<{ probability: number; label: number }> };
  } | null>(null);

  const onSubmit = async (payload: TabularPayload) => {
    setErrorMsg(null);
    setPrediction(null);
    try {
      const pred = await predictTabular(payload);
      setPrediction(pred);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Request failed");
    }
  };

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.wrapper}>
        <header style={pageStyles.header}>
          <h1 style={pageStyles.title}>Tabular Model</h1>
          <p style={pageStyles.subtitle}>Upload JSON or fill the form manually.</p>
        </header>

        {errorMsg && <div style={pageStyles.alert}><span style={pageStyles.alertDot} /> {errorMsg}</div>}

        <div style={pageStyles.grid}>
          <section style={pageStyles.card}>
            <div style={{ display: "grid", gap: 12 }}>
              <JsonUpload
                mode="prefill" // change to "submit" to auto-submit after upload
                onParsed={(parsed) => {
                  // Prefill form (or call onSubmit(parsed) if mode === "submit")
                  setPrefill(parsed);
                }}
              />
              <div style={{ height: 1, background: "#223042" }} />
              <TabularForm onSubmit={onSubmit} initial={prefill ?? undefined} />
            </div>
          </section>

          <aside style={pageStyles.card}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Prediction</div>

            {!prediction ? (
              <div style={{ color: "#9fb3c8" }}>
                Upload a JSON or submit the form to view results.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    padding: "8px 12px",
                    borderRadius: 999,
                    background:
                      prediction.label === 1
                        ? "linear-gradient(90deg,#34d399,#10b981)"
                        : "linear-gradient(90deg,#f43f5e,#ef4444)",
                    color: "#001115",
                    width: "fit-content",
                  }}
                >
                  {prediction.label === 1 ? "Exoplanet (1)" : "Not Exoplanet (0)"}
                </div>

                {prediction.meta && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#9fb3c8" }}>P(planet=1)</span>
                      <span style={{ fontWeight: 700 }}>{prediction.meta.p1.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 10, background: "#0e151e", border: "1px solid #223042", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.max(0, Math.min(1, prediction.meta.p1)) * 100}%`,
                          background: "linear-gradient(90deg,#34d399,#10b981)",
                          borderRadius: 999,
                          transition: "width 400ms ease",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#9fb3c8" }}>P(not=0)</span>
                      <span style={{ fontWeight: 700 }}>{prediction.meta.p0.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 10, background: "#0e151e", border: "1px solid #223042", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.max(0, Math.min(1, prediction.meta.p0)) * 100}%`,
                          background: "linear-gradient(90deg,#60a5fa,#3b82f6)",
                          borderRadius: 999,
                          transition: "width 400ms ease",
                        }}
                      />
                    </div>
                  </>
                )}

                {prediction.meta?.results && (
                  <details style={{ marginTop: 6, borderTop: "1px solid #223042", paddingTop: 8 }}>
                    <summary style={{ cursor: "pointer", color: "#9fb3c8", marginBottom: 6 }}>
                      Show raw ensemble results
                    </summary>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
                      {prediction.meta.results.map((r, i) => (
                        <li key={i} style={{ fontSize: 13.5, color: "#c6d4e2", background: "#0e151e", border: "1px solid #223042", padding: "8px 10px", borderRadius: 10 }}>
                          <span style={{ fontWeight: 700, color: "#9fb3c8", marginRight: 6 }}>#{i + 1}</span>
                          label={r.label}, probability={r.probability.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

const pageStyles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 800px at 80% -10%, rgba(59,130,246,0.12), transparent 60%), radial-gradient(1000px 700px at -10% 110%, rgba(168,85,247,0.12), transparent 60%), #0b1119",
    padding: "24px 16px",
    color: "#e7eef6",
  },
  wrapper: { width: "100%", maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 },
  header: { display: "grid", gap: 6, textAlign: "left" },
  title: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: 0.2 },
  subtitle: { margin: 0, color: "#9fb3c8", fontSize: 14.5 },
  alert: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    borderRadius: 12, border: "1px solid #3a1f26", background: "linear-gradient(180deg,#1a1012,#12090b)",
    color: "#ff8da1",
  },
  alertDot: { width: 8, height: 8, background: "#f43f5e", borderRadius: 999, boxShadow: "0 0 10px #f43f5e" },
  grid: { display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" },
  card: {
    background: "linear-gradient(180deg, rgba(22,32,45,0.9), rgba(14,21,30,0.9))",
    border: "1px solid #223042",
    borderRadius: 16,
    padding: 16,
    backdropFilter: "blur(6px)",
  },
};
