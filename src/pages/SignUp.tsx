import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Phone, ArrowLeft } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { showLoading, hideLoading } from "../utils/loader";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"GURU" | "SISWA">("SISWA");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !phoneNumber || !fullName || !password) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    if (username.toLowerCase() === "guru" || username.toLowerCase() === "siswa") {
      setError("Username ini dilindungi, silakan gunakan username lain.");
      return;
    }

    showLoading("Mendaftarkan akun baru...");
    try {
      // Query existing users from database
      const { data: users } = await supabase.from("users").select("*");
      const registeredUsers = users || [];

      const isDuplicate = registeredUsers.some(
        (u: any) =>
          u.username.toLowerCase() === username.toLowerCase() ||
          u.phone_number === phoneNumber
      );

      if (isDuplicate) {
        setError("Username atau Nomor HP sudah terdaftar.");
        return;
      }

      const newUser = {
        username,
        phone_number: phoneNumber,
        full_name: fullName,
        password,
        role,
      };

      const { error: insertError } = await supabase.from("users").insert(newUser);

      if (insertError) {
        setError("Registrasi gagal: " + insertError.message);
        return;
      }

      setSuccess("Pendaftaran berhasil! Mengalihkan ke login...");
      setTimeout(() => {
        navigate("/signin");
      }, 1200);
    } catch (err: any) {
      setError("Koneksi gagal: " + err.message);
    } finally {
      hideLoading();
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-boxdark-2 p-4 text-body">
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:p-8 max-w-md w-full">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="mb-6">
          <h2 className="font-heading font-semibold text-2xl text-black dark:text-white">Daftar ClickAsset</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Buat akun untuk melacak progres kuis & materi Anda.
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

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Nama Lengkap</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="w-4.5 h-4.5 text-gray-400" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap Anda"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 text-black outline-none transition focus:border-[#3C50E0] active:border-[#3C50E0] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#3C50E0]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="w-4.5 h-4.5 text-gray-400" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ketik username unik"
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
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08xxxxxxxx"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 text-black outline-none transition focus:border-[#3C50E0] active:border-[#3C50E0] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#3C50E0]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-4.5 h-4.5 text-gray-400" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat kata sandi"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 text-black outline-none transition focus:border-[#3C50E0] active:border-[#3C50E0] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#3C50E0]"
              />
            </div>
          </div>

          {/* Role Choice */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Daftar Sebagai</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("SISWA")}
                className={`py-2 px-3 rounded border text-sm font-bold transition-all cursor-pointer ${
                  role === "SISWA"
                    ? "bg-[#3C50E0] text-white border-[#3C50E0]"
                    : "bg-gray-100 text-gray-500 border-stroke dark:bg-meta-4 dark:text-gray-400 dark:border-form-strokedark"
                }`}
              >
                Siswa
              </button>
              <button
                type="button"
                onClick={() => setRole("GURU")}
                className={`py-2 px-3 rounded border text-sm font-bold transition-all cursor-pointer ${
                  role === "GURU"
                    ? "bg-[#3C50E0] text-white border-[#3C50E0]"
                    : "bg-gray-100 text-gray-500 border-stroke dark:bg-meta-4 dark:text-gray-400 dark:border-form-strokedark"
                }`}
              >
                Guru Akuntansi
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 mt-4 bg-[#3C50E0] hover:bg-opacity-90 text-white font-bold rounded text-sm transition-all shadow-md cursor-pointer"
          >
            Daftar Akun
          </button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-stroke dark:border-strokedark">
            Sudah punya akun?{" "}
            <Link to="/signin" className="text-[#3C50E0] hover:underline font-bold">
              Masuk Disini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
