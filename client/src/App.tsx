import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { HomePage } from "./pages/HomePage";
import { SortingPage } from "./pages/SortingPage";
import { PathfindingPage } from "./pages/PathfindingPage";
import { PresetsPage } from "./pages/PresetsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="sorting" element={<SortingPage />} />
        <Route path="pathfinding" element={<PathfindingPage />} />
        <Route path="presets" element={<PresetsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
