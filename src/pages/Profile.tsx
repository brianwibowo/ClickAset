import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Save, Camera, ShieldAlert, CheckCircle } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { showLoading, hideLoading } from "../utils/loader";

const uploadFile = async (file: File): Promise<string> => {
  if (supabase.storage) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `profile-avatars/${fileName}`;

      const { error } = await supabase.storage
        .from('materi-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('materi-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.warn("Supabase storage upload failed, falling back to Base64:", err);
    }
  }

  // Fallback: base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Form Bio States
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback States
  const [bioError, setBioError] = useState("");
  const [bioSuccess, setBioSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem("clickaset_user");
    if (!userJson) {
      navigate("/signin");
      return;
    }

    const userData = JSON.parse(userJson);
    setUser(userData);
    setFullName(userData.full_name || "");
    setUsername(userData.username || "");
    setPhoneNumber(userData.phone_number || "");
    const storedAvatar = localStorage.getItem("clickaset_avatar_" + userData.id) || "";
    setAvatarUrl(storedAvatar);
  }, [navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan!");
      return;
    }

    setUploading(true);
    setBioError("");
    setBioSuccess("");
    showLoading("Mengunggah foto profil...");

    try {
      const url = await uploadFile(file);
      setAvatarUrl(url);
      setBioSuccess("Foto profil berhasil dipilih. Klik 'Simpan Biodata' untuk menyimpan perubahan.");
    } catch (err) {
      console.error(err);
      setBioError("Gagal memproses foto profil.");
    } finally {
      setUploading(false);
      hideLoading();
    }
  };

  const handleUpdateBio = async (e: React.FormEvent) => {
    e.preventDefault();
    setBioError("");
    setBioSuccess("");

    if (!fullName || !username || !phoneNumber) {
      setBioError("Semua kolom biodata wajib diisi.");
      return;
    }

    setSavingBio(true);
    showLoading("Menyimpan biodata Anda...");

    try {
      // Check if username is taken (excluding current user)
      const { data: existingUsers } = await supabase
        .from("users")
        .select("*")
        .neq("id", user.id);

      const isTaken = (existingUsers || []).some(
        (u: any) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (isTaken) {
        setBioError("Username sudah terdaftar oleh pengguna lain.");
        setSavingBio(false);
        hideLoading();
        return;
      }

      // Update in database (Exclude avatar_url to prevent DB schema cache error)
      const updatedFields = {
        full_name: fullName,
        username: username,
        phone_number: phoneNumber,
      };

      const { error: updateError } = await supabase
        .from("users")
        .update(updatedFields)
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Save avatar to localStorage to bypass database schema limits
      if (avatarUrl) {
        localStorage.setItem("clickaset_avatar_" + user.id, avatarUrl);
      } else {
        localStorage.removeItem("clickaset_avatar_" + user.id);
      }

      // Update session local
      const updatedUser = {
        ...user,
        ...updatedFields
      };

      localStorage.setItem("clickaset_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setBioSuccess("Biodata berhasil diperbarui!");
      
      // Trigger header reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setBioError("Gagal menyimpan perubahan: " + (err.message || err));
    } finally {
      setSavingBio(false);
      hideLoading();
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Semua kolom kata sandi wajib diisi.");
      return;
    }

    if (currentPassword !== user.password) {
      setPwError("Kata sandi saat ini salah.");
      return;
    }

    if (newPassword.length < 6) {
      setPwError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setSavingPw(true);
    showLoading("Memperbarui kata sandi...");

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ password: newPassword })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local storage password
      const updatedUser = {
        ...user,
        password: newPassword
      };
      localStorage.setItem("clickaset_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setPwSuccess("Kata sandi berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setPwError("Gagal mengganti kata sandi: " + (err.message || err));
    } finally {
      setSavingPw(false);
      hideLoading();
    }
  };

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <span className="text-sm font-semibold animate-pulse text-gray-500">Memuat profil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-sm dark:bg-gray-950">
        <h2 className="font-heading font-semibold text-2xl text-gray-900 dark:text-white">
          Pengaturan Akun ⚙️
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Kelola informasi profil Anda, ubah avatar, dan perbarui kata sandi secara aman.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar display card */}
        <div className="lg:col-span-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-xs dark:bg-gray-955 flex flex-col items-center text-center space-y-4 h-fit">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-3xl flex items-center justify-center border-2 border-brand-500 shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg border border-white cursor-pointer transition transform hover:scale-110">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
            </label>
          </div>

          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">{fullName}</h3>
            <p className="text-xs text-gray-400 font-medium">@{username}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#3B919B]/10 text-[#3B919B] dark:bg-[#68AEB8]/10 dark:text-[#68AEB8] uppercase tracking-wider">
              {user.role}
            </span>
          </div>

          {uploading && (
            <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 animate-pulse">
              Mengunggah foto...
            </span>
          )}
        </div>

        {/* Right Column: Forms Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Bio Form */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-xs dark:bg-gray-955">
            <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white border-b border-gray-150 dark:border-gray-850 pb-3 mb-4">
              Biodata Pengguna
            </h3>

            {bioError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{bioError}</span>
              </div>
            )}

            {bioSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{bioSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateBio} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-brand-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-brand-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nomor Handphone</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-brand-500 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingBio || uploading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {savingBio ? "Menyimpan..." : "Simpan Biodata"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-xs dark:bg-gray-955">
            <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white border-b border-gray-150 dark:border-gray-850 pb-3 mb-4">
              Keamanan Kata Sandi
            </h3>

            {pwError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ketik kata sandi lama Anda"
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-brand-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-brand-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-brand-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPw}
                  className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition shadow-md cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {savingPw ? "Memperbarui..." : "Ubah Kata Sandi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
