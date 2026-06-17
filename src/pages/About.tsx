import React from "react";
import { Award, Target, BookOpen, ShieldCheck } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Hero */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:p-8">
        <h2 className="font-heading font-semibold text-2xl text-black dark:text-white">
          Tentang ClickAset
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
          ClickAset adalah aplikasi pembelajaran akuntansi penyesuaian penyusutan aset tetap berbasis simulasi interaktif. Aplikasi ini dirancang untuk menjembatani kesenjangan antara teori akuntansi komersial (SAK) dan akuntansi fiskal (perpajakan) dengan cara yang menyenangkan, interaktif, dan gamifikasi.
        </p>
      </div>

      {/* Grid Outcomes & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capaian Pembelajaran */}
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center gap-3 border-b border-stroke dark:border-strokedark pb-4 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3C50E0]/10 dark:bg-meta-4 text-[#3C50E0]">
              <Award className="w-5 h-5 text-[#3C50E0]" />
            </div>
            <h3 className="font-heading font-bold text-lg text-black dark:text-white">
              Capaian Pembelajaran
            </h3>
          </div>
          <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-[#3C50E0]/10 text-[#3C50E0] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Membantu siswa memahami konsep penyusutan aset tetap secara komprehensif.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-[#3C50E0]/10 text-[#3C50E0] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Mempraktikkan alur proses akuntansi aset tetap secara nyata mulai dari perolehan hingga penjurnalan.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-[#3C50E0]/10 text-[#3C50E0] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Meningkatkan keterlibatan belajar siswa di kelas melalui kuis multiplayer yang kompetitif.</span>
            </li>
          </ul>
        </div>

        {/* Tujuan Aplikasi */}
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center gap-3 border-b border-stroke dark:border-strokedark pb-4 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3C50E0]/10 dark:bg-meta-4 text-[#3C50E0]">
              <Target className="w-5 h-5 text-[#3C50E0]" />
            </div>
            <h3 className="font-heading font-bold text-lg text-black dark:text-white">
              Tujuan Pembelajaran
            </h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex gap-2">
              <span className="text-[#3C50E0] font-bold">•</span>
              <span>Memahami konsep aset tetap & penyusutan.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#3C50E0] font-bold">•</span>
              <span>Mengidentifikasi golongan aset perpajakan.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#3C50E0] font-bold">•</span>
              <span>Memilih metode penyusutan SAK & Pajak.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#3C50E0] font-bold">•</span>
              <span>Menghitung beban penyusutan tahunan.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#3C50E0] font-bold">•</span>
              <span>Membuat entri jurnal penyesuaian yang seimbang.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Rangkuman Komparasi Regulasi */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke dark:border-strokedark pb-4 mb-6">
          <h3 className="font-heading font-bold text-lg text-black dark:text-white">
            Panduan Singkat Perbedaan Regulasi (SAK vs Pajak)
          </h3>
          <p className="text-xs text-gray-500 mt-1">Garis besar perbedaan cara pandang akuntansi komersial dan fiskal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded border border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4">
            <h4 className="font-heading font-semibold text-black dark:text-white flex items-center gap-2 mb-3">
              <BookOpen className="w-4.5 h-4.5 text-[#3C50E0]" />
              Ketentuan Akuntansi (SAK)
            </h4>
            <ul className="space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              <li>• Mendukung <strong className="text-gray-800 dark:text-white">5 metode utama</strong>: Garis Lurus, Saldo Menurun, Jumlah Angka Tahun, Satuan Jam Kerja, dan Satuan Hasil Produksi.</li>
              <li>• Mengakui taksiran <strong className="text-gray-800 dark:text-white">Nilai Sisa / Residu</strong> aset di akhir masa manfaat.</li>
              <li>• Penentuan masa manfaat didasarkan pada taksiran umur ekonomis riil perusahaan.</li>
              <li>• Penyusutan dihitung proporsional sejak aset siap digunakan.</li>
            </ul>
          </div>

          <div className="p-4 rounded border border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4">
            <h4 className="font-heading font-semibold text-black dark:text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4.5 h-4.5 text-[#3C50E0]" />
              Ketentuan Perpajakan (Fiskal)
            </h4>
            <ul className="space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              <li>• Hanya memperbolehkan <strong className="text-gray-800 dark:text-white">2 metode</strong>: Garis Lurus (semua aset) & Saldo Menurun (khusus non-bangunan).</li>
              <li>• <strong className="text-gray-800 dark:text-white">Nilai Residu Diabaikan</strong> (dianggap Rp0 di akhir masa manfaat fiskal).</li>
              <li>• Masa manfaat wajib mengikuti <strong className="text-gray-800 dark:text-white">Kelompok Harta Berwujud</strong> UU Pajak (Kelompok 1, 2, 3, 4, Bangunan).</li>
              <li>• Penyusutan fiskal dimulai sejak bulan dilakukannya pengeluaran perolehan aset.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
