export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #223042", background: "#0b121b" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#8ca0b3",
        }}
      >
        <span style={{ fontSize: 12 }}>NASA Space Apps Challenge 2025 – A World Away: Hunting for Exoplanets with AI</span>
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
          v1.0
        </span>
      </div>
    </footer>
  );
}
