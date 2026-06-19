import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Materi from "./pages/Materi";
import Simulasi from "./pages/Simulasi";
import Kuis from "./pages/Kuis";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import DaftarSiswa from "./pages/DaftarSiswa";

function App() {
  const userJson = localStorage.getItem("clickaset_user");
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isGuru = currentUser?.role === "GURU";

  return (
    <Router>
      <Routes>
        {/* Main Dashboard Layout Pages */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Materi />} />
          <Route path="/simulasi" element={<Simulasi />} />
          <Route path="/kuis" element={<Kuis />} />
          {isGuru && <Route path="/daftar-siswa" element={<DaftarSiswa />} />}
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
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
