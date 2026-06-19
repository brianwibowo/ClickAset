import React, { useState } from "react";
import { History, BookOpen, Award, Download, Trash2, PenLine, MessageCircle, Send, User } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

interface SimulationHistoryProps {
  user: any;
  historyList: any[];
  onLoadHistory: (item: any) => void;
  onDeleteHistory: (id: string) => void;
  downloadSimulationPDF: (data: any) => void;
  formatRupiah: (val: number) => string;
  golonganRules: any;
  onRefreshHistory: () => void;
  highlightedId?: string;
}

export const SimulationHistory: React.FC<SimulationHistoryProps> = ({
  user,
  historyList,
  onLoadHistory,
  onDeleteHistory,
  downloadSimulationPDF,
  formatRupiah,
  golonganRules,
  onRefreshHistory,
  highlightedId
}) => {
  const [selectedHistoryView, setSelectedHistoryView] = useState<any | null>(null);
  const [komentarInput, setKomentarInput] = useState<string>("");

  const HISTORIES_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    const maxPage = Math.ceil(historyList.length / HISTORIES_PER_PAGE);
    if (currentPage > maxPage) {
      setCurrentPage(Math.max(1, maxPage));
    }
  }, [historyList.length, currentPage]);

  const totalPages = Math.ceil(historyList.length / HISTORIES_PER_PAGE);
  const startIndex = (currentPage - 1) * HISTORIES_PER_PAGE;
  const paginatedHistory = historyList.slice(startIndex, startIndex + HISTORIES_PER_PAGE);

  const isGuru = user?.role === "GURU";

  const handleSelectAndLoad = (item: any) => {
    onLoadHistory(item);
    setSelectedHistoryView(null);
  };

  const handleAddKomentar = () => {
    if (!komentarInput.trim() || !selectedHistoryView || !user) return;

    const existingKomentar = selectedHistoryView.komentar || [];
    // Check limit: max 2 comments (1 guru + 1 siswa reply)
    if (existingKomentar.length >= 2) return;
    // Check role-based: guru can only comment if no guru comment exists, siswa can only reply if guru commented first
    const hasGuruComment = existingKomentar.some((k: any) => k.authorRole === "GURU");
    const hasSiswaReply = existingKomentar.some((k: any) => k.authorRole === "SISWA");
    if (isGuru && hasGuruComment) return;
    if (!isGuru && (!hasGuruComment || hasSiswaReply)) return;

    const newKomentar = {
      id: "komentar-" + Date.now(),
      authorName: user.full_name || user.username || (isGuru ? "Guru" : "Siswa"),
      authorRole: isGuru ? "GURU" : "SISWA",
      text: komentarInput.trim(),
      createdAt: new Date().toISOString()
    };

    // We need to find and update the item in the correct student's localStorage
    const targetStudentId = selectedHistoryView.studentId;
    if (targetStudentId) {
      const targetKey = `clickaset_sim_history_${targetStudentId}`;
      const localItemsJson = localStorage.getItem(targetKey);
      if (localItemsJson) {
        try {
          const items = JSON.parse(localItemsJson);
          const targetIdx = items.findIndex((it: any) => it.id === selectedHistoryView.id);
          if (targetIdx !== -1) {
            const updatedKomentar = [...(items[targetIdx].komentar || []), newKomentar];
            items[targetIdx].komentar = updatedKomentar;
            localStorage.setItem(targetKey, JSON.stringify(items));
          }
        } catch { /* skip */ }
      }
    }

    // Also update remote Supabase database
    const updateDb = async () => {
      const updatedKomentar = [...(selectedHistoryView.komentar || []), newKomentar];
      try {
        await supabase.from("simulation_history").update({ komentar: updatedKomentar }).eq("id", selectedHistoryView.id);
      } catch (err) {
        console.error("Gagal mengupdate komentar di database:", err);
      }
    };
    updateDb();

    // Update local modal view state and trigger refresh
    setSelectedHistoryView({
      ...selectedHistoryView,
      komentar: [...(selectedHistoryView.komentar || []), newKomentar]
    });
    setKomentarInput("");
    onRefreshHistory();
  };

  return (
    <>
      {/* RIWAYAT SIMULASI SECTION */}
      <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-2xl p-6 shadow-theme-md space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-900 pb-4">
          <div className="p-2 bg-brand-50 dark:bg-brand-950/30 text-brand-500 rounded-lg">
            <History className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white font-heading">
              {isGuru ? "Riwayat Simulasi Semua Siswa" : "Riwayat Simulasi Aset Anda"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isGuru
                ? "Lihat seluruh riwayat simulasi siswa, refleksi pembelajaran, dan berikan komentar."
                : "Pantau, muat kembali, atau unduh laporan PDF resmi dari simulasi siklus aset yang telah selesai."}
            </p>
          </div>
        </div>

        {user ? (
          historyList.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="inline-flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-400">
                <BookOpen className="size-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Belum Ada Riwayat</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Anda belum menyelesaikan simulasi siklus aset apa pun. Silakan selesaikan 6 tahap simulasi di atas hingga berhasil membuat Jurnal Penyesuaian Akhir Tahun untuk menyimpan riwayat baru secara otomatis.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className={`rounded-xl p-5 bg-gray-50/30 dark:bg-gray-900/10 space-y-4 hover:shadow-theme-xs transition-all flex flex-col justify-between ${
                      highlightedId === item.id 
                        ? "animate-pulse-outline ring-2 ring-brand-500/20" 
                        : "border border-gray-105 dark:border-gray-800"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">
                          {item.namaAset}
                        </h4>
                        <span className="text-[10px] text-gray-450 dark:text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>

                      {/* Show student name for guru */}
                      {isGuru && (item.studentName || item.studentUsername) && (
                        <div className="flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                          <User className="size-3" />
                          <span>
                            {item.studentName || "Siswa"}
                            {item.studentUsername ? ` (@${item.studentUsername})` : " (@tanpa-username)"}
                          </span>
                        </div>
                      )}

                      {/* Reflection badge */}
                      {item.refleksi && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                          <PenLine className="size-2.5" />
                          Refleksi terisi
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Perolehan:</span>
                        <span className="font-semibold text-right text-gray-700 dark:text-gray-300">
                          {formatRupiah(item.totalPerolehan)}
                        </span>

                        <span>Golongan Pajak:</span>
                        <span className="font-semibold text-right text-gray-700 dark:text-gray-300">
                          {golonganRules[item.selectedGolongan]?.name.split(" ")[0] || item.selectedGolongan}
                        </span>

                        <span>SAK Depr. (Thn 1):</span>
                        <span className="font-semibold text-right text-gray-700 dark:text-gray-300">
                          {formatRupiah(item.bebanSAKThn1)}
                        </span>

                        <span>Pajak Depr. (Thn 1):</span>
                        <span className="font-semibold text-right text-gray-700 dark:text-gray-300">
                          {formatRupiah(item.bebanPajakThn1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/80 text-xs">
                      <button
                        onClick={() => setSelectedHistoryView(item)}
                        className="flex-1 py-1.5 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-950/40 rounded-lg font-semibold transition cursor-pointer text-center"
                      >
                        Buka
                      </button>
                      <button
                        onClick={() => downloadSimulationPDF(item)}
                        className="flex-1 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Download className="size-3" />
                        PDF
                      </button>
                      <button
                        onClick={() => onDeleteHistory(item.id)}
                        className="p-1.5 border border-red-100 dark:border-red-955 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg transition cursor-pointer"
                        title="Hapus Riwayat"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls for histories */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <span className="text-gray-500 dark:text-gray-400 text-center sm:text-left">
                    Menampilkan <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}</span> - <span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(startIndex + HISTORIES_PER_PAGE, historyList.length)}</span> dari <span className="font-semibold text-gray-700 dark:text-gray-300">{historyList.length}</span> riwayat
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-200 dark:border-gray-805 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-650 dark:text-gray-350 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition font-semibold"
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
                      className="px-3 py-1.5 border border-gray-200 dark:border-gray-805 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-650 dark:text-gray-350 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition font-semibold"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-10 px-4 space-y-4 max-w-sm mx-auto">
            <div className="inline-flex items-center justify-center p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full">
              <Award className="size-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Riwayat Terkunci</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Silakan masuk/daftar akun terlebih dahulu untuk merekam, melihat riwayat simulasi, dan mengunduh laporan PDF resmi.
              </p>
            </div>
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("show-auth-modal", {
                    detail: { message: "Silakan masuk atau daftar terlebih dahulu untuk merekam riwayat simulasi." }
                  })
                );
              }}
              className="inline-block px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            >
              Masuk Sekarang
            </button>
          </div>
        )}
      </div>

      {/* RIWAYAT SIMULASI DETAIL VIEW MODAL */}
      {selectedHistoryView && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-950 border border-gray-205 dark:border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white font-heading">
                  Detail Laporan: {selectedHistoryView.namaAset}
                </h3>
                <p className="text-xs text-gray-500">
                  Riwayat simulasi diselesaikan pada {new Date(selectedHistoryView.timestamp).toLocaleString("id-ID")}
                </p>
                {isGuru && (selectedHistoryView.studentName || selectedHistoryView.studentUsername) && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 mt-1">
                    <User className="size-3.5" />
                    Siswa: {selectedHistoryView.studentName || "Siswa"} 
                    {selectedHistoryView.studentUsername ? ` (@${selectedHistoryView.studentUsername})` : " (@tanpa-username)"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedHistoryView(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-805 rounded-lg text-gray-405 hover:text-gray-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
              
              {/* 1. Rincian Aset */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-2">
                  <h4 className="font-bold text-brand-500 text-xs uppercase tracking-wider">
                    Informasi & Biaya Perolehan
                  </h4>
                  <div className="grid grid-cols-2 gap-y-1 text-xs">
                    <span>Nama Aset:</span>
                    <span className="font-semibold text-right">{selectedHistoryView.namaAset}</span>
                    <span>Tanggal Perolehan:</span>
                    <span className="font-semibold text-right">{selectedHistoryView.tanggalBeli}</span>
                    <span>Harga Beli:</span>
                    <span className="font-semibold text-right">{formatRupiah(selectedHistoryView.hargaBeli)}</span>
                    <span>Biaya Kirim:</span>
                    <span className="font-semibold text-right">{formatRupiah(selectedHistoryView.biayaKirim)}</span>
                    <span>Biaya BBN / Instalasi:</span>
                    <span className="font-semibold text-right">{formatRupiah(selectedHistoryView.biayaBbn)}</span>
                    <span className="font-bold text-gray-800 dark:text-white mt-1">Total Perolehan:</span>
                    <span className="font-bold text-right text-brand-500 mt-1">{formatRupiah(selectedHistoryView.totalPerolehan)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-2">
                  <h4 className="font-bold text-brand-500 text-xs uppercase tracking-wider">
                    Kebijakan Depresiasi (SAK vs Pajak)
                  </h4>
                  <div className="grid grid-cols-2 gap-y-1 text-xs">
                    <span>Metode Akuntansi (SAK):</span>
                    <span className="font-semibold text-right">
                      {selectedHistoryView.metodeSAK === "GL" && "Garis Lurus"}
                      {selectedHistoryView.metodeSAK === "SM" && "Saldo Menurun Ganda"}
                      {selectedHistoryView.metodeSAK === "JAT" && "Jumlah Angka Tahun"}
                      {selectedHistoryView.metodeSAK === "SJK" && "Satuan Jam Kerja"}
                      {selectedHistoryView.metodeSAK === "SHP" && "Satuan Hasil Produksi"}
                      {!["GL", "SM", "JAT", "SJK", "SHP"].includes(selectedHistoryView.metodeSAK) && selectedHistoryView.metodeSAK}
                    </span>
                    <span>Masa Manfaat (SAK):</span>
                    <span className="font-semibold text-right">{selectedHistoryView.masaManfaatSAK} Tahun</span>
                    <span>Nilai Residu (SAK):</span>
                    <span className="font-semibold text-right">{formatRupiah(selectedHistoryView.nilaiResiduSAK)}</span>

                    {selectedHistoryView.metodeSAK === "SJK" && (
                      <>
                        <span>Total Jam Kerja:</span>
                        <span className="font-semibold text-right text-brand-600 dark:text-brand-400">
                          {new Intl.NumberFormat("id-ID").format(selectedHistoryView.totalKapasitasJam || 20000)} Jam
                        </span>
                        {selectedHistoryView.jamKerjaPerTahun && selectedHistoryView.jamKerjaPerTahun.length > 0 && (
                          <>
                            <span className="col-span-2 text-xs text-gray-500 dark:text-gray-400 mt-1 pl-2 border-l border-gray-200 dark:border-gray-800 leading-relaxed">
                              Detail Jam/Tahun: {selectedHistoryView.jamKerjaPerTahun.map((val: number, idx: number) => `Thn ${idx+1}: ${new Intl.NumberFormat("id-ID").format(val)}`).join(", ")}
                            </span>
                          </>
                        )}
                      </>
                    )}
                    {selectedHistoryView.metodeSAK === "SHP" && (
                      <>
                        <span>Total Produksi:</span>
                        <span className="font-semibold text-right text-brand-600 dark:text-brand-400">
                          {new Intl.NumberFormat("id-ID").format(selectedHistoryView.totalKapasitasProduksi || 50000)} Unit
                        </span>
                        {selectedHistoryView.produksiPerTahun && selectedHistoryView.produksiPerTahun.length > 0 && (
                          <>
                            <span className="col-span-2 text-xs text-gray-500 dark:text-gray-400 mt-1 pl-2 border-l border-gray-200 dark:border-gray-800 leading-relaxed">
                              Detail Unit/Tahun: {selectedHistoryView.produksiPerTahun.map((val: number, idx: number) => `Thn ${idx+1}: ${new Intl.NumberFormat("id-ID").format(val)}`).join(", ")}
                            </span>
                          </>
                        )}
                      </>
                    )}

                    <span>Golongan Pajak:</span>
                    <span className="font-semibold text-right">{golonganRules[selectedHistoryView.selectedGolongan]?.name || selectedHistoryView.selectedGolongan}</span>
                    <span>Masa Manfaat Pajak:</span>
                    <span className="font-semibold text-right">{golonganRules[selectedHistoryView.selectedGolongan]?.years || 8} Tahun</span>
                    <span>Metode Pajak:</span>
                    <span className="font-semibold text-right">{selectedHistoryView.metodePajak === "GL" ? "Garis Lurus" : "Saldo Menurun"}</span>
                  </div>
                </div>
              </div>

              {/* 2. Jurnal Penyesuaian */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-3">
                <h4 className="font-bold text-brand-500 text-xs uppercase tracking-wider">
                  Jurnal Penyesuaian Akhir Tahun Ke-1
                </h4>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300">
                      <tr>
                        <th className="p-2 pl-4">Akun</th>
                        <th className="p-2 text-center">Ref</th>
                        <th className="p-2 text-right pr-4">Debit</th>
                        <th className="p-2 text-right pr-4">Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-855 font-medium">
                      <tr>
                        <td className="p-2 pl-4 text-gray-800 dark:text-white">Beban Penyusutan Aset Tetap</td>
                        <td className="p-2 text-center text-gray-500">5-101</td>
                        <td className="p-2 text-right pr-4 text-gray-800 dark:text-white">{formatRupiah(selectedHistoryView.bebanSAKThn1)}</td>
                        <td className="p-2 text-right pr-4 text-gray-400">-</td>
                      </tr>
                      <tr>
                        <td className="p-2 pl-8 text-gray-800 dark:text-white">Akumulasi Penyusutan Aset Tetap</td>
                        <td className="p-2 text-center text-gray-500">1-201</td>
                        <td className="p-2 text-right pr-4 text-gray-450">-</td>
                        <td className="p-2 text-right pr-4 text-gray-800 dark:text-white">{formatRupiah(selectedHistoryView.bebanSAKThn1)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Comparative Schedule Table */}
              {selectedHistoryView.tabelSAK && selectedHistoryView.tabelSAK.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-3">
                  <h4 className="font-bold text-brand-500 text-xs uppercase tracking-wider">
                    Jadwal Penyusutan Komparatif (Tahun ke-1 s/d selesai)
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="p-2 text-center">Tahun</th>
                          <th className="p-2 text-right">Beban Akuntansi (SAK)</th>
                          <th className="p-2 text-right">Nilai Buku SAK</th>
                          <th className="p-2 text-right">Beban Pajak (Fiskal)</th>
                          <th className="p-2 text-right pr-4">Nilai Buku Pajak</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {Array.from({ length: Math.max(selectedHistoryView.tabelSAK.length, selectedHistoryView.tabelPajak?.length || 0) }).map((_, idx) => {
                          const sakRowObj = selectedHistoryView.tabelSAK?.[idx];
                          const pajakRowObj = selectedHistoryView.tabelPajak?.[idx];
                          return (
                            <tr key={idx} className="hover:bg-gray-100/50 dark:hover:bg-gray-800/20 font-medium text-xs">
                              <td className="p-2 text-center text-gray-500">Tahun {idx + 1}</td>
                              <td className="p-2 text-right text-gray-800 dark:text-gray-300">{sakRowObj ? formatRupiah(sakRowObj.beban) : "-"}</td>
                              <td className="p-2 text-right text-brand-600 dark:text-brand-400 font-semibold">{sakRowObj ? formatRupiah(sakRowObj.nilaiBuku) : "-"}</td>
                              <td className="p-2 text-right text-gray-800 dark:text-gray-300">{pajakRowObj ? formatRupiah(pajakRowObj.beban) : "-"}</td>
                              <td className="p-2 text-right pr-4 text-emerald-600 dark:text-emerald-400 font-semibold">{pajakRowObj ? formatRupiah(pajakRowObj.nilaiBuku) : "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Refleksi Pembelajaran */}
              <div className="bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-3">
                <h4 className="font-bold text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <PenLine className="size-3.5" />
                  Refleksi Pembelajaran
                </h4>
                {selectedHistoryView.refleksi ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-gray-900/60 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                      {selectedHistoryView.refleksi.text}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Ditulis pada {new Date(selectedHistoryView.refleksi.submittedAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Siswa belum mengisi refleksi untuk simulasi ini.
                  </p>
                )}
              </div>

              {/* 5. Komentar / Umpan Balik */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-4">
                <h4 className="font-bold text-brand-500 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="size-3.5" />
                  Komentar & Umpan Balik
                </h4>

                {/* Existing comments */}
                {(selectedHistoryView.komentar && selectedHistoryView.komentar.length > 0) ? (
                  <div className="space-y-3">
                    {selectedHistoryView.komentar.map((k: any) => (
                      <div
                        key={k.id}
                        className={`p-3 rounded-xl text-sm space-y-1 ${
                          k.authorRole === "GURU"
                            ? "bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/50"
                            : "bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 ml-4"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            k.authorRole === "GURU"
                              ? "bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}>
                            {k.authorRole === "GURU" ? "Guru" : "Siswa"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {k.authorName} • {new Date(k.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {k.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Belum ada komentar.
                  </p>
                )}

                {/* Comment input */}
                {(() => {
                  const existingKomentar = selectedHistoryView.komentar || [];
                  const hasGuruComment = existingKomentar.some((k: any) => k.authorRole === "GURU");
                  const hasSiswaReply = existingKomentar.some((k: any) => k.authorRole === "SISWA");
                  const canComment =
                    (isGuru && !hasGuruComment) ||
                    (!isGuru && hasGuruComment && !hasSiswaReply);

                  if (!canComment || existingKomentar.length >= 2) return null;

                  return (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={komentarInput}
                        onChange={(e) => setKomentarInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddKomentar(); }}
                        placeholder={isGuru ? "Tulis komentar/umpan balik untuk siswa..." : "Balas komentar guru..."}
                        className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition"
                      />
                      <button
                        onClick={handleAddKomentar}
                        disabled={!komentarInput.trim()}
                        className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                      >
                        <Send className="size-3" />
                        Kirim
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 text-xs">
              {!isGuru && (
                <button
                  onClick={() => handleSelectAndLoad(selectedHistoryView)}
                  className="w-full sm:w-auto px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition cursor-pointer"
                >
                  Gunakan Parameter di Simulator
                </button>
              )}
              <div className={`flex gap-2 w-full sm:w-auto ${isGuru ? "justify-between w-full" : "justify-end"}`}>
                <button
                  onClick={() => setSelectedHistoryView(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => downloadSimulationPDF(selectedHistoryView)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="size-4" />
                  Unduh PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
