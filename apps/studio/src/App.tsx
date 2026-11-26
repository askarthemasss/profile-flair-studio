import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/landing.js";
import { StudioPage } from "./pages/studio.js";
import { ThemesPage } from "./pages/themes.js";
import { DocsPage } from "./pages/docs.js";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/studio" element={<StudioPage />} />
      <Route path="/themes" element={<ThemesPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
