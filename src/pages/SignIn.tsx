import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Phone, ArrowLeft } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [usernameOrPhone, setUsernameOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forgot password states
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [resetPhone, setResetPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!usernameOrPhone || !password) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    // Default bypass logins for easy offline/demo testing
    if (usernameOrPhone.toLowerCase() === "guru" && password === "guru") {
      const defaultGuru = {
        username: "guru",
        phone_number: "08123456789",
        full_name: "Ibu Indah (Guru Akuntansi)",
        role: "GURU",
      };
      localStorage.setItem("clickaset_user", JSON.stringify(defaultGuru));
      setSuccess("Login Guru default berhasil!");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
      return;
    } else if (usernameOrPhone.toLowerCase() === "siswa" && password === "siswa") {
      const defaultSiswa = {
        username: "siswa",
        phone_number: "08987654321",
        full_name: "Budi Pratama",
        role: "SISWA",
      };
      localStorage.setItem("clickaset_user", JSON.stringify(defaultSiswa));
      setSuccess("Login Siswa default berhasil!");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
      return;
    }

    // Query from Supabase/Mock database
    const { data: users } = await supabase.from("users").select("*");
    const registeredUsers = users || [];

    const foundUser = registeredUsers.find(
      (u: any) =>
        (u.username.toLowerCase() === usernameOrPhone.toLowerCase() ||
          u.phone_number === usernameOrPhone) &&
        u.password === password
    );

    if (foundUser) {
      localStorage.setItem("clickaset_user", JSON.stringify(foundUser));
      setSuccess("Login berhasil! Mengalihkan...");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } else {
      setError("Username/Nomor HP atau kata sandi salah.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!resetUsername || !resetPhone || !newPassword) {
      setError("Semua kolom untuk reset wajib diisi.");
      return;
    }

    if (resetUsername === "guru" || resetUsername === "siswa") {
      setSuccess("Kata sandi default tidak dapat diubah, silakan langsung login.");
      setIsResetMode(false);
      return;
    }

    // Query from Supabase/Mock database
    const { data: users } = await supabase.from("users").select("*");
    const registeredUsers = users || [];

    const foundUser = registeredUsers.find(
      (u: any) =>
        u.username.toLowerCase() === resetUsername.toLowerCase() &&
        u.phone_number === resetPhone
    );

    if (foundUser) {
      await supabase
        .from("users")
        .update({ password: newPassword })
        .eq("id", foundUser.id);

      setSuccess("Kata sandi berhasil diperbarui! Silakan login.");
      setIsResetMode(false);
      setUsernameOrPhone(resetUsername);
      setPassword("");
    } else {
      setError("Kombinasi Username dan Nomor HP tidak terdaftar.");
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-boxdark-2 p-4 text-body">
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:p-8 max-w-md w-full">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="mb-6">
          <h2 className="font-heading font-semibold text-2xl text-black dark:text-white">
            {isResetMode ? "Atur Ulang Sandi" : "Masuk ClickAset"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isResetMode
              ? "Masukkan Username & No. HP terdaftar."
              : "Masukkan akun Guru atau Siswa Anda."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium">
            {success}
          </div>
        )}

        {isResetMode ? (
          /* Reset Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="w-4.5 h-4.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="Ketik username Anda"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 text-black outline-none transition focus:border-[#3C50E0] active:border-[#3C50E0] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#3C50E0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">Nomor HP</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="w-4.5 h-4.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value)}
                  placeholder="08xxxxxxxx"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 text-black outline-none transition focus:border-[#3C50E0] active:border-[#3C50E0] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#3C50E0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">Kata Sandi Baru</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4.5 h-4.5 text-gray-400" />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik kata sandi baru"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 text-black outline-none transition focus:border-[#3C50E0] active:border-[#3C50E0] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#3C50E0]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 mt-2 bg-[#3C50E0] hover:bg-opacity-90 text-white font-bold rounded text-sm transition-all shadow-md cursor-pointer"
            >
              Simpan Kata Sandi Baru
            </button>

            <button
              type="button"
              onClick={() => setIsResetMode(false)}
              className="w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mt-2 block cursor-pointer"
            >
              Batal
            </button>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Username / Nomor HP
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="w-4.5 h-4.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={usernameOrPhone}
                  onChange={(e) => setUsernameOrPhone(e.target.value)}
                  placeholder="Masukkan username atau nomor HP"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 text-black outline-none transition focus:border-[#3C50E0] active:border-[#3C50E0] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#3C50E0]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-black dark:text-white">Kata Sandi</label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-sm font-semibold text-[#3C50E0] hover:underline cursor-pointer"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4.5 h-4.5 text-gray-400" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 text-black outline-none transition focus:border-[#3C50E0] active:border-[#3C50E0] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#3C50E0]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 mt-2 bg-[#3C50E0] hover:bg-opacity-90 text-white font-bold rounded text-sm transition-all shadow-md cursor-pointer"
            >
              Masuk
            </button>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-stroke dark:border-strokedark">
              Belum punya akun?{" "}
              <Link to="/signup" className="text-[#3C50E0] hover:underline font-bold">
                Daftar Sekarang
              </Link>
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="bg-gray-100 dark:bg-form-input border border-stroke dark:border-form-strokedark rounded-xl p-3.5 mt-4 text-xs space-y-1.5">
              <p className="font-bold text-black dark:text-white uppercase tracking-wider">Demo Akses:</p>
              <div className="flex justify-between">
                <span>Guru: <b className="text-[#3C50E0] dark:text-[#68AEB8]">guru / guru</b></span>
                <span>Siswa: <b className="text-[#3C50E0] dark:text-[#68AEB8]">siswa / siswa</b></span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignIn;
