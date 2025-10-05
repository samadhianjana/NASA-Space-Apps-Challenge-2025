import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Models from "./pages/Models";
import TabularPage from "./pages/TabularPage";
import LightcurvePage from './pages/LightcurvePage'

const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: 24,
  minHeight: "calc(100vh - 160px)",
};

export default function App() {
  return (
    <div>
      <Header />
      <main style={container}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/models" element={<Models />} />
          <Route path="/tabular" element={<TabularPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/lightcurve" element={<LightcurvePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
