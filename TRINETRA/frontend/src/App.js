import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ToastCenter from "./components/ToastCenter";
import Home from "./pages/Home";
import Deepfake from "./pages/Deepfake";
import SafeRoute from "./pages/SafeRoute";
import Harassment from "./pages/Harassment";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <ToastCenter />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/deepfake" element={<Deepfake />} />
        <Route path="/safe-route" element={<SafeRoute />} />
        <Route path="/harassment" element={<Harassment />} />
      </Routes>
    </BrowserRouter>
  );
}
