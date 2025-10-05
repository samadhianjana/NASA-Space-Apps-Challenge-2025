import { Link, NavLink } from "react-router-dom";

const badge: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#0e1b2a",
  border: "1px solid #223042",
  color: "#8ca0b3",
  fontSize: 12,
  display: "inline-flex",
  alignItems: "center",
};

export default function Header() {
  return (
    <header style={{ borderBottom: "1px solid #223042", background: "#0b121b" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ fontWeight: 800, fontSize: 20, color: "#e7eef6" }}>
          NASA Space Apps Challenge 2025 – A World Away: Hunting for Exoplanets with AI
        </Link>
        {/* <nav style={{ display: "flex", gap: 12 }}>
          <NavLink to="/" style={badge}>
            Home
          </NavLink>
          <NavLink to="/models" style={badge}>
            Models
          </NavLink>
          <NavLink to="/tabular" style={badge}>
            Tabular
          </NavLink>
        </nav> */}
      </div>
    </header>
  );
}
