// src/pages/LightcurvePage.tsx
import LightcurvePredictor from "../components/LightcurvePredictor";

export default function LightcurvePage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Optional top bar / back link */}
        <header style={styles.header}>
          <a href="/" style={styles.backLink} aria-label="Back to Home">
            ← Back
          </a>
          <div style={{ flex: 1 }} />
        </header>

        <LightcurvePredictor />
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    // Subtle space-haze background that complements the component
    background:
      "radial-gradient(1200px 800px at 80% -10%, rgba(59,130,246,0.12), transparent 60%), radial-gradient(1000px 700px at -10% 110%, rgba(168,85,247,0.12), transparent 60%), #0b1119",
    color: "#e7eef6",
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "24px 16px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    color: "#cfe2f3",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 700 as any,
  },
};
