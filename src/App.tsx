import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Materi from "./pages/Materi";
import Simulasi from "./pages/Simulasi";
import Kuis from "./pages/Kuis";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard Layout Pages */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Materi />} />
          <Route path="/simulasi" element={<Simulasi />} />
          <Route path="/kuis" element={<Kuis />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Auth Full Screen Pages */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Fallback redirect or Not Found */}
        <Route path="*" element={<Materi />} />
      </Routes>
    </Router>
  );
}

export default App;
