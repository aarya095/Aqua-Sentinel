import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import Operations from "./pages/Operations";
import AIControl from "./pages/AIControl";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page — outside the application layout */}
        <Route path="/" element={<LandingPage />} />

        {/* Main application pages — wrapped in AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/operations" element={<Operations />} />
          <Route path="/ai-control" element={<AIControl />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;