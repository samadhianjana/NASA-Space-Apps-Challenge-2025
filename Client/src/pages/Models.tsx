import { useEffect, useState } from "react";
import { getModelInfo } from "../lib/api/sdk";
import type { ModelInfo } from "../lib/types";

export default function Models() {
  const [models, setModels] = useState<ModelInfo[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getModelInfo().then(setModels).catch((e) => setErr(e?.message ?? "Failed to load"));
  }, []);

  const card: React.CSSProperties = {
    background: "#121923",
    border: "1px solid #223042",
    borderRadius: 12,
    padding: 18,
  };

  return (
    <div style={card}>
      <h2 style={{ marginTop: 0 }}>Models</h2>
      <div style={{ height: 1, background: "#223042", margin: "12px 0" }} />
      {err && <div style={{ color: "#ff5a5f" }}>{err}</div>}
      {!models && !err && (
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
          Loading…
        </span>
      )}
      {models && models.length === 0 && (
        <div style={{ color: "#8ca0b3" }}>No models advertised.</div>
      )}
      {models && models.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {models.map((m) => (
            <div
              key={`${m.kind}-${m.name}`}
              style={{
                background: "#0e151e",
                border: "1px solid #223042",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "#8ca0b3" }}>
                    kind: {m.kind} · v{m.version}
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: m.loaded ? "#0f2a1f" : "#2a0f0f",
                    border: "1px solid #223042",
                    color: m.loaded ? "#21c27a" : "#ff5a5f",
                    fontSize: 12,
                  }}
                >
                  {m.loaded ? "Loaded" : "Not loaded"}
                </span>
              </div>
              {m.features && m.features.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: "#8ca0b3", marginBottom: 4 }}>
                    features
                  </div>
                  <div style={{ color: "#8ca0b3", fontSize: 13 }}>
                    {m.features.join(", ")}
                  </div>
                </div>
              )}
              {m.notes && <div style={{ marginTop: 10, color: "#8ca0b3" }}>{m.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
