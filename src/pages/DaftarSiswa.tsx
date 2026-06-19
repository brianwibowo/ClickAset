import React, { useState, useEffect } from "react";
import { Users, Search, User, Phone, ShieldAlert, History, BookOpen } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { showLoading, hideLoading } from "../utils/loader";

const DaftarSiswa: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Pagination states
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Sub-modal for viewing a student's history
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<{ student: any; history: any[] } | null>(null);

  // Sub-modal for viewing student profile biodata
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any | null>(null);

  const userJson = localStorage.getItem("clickaset_user");
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isGuru = currentUser?.role === "GURU";

  useEffect(() => {
    if (isGuru) {
      fetchStudents();
    }
  }, [isGuru]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    showLoading("Memuat daftar siswa...");
    try {
      const { data, error: dbError } = await supabase.from("users").select("*");
      if (dbError) throw dbError;

      const studentList = (data || []).filter((u: any) => u.role === "SISWA");
      // Sort alphabetically by full name
      studentList.sort((a: any, b: any) => a.full_name.localeCompare(b.full_name));
      setStudents(studentList);
    } catch (err: any) {
      setError("Gagal memuat daftar siswa: " + err.message);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleOpenHistory = async (student: any) => {
    showLoading(`Memuat riwayat simulasi ${student.full_name}...`);
    let foundHistory: any[] = [];

    // 1. Fetch from Supabase remote database
    try {
      const { data: dbHist, error: dbErr } = await supabase
        .from("simulation_history")
        .select("*")
        .eq("studentId", student.id);
      if (!dbErr && dbHist) {
        foundHistory = dbHist;
      }
    } catch (e) {
      console.warn("Gagal memuat riwayat siswa dari database:", e);
    }

    // 2. Scan local storage for offline items on the current device to merge
    const historyKeys = [
      `clickaset_sim_history_${student.id}`,
      `clickaset_sim_history_${student.username}`,
      `clickaset_sim_history_${student.username.toLowerCase()}`
    ];

    const localHistory: any[] = [];
    for (const key of historyKeys) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            localHistory.push(...parsed);
          }
        } catch { /* skip */ }
      }
    }

    const combinedMap: Record<string, any> = {};
    localHistory.forEach((item: any) => {
      combinedMap[item.id] = item;
    });
    foundHistory.forEach((item: any) => {
      combinedMap[item.id] = item;
    });

    const finalHistory = Object.values(combinedMap);
    finalHistory.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    hideLoading();
    setSelectedStudentHistory({
      student,
      history: finalHistory
    });
  };

  if (!isGuru) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full">
          <ShieldAlert className="size-12" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white font-heading">Akses Ditolak</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Halaman ini hanya dapat diakses oleh akun Guru. Silakan masuk sebagai Guru untuk melihat daftar siswa terdaftar.
        </p>
      </div>
    );
  }

  // Filter students based on search query
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.username || "").toLowerCase().includes(q) ||
      (s.phone_number || "").includes(q)
    );
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-md dark:bg-gray-955 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 dark:bg-brand-950/30 text-brand-500 rounded-xl">
              <Users className="size-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-gray-855 dark:text-white">
                Daftar Siswa Terdaftar
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kelola dan pantau seluruh siswa yang terdaftar dalam sistem pembelajaran ClickAsset.
              </p>
            </div>
          </div>
          
          <div className="bg-brand-50/50 dark:bg-brand-950/10 px-4 py-2 rounded-xl border border-brand-100/50 dark:border-brand-900/20 text-center sm:text-right shrink-0">
            <span className="block text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">Total Siswa</span>
            <span className="text-xl font-bold text-brand-550 dark:text-brand-300 font-heading">{students.length} Orang</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white shadow-theme-md dark:bg-gray-955 p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="size-4" />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, username, atau nomor HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-705 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition"
            />
          </div>

          <button
            onClick={fetchStudents}
            className="w-full sm:w-auto px-4 py-2 border border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Segarkan Data
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Memuat data siswa dari sistem...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <div className="inline-flex p-3 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-400">
              <Users className="size-8" />
            </div>
            <h4 className="text-sm font-semibold text-gray-855 dark:text-white">Tidak Ada Hasil</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tidak ada data siswa yang cocok dengan kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Responsive Table Container */}
            <div className="border border-gray-150 dark:border-gray-800 rounded-xl overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-gray-600 dark:text-gray-350">
                <thead className="bg-gray-50 dark:bg-gray-900 font-semibold text-gray-700 dark:text-gray-305 border-b border-gray-150 dark:border-gray-800">
                  <tr>
                    <th className="p-4 pl-6 text-xs uppercase tracking-wider w-16">No</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Nama Lengkap</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Username</th>
                    <th className="p-4 text-xs uppercase tracking-wider">Nomor HP</th>
                    <th className="p-4 text-xs uppercase tracking-wider pr-6 text-center w-52">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-855">
                  {paginatedStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition">
                      <td className="p-4 pl-6 font-medium text-gray-400">{startIndex + idx + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
                            <User className="size-4" />
                          </div>
                          <span className="font-semibold text-gray-800 dark:text-white">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800/80 px-2 py-1 rounded text-brand-650 dark:text-brand-400">
                          @{student.username}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {student.phone_number ? (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3 text-gray-400" />
                            {student.phone_number}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Tidak tersedia</span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedStudentProfile(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition cursor-pointer"
                            title="Lihat Detail Profil Siswa"
                          >
                            <User className="size-3.5" />
                            Profil
                          </button>
                          <button
                            onClick={() => handleOpenHistory(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs font-semibold rounded-lg transition cursor-pointer"
                            title="Lihat Riwayat Simulasi Siswa"
                          >
                            <History className="size-3.5" />
                            Riwayat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs">
                <span className="text-gray-500 dark:text-gray-400 order-2 sm:order-1 text-center sm:text-left">
                  Menampilkan <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}</span> - <span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(startIndex + ITEMS_PER_PAGE, filteredStudents.length)}</span> dari <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredStudents.length}</span> siswa
                </span>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-705 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-650 dark:text-gray-350 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition font-semibold"
                  >
                    Sebelumnya
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, pageIdx) => {
                      const pageNum = pageIdx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-brand-500 text-white"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-650 dark:text-gray-350"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-705 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-650 dark:text-gray-350 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition font-semibold"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STUDENT HISTORY PREVIEW MODAL */}
      {selectedStudentHistory && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-955 border border-gray-205 dark:border-gray-850 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-855 dark:text-white font-heading">
                  Riwayat Simulasi Siswa
                </h3>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 mt-1">
                  <User className="size-3.5" />
                  {selectedStudentHistory.student.full_name} (@{selectedStudentHistory.student.username})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentHistory(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-805 rounded-lg text-gray-405 hover:text-gray-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {selectedStudentHistory.history.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-2 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <BookOpen className="size-8 text-gray-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-gray-855 dark:text-white">Tidak Ada Riwayat</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Siswa ini belum memiliki riwayat simulasi yang tersimpan di database global maupun peramban perangkat ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Daftar simulasi yang diselesaikan oleh siswa (sinkron dari cloud & perangkat lokal):
                  </p>
                  {selectedStudentHistory.history.map((item: any) => (
                    <div 
                      key={item.id} 
                      className="border border-gray-200 dark:border-gray-805 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-900/20 space-y-2 text-xs text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-855 dark:text-white text-sm">{item.namaAset}</span>
                        <span className="text-[10px] text-gray-405">
                          {new Date(item.timestamp).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-1">
                        <span>Metode SAK:</span>
                        <span className="font-semibold text-right text-gray-800 dark:text-gray-200">
                          {item.metodeSAK === "GL" ? "Garis Lurus" : item.metodeSAK}
                        </span>
                        <span>Masa Manfaat / Residu:</span>
                        <span className="font-semibold text-right text-gray-800 dark:text-gray-200">
                          {item.masaManfaatSAK} Thn / {formatRupiah(item.nilaiResiduSAK)}
                        </span>
                        <span>Total Perolehan:</span>
                        <span className="font-bold text-right text-brand-650 dark:text-brand-400">
                          {formatRupiah(item.totalPerolehan)}
                        </span>
                      </div>

                      {item.refleksi && (
                        <div className="mt-2 bg-amber-50/50 dark:bg-amber-950/10 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30 text-[11px]">
                          <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">Refleksi:</span>
                          <span className="text-gray-700 dark:text-gray-300 italic">"{item.refleksi.text}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-gray-150 dark:border-gray-800 pt-4">
              <button
                onClick={() => setSelectedStudentHistory(null)}
                className="px-4 py-2 bg-gray-105 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STUDENT PROFILE VIEW MODAL */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-955 border border-gray-205 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-center relative text-gray-900 dark:text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudentProfile(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-650 transition cursor-pointer"
            >
              ✕
            </button>

            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center space-y-3 pt-4">
              {(() => {
                const storedAvatar = localStorage.getItem("clickaset_avatar_" + selectedStudentProfile.id) || "";
                if (storedAvatar) {
                  return (
                    <img
                      src={storedAvatar}
                      alt={selectedStudentProfile.full_name}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/20 shadow-md"
                    />
                  );
                } else {
                  const initial = (selectedStudentProfile.full_name || "S").charAt(0).toUpperCase();
                  return (
                    <div className="w-24 h-24 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-heading text-4xl font-extrabold shadow-inner border border-brand-500/20">
                      {initial}
                    </div>
                  );
                }
              })()}
              
              <div>
                <h3 className="text-lg font-bold text-gray-850 dark:text-white font-heading">
                  {selectedStudentProfile.full_name}
                </h3>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                  @{selectedStudentProfile.username}
                </span>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Nomor HP</span>
                <span className="font-semibold text-gray-850 dark:text-gray-200">
                  {selectedStudentProfile.phone_number || "Tidak tersedia"}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800/60 pt-2">
                <span className="text-gray-400">Peran Akun</span>
                <span className="px-2 py-0.5 bg-gray-150 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-semibold text-[10px]">
                  {selectedStudentProfile.role}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-gray-100 dark:border-gray-800/60 pt-2">
                <span className="text-gray-400 text-left">ID Pengguna</span>
                <span className="font-mono text-[10px] text-gray-650 dark:text-gray-300 break-all bg-gray-100 dark:bg-gray-900/60 p-2 rounded-lg select-all text-center">
                  {selectedStudentProfile.id}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setSelectedStudentProfile(null)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const student = selectedStudentProfile;
                  setSelectedStudentProfile(null);
                  handleOpenHistory(student);
                }}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
              >
                <History className="size-3.5" />
                Lihat Riwayat
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarSiswa;
