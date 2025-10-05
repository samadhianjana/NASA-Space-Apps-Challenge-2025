type Props = { value?: number | null };

export default function ProbBar({ value }: Props) {
  const pct = typeof value === "number" ? Math.max(0, Math.min(1, value)) : 0;
  return (
    <div>
      <div style={{ fontSize: 12, color: "#8ca0b3", marginBottom: 6 }}>Probability</div>
      <div
        style={{
          background: "#0b121b",
          border: "1px solid #223042",
          borderRadius: 8,
          height: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            background: "#21c27a",
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: "#8ca0b3", marginTop: 6 }}>
        {(pct * 100).toFixed(2)}%
      </div>
    </div>
  );
}
