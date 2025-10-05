import ProbBar from "./ProbBar";
import type { PredictResponse } from "../lib/types";

type Props = { result: PredictResponse | null; loading?: boolean; error?: string | null };

export default function PredictionCard({ result, loading, error }: Props) {
  const card: React.CSSProperties = {
    background: "#121923",
    border: "1px solid #223042",
    borderRadius: 12,
    padding: 18,
  };

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: 0 }}>Prediction</h3>
        {loading && (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: 999,
              background: "#0e1b2a",
              border: "1px solid #223042",
              color: "#8ca0b3",
              fontSize: 12,
            }}
          >
            Running…
          </span>
        )}
      </div>

      <div style={{ height: 1, background: "#223042", margin: "12px 0" }} />

      {error && <div style={{ color: "#ff5a5f", marginBottom: 8 }}>{error}</div>}

      {!result && !error && !loading && (
        <div style={{ color: "#8ca0b3" }}>Submit the form to see results.</div>
      )}

      {result && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#8ca0b3", marginBottom: 6 }}>Predicted Label</div>
            <div
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                background: "#0e1b2a",
                border: "1px solid #223042",
                display: "inline-block",
              }}
            >
              {result.label}
            </div>
          </div>
          <ProbBar value={result.proba ?? null} />
        </div>
      )}
    </div>
  );
}
