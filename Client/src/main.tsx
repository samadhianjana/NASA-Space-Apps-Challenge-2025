import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const bodyStyle: React.CSSProperties = {
  margin: 0,
  background: "#0b0f14",
  color: "#e7eef6",
  fontFamily:
    "Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial",
};

document.body.style.margin = "0";
Object.assign(document.body.style, bodyStyle);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
