import React, { useEffect, useRef } from "react";
import { ReflectionForm } from "./ReflectionForm";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  Building2,
  Play,
  Check,
  Info,
  BookOpen,
  Award,
  Download,
  Laptop,
  Printer,
  Smartphone,
  Car,
  Bike,
  Warehouse,
  Armchair,
  Settings,
  Package
} from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minDate?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Pilih tanggal...",
  minDate
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpInstance = useRef<any>(null);

  useEffect(() => {
    if (inputRef.current) {
      fpInstance.current = flatpickr(inputRef.current, {
        dateFormat: "Y-m-d",
        defaultDate: value || undefined,
        minDate: minDate || undefined,
        onChange: (_, dateStr) => {
          onChange(dateStr);
        },
        locale: {
          firstDayOfWeek: 1,
          weekdays: {
            shorthand: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
            longhand: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
          },
          months: {
            shorthand: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"],
            longhand: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
          }
        }
      });
    }

    return () => {
      if (fpInstance.current) {
        fpInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (fpInstance.current) {
      fpInstance.current.setDate(value, false);
    }
  }, [value]);

  useEffect(() => {
    if (fpInstance.current && minDate) {
      fpInstance.current.set("minDate", minDate);
    }
  }, [minDate]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition cursor-pointer"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
        <Calendar className="size-4" />
      </div>
    </div>
  );
};

const getAssetIcon = (name: string, sizeClass = "size-6") => {
  const n = name.toLowerCase();
  if (n.includes("komputer") || n.includes("laptop") || n.includes("pc") || n.includes("notebook") || n.includes("komp") || n.includes("asus") || n.includes("macbook")) {
    return <Laptop className={sizeClass} />;
  }
  if (n.includes("printer") || n.includes("scanner") || n.includes("copier") || n.includes("print")) {
    return <Printer className={sizeClass} />;
  }
  if (n.includes("hp") || n.includes("handphone") || n.includes("smartphone") || n.includes("telepon") || n.includes("tablet") || n.includes("android") || n.includes("iphone")) {
    return <Smartphone className={sizeClass} />;
  }
  if (n.includes("mobil") || n.includes("car") || n.includes("avanza") || n.includes("innova") || n.includes("sedan") || n.includes("pajero")) {
    return <Car className={sizeClass} />;
  }
  if (n.includes("motor") || n.includes("sepeda") || n.includes("bike") || n.includes("honda") || n.includes("yamaha")) {
    return <Bike className={sizeClass} />;
  }
  if (n.includes("gedung") || n.includes("bangunan") || n.includes("ruko") || n.includes("kantor") || n.includes("rumah")) {
    return <Building2 className={sizeClass} />;
  }
  if (n.includes("pabrik") || n.includes("gudang") || n.includes("warehouse")) {
    return <Warehouse className={sizeClass} />;
  }
  if (n.includes("kursi") || n.includes("meja") || n.includes("lemari") || n.includes("sofa") || n.includes("furniture") || n.includes("mebel") || n.includes("rak")) {
    return <Armchair className={sizeClass} />;
  }
  if (n.includes("mesin") || n.includes("generator") || n.includes("mesin pabrik") || n.includes("alat berat") || n.includes("excavator") || n.includes("traktor") || n.includes("kompresor")) {
    return <Settings className={sizeClass} />;
  }
  return <Package className={sizeClass} />;
};

export interface SAKRow {
  year: number;
  months: number;
  hargaPerolehan: number;
  beban: number;
  akumulasi: number;
  nilaiBuku: number;
  volume?: number;
}

export interface PajakRow {
  year: number;
  months: number;
  hargaPerolehan: number;
  beban: number;
  akumulasi: number;
  nilaiBuku: number;
}

export interface ChartDataPoint {
  year: number;
  "SAK Nilai Buku": number;
  "Pajak Nilai Buku": number;
}

interface SimulationStepsProps {
  step: number;
  setStep: (step: number) => void;

  // Step 1
  namaAset: string;
  setNamaAset: (name: string) => void;
  tanggalBeli: string;
  setTanggalBeli: (date: string) => void;
  hargaBeli: number;
  setHargaBeli: (val: number) => void;
  biayaKirim: number;
  setBiayaKirim: (val: number) => void;
  biayaBbn: number;
  setBiayaBbn: (val: number) => void;
  totalPerolehan: number;
  hargaBeliInput: string;
  setHargaBeliInput: (val: string) => void;
  biayaKirimInput: string;
  setBiayaKirimInput: (val: string) => void;
  biayaBbnInput: string;
  setBiayaBbnInput: (val: string) => void;
  isTruckMoving: boolean;
  truckDone: boolean;
  runPurchaseSimulation: () => void;

  // Step 2
  tanggalPakai: string;
  setTanggalPakai: (date: string) => void;
  tanggalMulaiSusut: string;
  setTanggalMulaiSusut: (date: string) => void;

  // Step 3
  selectedGolongan: string;
  hasAttemptedGolongan: boolean;
  golonganFeedback: { isCorrect: boolean; text: string } | null;
  handleGuessGolongan: (key: any) => void;

  // Step 4
  metodeSAK: "GL" | "SM" | "JAT" | "SJK" | "SHP";
  setMetodeSAK: (metode: "GL" | "SM" | "JAT" | "SJK" | "SHP") => void;
  metodePajak: "GL" | "SM";
  setMetodePajak: (metode: "GL" | "SM") => void;
  nilaiResiduSAK: number;
  setNilaiResiduSAK: (val: number) => void;
  masaManfaatSAK: number;
  setMasaManfaatSAK: (val: number) => void;
  nilaiResiduSAKInput: string;
  setNilaiResiduSAKInput: (val: string) => void;

  totalKapasitasJam: number;
  setTotalKapasitasJam: (val: number) => void;
  totalKapasitasJamInput: string;
  setTotalKapasitasJamInput: (val: string) => void;
  jamTahun1: number;
  setJamTahun1: (val: number) => void;
  jamTahun1Input: string;
  setJamTahun1Input: (val: string) => void;

  totalKapasitasProduksi: number;
  setTotalKapasitasProduksi: (val: number) => void;
  totalKapasitasProduksiInput: string;
  setTotalKapasitasProduksiInput: (val: string) => void;
  produksiTahun1: number;
  setProduksiTahun1: (val: number) => void;
  produksiTahun1Input: string;
  setProduksiTahun1Input: (val: string) => void;

  jamKerjaPerTahun: number[];
  setJamKerjaPerTahun: (val: number[]) => void;
  jamKerjaPerTahunInput: string[];
  setJamKerjaPerTahunInput: (val: string[]) => void;
  produksiPerTahun: number[];
  setProduksiPerTahun: (val: number[]) => void;
  produksiPerTahunInput: string[];
  setProduksiPerTahunInput: (val: string[]) => void;

  // Step 5
  tabelSAK: SAKRow[];
  tabelPajak: PajakRow[];
  chartData: ChartDataPoint[];
  activeTabTable: "SAK" | "Pajak";
  setActiveTabTable: (tab: "SAK" | "Pajak") => void;

  // Step 6
  jurnalDebitAkun: string;
  setJurnalDebitAkun: (val: string) => void;
  jurnalDebitNilai: string;
  setJurnalDebitNilai: (val: string) => void;
  jurnalKreditAkun: string;
  setJurnalKreditAkun: (val: string) => void;
  jurnalKreditNilai: string;
  setJurnalKreditNilai: (val: string) => void;
  journalAttempt: boolean;
  journalSuccess: boolean;
  journalFeedback: string;
  confettiParticles: any[];
  handleVerifyJournal: () => void;
  downloadSimulationPDF: (data: any) => void;
  handleResetAll: () => void;

  // Reflection
  refleksiSaved: boolean;
  onSaveReflection: (text: string) => void;

  // Helpers
  formatRupiah: (val: number) => string;
  formatRibuan: (val: number | string) => string;
  golonganRules: any;
}

export const SimulationSteps: React.FC<SimulationStepsProps> = ({
  step,
  setStep,
  namaAset,
  setNamaAset,
  tanggalBeli,
  setTanggalBeli,
  hargaBeli,
  setHargaBeli,
  biayaKirim,
  setBiayaKirim,
  biayaBbn,
  setBiayaBbn,
  totalPerolehan,
  hargaBeliInput,
  setHargaBeliInput,
  biayaKirimInput,
  setBiayaKirimInput,
  biayaBbnInput,
  setBiayaBbnInput,
  isTruckMoving,
  runPurchaseSimulation,
  truckDone,
  tanggalPakai,
  setTanggalPakai,
  tanggalMulaiSusut,
  setTanggalMulaiSusut,
  selectedGolongan,
  hasAttemptedGolongan,
  golonganFeedback,
  handleGuessGolongan,
  metodeSAK,
  setMetodeSAK,
  metodePajak,
  setMetodePajak,
  nilaiResiduSAK,
  setNilaiResiduSAK,
  masaManfaatSAK,
  setMasaManfaatSAK,
  nilaiResiduSAKInput,
  setNilaiResiduSAKInput,
  totalKapasitasJam,
  jamTahun1,
  totalKapasitasProduksi,
  produksiTahun1,
  jamKerjaPerTahun,
  setJamKerjaPerTahun,
  jamKerjaPerTahunInput,
  setJamKerjaPerTahunInput,
  produksiPerTahun,
  setProduksiPerTahun,
  produksiPerTahunInput,
  setProduksiPerTahunInput,
  tabelSAK,
  tabelPajak,
  chartData,
  activeTabTable,
  setActiveTabTable,
  jurnalDebitAkun,
  setJurnalDebitAkun,
  jurnalDebitNilai,
  setJurnalDebitNilai,
  jurnalKreditAkun,
  setJurnalKreditAkun,
  jurnalKreditNilai,
  setJurnalKreditNilai,
  journalAttempt,
  journalSuccess,
  journalFeedback,
  confettiParticles,
  handleVerifyJournal,
  downloadSimulationPDF,
  handleResetAll,
  formatRupiah,
  formatRibuan,
  golonganRules,
  refleksiSaved,
  onSaveReflection
}) => {
  // Helper formulas for step 5 tooltips
  const getBebanFormulaSAK = (row: SAKRow, idx: number) => {
    const prevBv = idx === 0 ? totalPerolehan : tabelSAK[idx - 1].nilaiBuku;
    switch (metodeSAK) {
      case "GL":
        return `(${formatRupiah(totalPerolehan)} - ${formatRupiah(nilaiResiduSAK)}) / ${masaManfaatSAK} Tahun`;
      case "SM":
        return `${formatRupiah(prevBv)} * ${((2 / masaManfaatSAK) * 100).toFixed(1)}%`;
      case "JAT": {
        const sumDigits = (masaManfaatSAK * (masaManfaatSAK + 1)) / 2;
        const digitsLeft = masaManfaatSAK - idx;
        return `(${formatRupiah(totalPerolehan)} - ${formatRupiah(nilaiResiduSAK)}) * ${digitsLeft} / ${sumDigits}`;
      }
      case "SJK": {
        const hrs = row.volume !== undefined ? row.volume : Math.round(row.beban / (((totalPerolehan - nilaiResiduSAK) / (totalKapasitasJam || 1)) || 1));
        return `(${formatRupiah(totalPerolehan)} - ${formatRupiah(nilaiResiduSAK)}) * ${formatRibuan(hrs)} Jam / ${formatRibuan(totalKapasitasJam)} Jam`;
      }
      case "SHP": {
        const units = row.volume !== undefined ? row.volume : Math.round(row.beban / (((totalPerolehan - nilaiResiduSAK) / (totalKapasitasProduksi || 1)) || 1));
        return `(${formatRupiah(totalPerolehan)} - ${formatRupiah(nilaiResiduSAK)}) * ${formatRibuan(units)} Unit / ${formatRibuan(totalKapasitasProduksi)} Unit`;
      }
      default:
        return "";
    }
  };

  const getAkumulasiFormulaSAK = (row: SAKRow, idx: number) => {
    const prevAccum = idx === 0 ? 0 : tabelSAK[idx - 1].akumulasi;
    return `${formatRupiah(prevAccum)} + ${formatRupiah(row.beban)}`;
  };

  const getNilaiBukuFormulaSAK = (row: SAKRow) => {
    return `${formatRupiah(totalPerolehan)} - ${formatRupiah(row.akumulasi)}`;
  };

  const getBebanFormulaPajak = (_: PajakRow, idx: number) => {
    const prevBv = idx === 0 ? totalPerolehan : tabelPajak[idx - 1].nilaiBuku;
    const rules = golonganRules[selectedGolongan || "KELOMPOK_2"] || golonganRules["KELOMPOK_2"];
    if (metodePajak === "GL" || rules.smRate === 0) {
      return `${formatRupiah(totalPerolehan)} * ${(rules.glRate * 100).toFixed(1)}%`;
    } else {
      if (idx === tabelPajak.length - 1) {
        return `Penyusutan Akhir (Menghabiskan Sisa Nilai Buku): ${formatRupiah(prevBv)}`;
      }
      return `${formatRupiah(prevBv)} * ${(rules.smRate * 100).toFixed(1)}%`;
    }
  };

  const getAkumulasiFormulaPajak = (row: PajakRow, idx: number) => {
    const prevAccum = idx === 0 ? 0 : tabelPajak[idx - 1].akumulasi;
    return `${formatRupiah(prevAccum)} + ${formatRupiah(row.beban)}`;
  };

  const getNilaiBukuFormulaPajak = (row: PajakRow) => {
    return `${formatRupiah(totalPerolehan)} - ${formatRupiah(row.akumulasi)}`;
  };

  return (
    <>
      {/* Confetti Elements */}
      {journalSuccess && (
        <div className="fixed inset-0 pointer-events-none z-99999 overflow-hidden">
          {confettiParticles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-sm animate-fall"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: 0.8
              }}
            />
          ))}
        </div>
      )}

      {/* Stepper Header (Premium Wizard Navigator) */}
      <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl p-4 shadow-theme-xs">
        <div className="flex flex-nowrap items-center justify-between overflow-x-auto no-scrollbar py-2">
          {[
            { num: 1, label: "Pembelian" },
            { num: 2, label: "Timeline" },
            { num: 3, label: "Golongan" },
            { num: 4, label: "Metode" },
            { num: 5, label: "Kalkulasi" },
            { num: 6, label: "Jurnal" }
          ].map(s => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            return (
              <div key={s.num} className="flex items-center shrink-0 mx-2">
                <button
                  onClick={() => step > s.num && setStep(s.num)}
                  disabled={step < s.num}
                  className={`flex items-center justify-center size-8 rounded-full text-xs font-bold transition-all ${isCompleted
                    ? "bg-success-500 text-white cursor-pointer"
                    : isActive
                      ? "bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-500/20"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {isCompleted ? <Check className="size-4 stroke-[3px]" /> : s.num}
                </button>
                <span className={`text-xs font-medium ml-2 hidden md:inline ${isActive ? "text-brand-500 dark:text-brand-400 font-semibold" : isCompleted ? "text-success-600 dark:text-success-500" : "text-gray-400 dark:text-gray-600"
                  }`}>
                  {s.label}
                </span>
                {s.num < 6 && (
                  <div className={`h-[2px] w-8 md:w-16 ml-3 ${isCompleted ? "bg-success-500" : "bg-gray-200 dark:bg-gray-800"
                    }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN STEP CARDS */}
      <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-2xl p-6 shadow-theme-md min-h-[400px] flex flex-col justify-between">

        {/* STEP 1: PEMBELIAN ASET */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <DollarSign className="text-brand-500 size-5" />
                Tahap 1: Pembelian Aset Tetap
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tentukan nama aset, tanggal perolehan, serta rincian biaya yang dikeluarkan untuk memperoleh aset tersebut.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Form Input */}
              <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Nama Aset Tetap
                  </label>
                  <input
                    type="text"
                    value={namaAset}
                    onChange={(e) => setNamaAset(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition"
                    placeholder="Contoh: Mobil Avanza, Komputer Asus"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Tanggal Pembelian
                  </label>
                  <DatePicker
                    value={tanggalBeli}
                    onChange={setTanggalBeli}
                    placeholder="Pilih tanggal pembelian..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                      Harga Beli (Rp)
                    </label>
                    <input
                      type="text"
                      value={hargaBeliInput}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                        setHargaBeliInput(formatRibuan(cleanVal));
                        setHargaBeli(Number(cleanVal) || 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition font-mono"
                      placeholder="Contoh: 240.000.000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                      Biaya Kirim (Rp)
                    </label>
                    <input
                      type="text"
                      value={biayaKirimInput}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                        setBiayaKirimInput(formatRibuan(cleanVal));
                        setBiayaKirim(Number(cleanVal) || 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition font-mono"
                      placeholder="Contoh: 5.000.000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                      Biaya Balik Nama (Rp)
                    </label>
                    <input
                      type="text"
                      value={biayaBbnInput}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                        setBiayaBbnInput(formatRibuan(cleanVal));
                        setBiayaBbn(Number(cleanVal) || 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition font-mono"
                      placeholder="Contoh: 5.000.000"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Total Harga Perolehan:
                  </span>
                  <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                    {formatRupiah(totalPerolehan)}
                  </span>
                </div>
              </div>

              {/* Visual Delivery Animation Canvas */}
              <div className="relative h-[250px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Info className="size-3" /> Dealer ClickAsset</span>
                  <span className="flex items-center gap-1"><Building2 className="size-3" /> PT ClickAsset Jaya</span>
                </div>

                {/* Road Canvas */}
                <div className="relative flex-1 flex items-center justify-between px-6">
                  {/* Left Gate (Dealer) */}
                  <div className="size-14 bg-slate-800 border-2 border-slate-700 rounded-lg flex items-center justify-center text-slate-400 z-10">
                    🏪
                  </div>

                  {/* Truck/Asset Container */}
                  <div
                    className={`absolute left-10 flex flex-col items-center z-20 transition-all duration-[2500ms] ease-in-out ${isTruckMoving ? "translate-x-[150px] sm:translate-x-[250px] md:translate-x-[350px] lg:translate-x-[200px] xl:translate-x-[300px]" : truckDone ? "translate-x-[150px] sm:translate-x-[250px] md:translate-x-[350px] lg:translate-x-[200px] xl:translate-x-[300px]" : "translate-x-0"
                      }`}
                  >
                    {/* Floating Asset Text Tag */}
                    <div className="bg-brand-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-lg mb-1 animate-bounce">
                      {namaAset}
                    </div>
                    {/* Delivery Vehicle Icon */}
                    <div className="text-white p-2 bg-blue-600 rounded-full shadow-lg border border-blue-400">
                      {getAssetIcon(namaAset, "size-6 animate-pulse")}
                    </div>
                  </div>

                  {/* Right Gate (Company) */}
                  <div className="size-14 bg-slate-800 border-2 border-slate-700 rounded-lg flex items-center justify-center text-slate-400 z-10">
                    🏢
                  </div>
                </div>

                {/* Control simulation button */}
                <div className="flex justify-center">
                  {!isTruckMoving && !truckDone ? (
                    <button
                      onClick={runPurchaseSimulation}
                      disabled={!namaAset || hargaBeli <= 0}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Play className="size-4" />
                      Simulasi Pengiriman Aset
                    </button>
                  ) : isTruckMoving ? (
                    <span className="text-xs text-brand-400 font-semibold flex items-center gap-2 animate-pulse">
                      {getAssetIcon(namaAset, "size-4 animate-bounce")} Aset sedang dikirim ke perusahaan...
                    </span>
                  ) : (
                    <span className="text-xs text-success-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-4" /> Aset Berhasil Diterima & Tercatat!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TIMELINE */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Calendar className="text-brand-500 size-5" />
                Tahap 2: Timeline Penggunaan Aset
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Penyusutan dimulai sejak aset siap digunakan. Tentukan tanggal pemakaian dan tanggal dimulainya penyusutan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Form */}
              <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-xs text-gray-500">
                  <span className="font-bold text-gray-600 dark:text-gray-300">Tanggal Pembelian:</span>{" "}
                  {new Date(tanggalBeli).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Tanggal Mulai Pemakaian Aset
                  </label>
                  <DatePicker
                    value={tanggalPakai}
                    onChange={setTanggalPakai}
                    minDate={tanggalBeli}
                    placeholder="Pilih tanggal pemakaian..."
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Tanggal aset fisik mulai digunakan secara aktif dalam operasional.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Tanggal Dimulai Penyusutan
                  </label>
                  <DatePicker
                    value={tanggalMulaiSusut}
                    onChange={setTanggalMulaiSusut}
                    minDate={tanggalBeli}
                    placeholder="Pilih tanggal mulai penyusutan..."
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Saat aset siap digunakan (*available for use*) menurut ketentuan SAK.
                  </p>
                </div>
              </div>

              {/* Right Educational Details */}
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-955/40 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                    <Info className="size-4" /> Perbedaan Mulai Penyusutan
                  </h4>
                  <ul className="space-y-2 text-xs text-blue-700 dark:text-blue-300 list-disc list-inside">
                    <li>
                      <strong>Ketentuan SAK:</strong> Penyusutan dimulai ketika aset <strong>tersedia untuk digunakan</strong>, yaitu ketika ia berada di lokasi dan kondisi yang diperlukan agar mampu beroperasi secara normal (bisa berbeda dari tanggal pembelian).
                    </li>
                    <li>
                      <strong>Ketentuan Pajak (Fiskal):</strong> Secara baku menurut Pasal 11 UU PPh, penyusutan dimulai pada <strong>bulan dilakukannya pengeluaran (pembelian)</strong>, bukan saat mulai pemakaian (kecuali ada izin khusus dari Dirjen Pajak).
                    </li>
                  </ul>
                </div>

                {tanggalPakai < tanggalBeli && (
                  <div className="bg-error-50 dark:bg-error-955/40 border border-error-100 dark:border-error-900 rounded-xl p-3 flex items-start gap-2 text-xs text-error-700 dark:text-error-400">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>Peringatan: Tanggal pemakaian tidak boleh lebih awal dari tanggal pembelian. Silakan periksa kembali.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: GOLONGAN */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Award className="text-brand-500 size-5" />
                Tahap 3: Klasifikasi Golongan Aset (Fiskal PPh)
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tebak dan pilih kelompok aset yang sesuai menurut ketentuan pajak. Klasifikasi menentukan masa manfaat dan tarif resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Asset Card */}
              <div className="bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-xl p-5 shadow-lg text-center flex flex-col justify-between min-h-[180px]">
                <span className="text-xs font-semibold tracking-widest opacity-80 uppercase">ASET YANG DISIMULASIKAN</span>
                <h4 className="text-2xl font-bold my-3">{namaAset}</h4>
                <div className="text-xs bg-white/10 rounded-lg py-2 px-3 inline-block mx-auto border border-white/15">
                  Harga Perolehan: {formatRupiah(totalPerolehan)}
                </div>
              </div>

              {/* Match Options */}
              <div className="lg:col-span-2 space-y-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pilih Golongan Pajak:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(golonganRules).map((key) => {
                    const rule = golonganRules[key];
                    const isSelected = selectedGolongan === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleGuessGolongan(key)}
                        className={`text-left p-4 rounded-xl border transition-all text-sm flex flex-col justify-between hover:scale-[1.01] cursor-pointer ${isSelected
                          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 dark:border-brand-500"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                          }`}
                      >
                        <span className="font-bold text-gray-800 dark:text-white">{rule.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{rule.desc}</span>
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-2">
                          Masa Manfaat: {rule.years} Tahun
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Gamified Feedback */}
                {hasAttemptedGolongan && golonganFeedback && (
                  <div className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 animate-fadeIn ${golonganFeedback.isCorrect
                    ? "bg-success-50 border-success-100 text-success-800 dark:bg-success-950/20 dark:border-success-900 dark:text-success-400"
                    : "bg-warning-50 border-warning-100 text-warning-800 dark:bg-warning-950/20 dark:border-warning-900 dark:text-warning-400"
                    }`}>
                    {golonganFeedback.isCorrect ? <CheckCircle2 className="size-5 shrink-0 mt-0.5" /> : <Info className="size-5 shrink-0 mt-0.5" />}
                    <div>
                      <span className="font-semibold">{golonganFeedback.isCorrect ? "Benar!" : "Penjelasan:"}</span>{" "}
                      {golonganFeedback.text}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: METODE */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <TrendingDown className="text-brand-500 size-5" />
                Tahap 4: Parameter & Metode Penyusutan
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tentukan metode penyusutan yang akan dibandingkan serta asumsi nilai residu yang digunakan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SAK Box */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-gray-55 dark:bg-gray-900/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                  <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5 text-sm">
                    <BookOpen className="size-4 text-brand-500" />
                    Komersial (SAK)
                  </h4>
                  <span className="text-[10px] bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 px-2 py-0.5 rounded font-semibold">Bebas</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Metode Penyusutan SAK
                  </label>
                  <select
                    value={metodeSAK}
                    onChange={(e) => setMetodeSAK(e.target.value as "GL" | "SM" | "JAT" | "SJK" | "SHP")}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="GL">Metode Garis Lurus (Straight-Line Method)</option>
                    <option value="SM">Metode Saldo Menurun (Declining Balance Method)</option>
                    <option value="JAT">Metode Jumlah Angka Tahun (Sum-of-the-Years-Digits Method)</option>
                    <option value="SJK">Metode Satuan Hasil Kerja (Service Hours Method)</option>
                    <option value="SHP">Metode Satuan Hasil Produksi (Productive Output Method)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                      Masa Manfaat (Tahun)
                    </label>
                    <input
                      type="number"
                      value={masaManfaatSAK}
                      min={1}
                      onChange={(e) => setMasaManfaatSAK(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                      Nilai Residu (Rp)
                    </label>
                    <input
                      type="text"
                      value={nilaiResiduSAKInput}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                        setNilaiResiduSAKInput(formatRibuan(cleanVal));
                        setNilaiResiduSAK(Number(cleanVal) || 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition font-mono"
                      placeholder="Contoh: 10.000.000"
                    />
                  </div>
                </div>

                {metodeSAK === "SJK" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-brand-50 dark:bg-brand-950/20 px-3 py-2 rounded-lg text-xs border border-brand-100 dark:border-brand-900/30">
                      <span className="font-medium text-brand-800 dark:text-brand-300">Total Taksiran Jam Kerja (Otomatis):</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400 font-mono">{formatRibuan(totalKapasitasJam)} Jam</span>
                    </div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                      Taksiran Jam Kerja per Tahun:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Array.from({ length: masaManfaatSAK }).map((_, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                            Thn {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={jamKerjaPerTahunInput[idx] || ""}
                            onChange={(e) => {
                              const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                              const valNum = Number(cleanVal) || 0;
                              
                              const newInputs = [...jamKerjaPerTahunInput];
                              newInputs[idx] = formatRibuan(cleanVal);
                              setJamKerjaPerTahunInput(newInputs);

                              const newValues = [...jamKerjaPerTahun];
                              newValues[idx] = valNum;
                              setJamKerjaPerTahun(newValues);
                            }}
                            className="w-full pl-12 pr-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white font-mono focus:outline-none focus:border-brand-500 transition"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {metodeSAK === "SHP" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-brand-50 dark:bg-brand-950/20 px-3 py-2 rounded-lg text-xs border border-brand-100 dark:border-brand-900/30">
                      <span className="font-medium text-brand-800 dark:text-brand-300">Total Taksiran Hasil Produksi (Otomatis):</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400 font-mono">{formatRibuan(totalKapasitasProduksi)} Unit</span>
                    </div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                      Taksiran Unit Produksi per Tahun:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Array.from({ length: masaManfaatSAK }).map((_, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                            Thn {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={produksiPerTahunInput[idx] || ""}
                            onChange={(e) => {
                              const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                              const valNum = Number(cleanVal) || 0;

                              const newInputs = [...produksiPerTahunInput];
                              newInputs[idx] = formatRibuan(cleanVal);
                              setProduksiPerTahunInput(newInputs);

                              const newValues = [...produksiPerTahun];
                              newValues[idx] = valNum;
                              setProduksiPerTahun(newValues);
                            }}
                            className="w-full pl-12 pr-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white font-mono focus:outline-none focus:border-brand-500 transition"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-gray-400">
                  * Catatan: SAK membolehkan perusahaan menaksir masa manfaat dan nilai sisa secara realistis sesuai kondisi operasional.
                </p>
              </div>

              {/* Pajak Box */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-gray-55 dark:bg-gray-900/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                  <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5 text-sm">
                    <Award className="size-4 text-emerald-500" />
                    Fiskal (Pajak)
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded font-semibold">Strict/Diatur</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Metode Penyusutan Pajak
                  </label>
                  <select
                    value={metodePajak}
                    disabled={selectedGolongan === "BANGUNAN_PERMANEN" || selectedGolongan === "BANGUNAN_SEMI_PERMANEN"}
                    onChange={(e) => setMetodePajak(e.target.value as "GL" | "SM")}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="GL">Garis Lurus (Straight Line)</option>
                    <option value="SM">Saldo Menurun (Declining Balance)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-450 dark:text-gray-500 mb-1">
                      Masa Manfaat (Tahun)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${golonganRules[selectedGolongan]?.years || 8} Tahun`}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 rounded-lg text-sm text-gray-500 dark:text-gray-405 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-450 dark:text-gray-500 mb-1">
                      Nilai Residu (Rp)
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Rp 0"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 rounded-lg text-sm text-gray-500 dark:text-gray-405 cursor-not-allowed"
                    />
                  </div>
                </div>

                {(selectedGolongan === "BANGUNAN_PERMANEN" || selectedGolongan === "BANGUNAN_SEMI_PERMANEN") ? (
                  <div className="bg-warning-50 dark:bg-warning-950/20 border border-warning-100 dark:border-warning-900 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-warning-700 dark:text-warning-400">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                    <span>Aset Bangunan wajib menggunakan Metode Garis Lurus. Metode Saldo Menurun dikunci.</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400">
                    * Menurut Ketentuan UU PPh, Nilai Residu akhir masa manfaat dianggap Rp0 dalam penyusutan pajak.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: KALKULASI & GRAFIK */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <TrendingDown className="text-brand-500 size-5" />
                Tahap 5: Hasil Perhitungan & Grafik Depresiasi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Visualisasikan perbandingan kurva penurunan nilai buku aset antara SAK (Komersial) dan Pajak (Fiskal).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recharts Chart */}
              <div className="lg:col-span-7 bg-gray-55 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-4 min-h-[300px] flex flex-col justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Kurva Penurunan Nilai Buku Aset (Rupiah)
                </span>

                <div className="w-full h-[250px] text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="year" stroke="#9ca3af" />
                      <YAxis
                        stroke="#9ca3af"
                        tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}jt`}
                      />
                      <Tooltip
                        formatter={(value: any) => formatRupiah(Number(value))}
                        contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="SAK Nilai Buku"
                        stroke="#465fff"
                        strokeWidth={2.5}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Pajak Nilai Buku"
                        stroke="#10b981"
                        strokeWidth={2.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Column: Tabbed Tables & Comparison Summary */}
              <div className="lg:col-span-5 space-y-4">
                {/* Table Tab Selector */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setActiveTabTable("SAK")}
                    className={`pb-2 text-sm font-semibold border-b-2 px-4 transition-all cursor-pointer ${activeTabTable === "SAK"
                      ? "border-brand-500 text-brand-600 dark:text-brand-400"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      }`}
                  >
                    Akuntansi (SAK)
                  </button>
                  <button
                    onClick={() => setActiveTabTable("Pajak")}
                    className={`pb-2 text-sm font-semibold border-b-2 px-4 transition-all cursor-pointer ${activeTabTable === "Pajak"
                      ? "border-brand-500 text-brand-600 dark:text-brand-400"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      }`}
                  >
                    Pajak (Fiskal)
                  </button>
                </div>

                {/* Table Render Container */}
                <div className="max-h-[220px] overflow-y-auto custom-scrollbar border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950">
                  <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-[10px] text-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-gray-300 uppercase">
                      <tr>
                        <th className="px-3 py-2 text-center">Thn</th>
                        <th className="px-3 py-2 text-right">Beban Depresiasi</th>
                        <th className="px-3 py-2 text-right">Akumulasi Depresiasi</th>
                        <th className="px-3 py-2 text-right">Nilai Buku</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTabTable === "SAK" ? (
                        tabelSAK.map((row, idx) => (
                          <tr key={row.year} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-white text-center">{row.year} <span className="text-[9px] text-gray-400 font-normal">({row.months} bln)</span></td>
                            <td
                              className="px-3 py-2 text-right text-gray-800 dark:text-gray-300 cursor-help"
                              title={`Rumus: ${getBebanFormulaSAK(row, idx)}`}
                            >
                              {formatRupiah(row.beban)}
                            </td>
                            <td
                              className="px-3 py-2 text-right text-gray-800 dark:text-gray-300 cursor-help"
                              title={`Rumus: ${getAkumulasiFormulaSAK(row, idx)}`}
                            >
                              {formatRupiah(row.akumulasi)}
                            </td>
                            <td
                              className="px-3 py-2 text-right font-semibold text-brand-600 dark:text-brand-400 cursor-help"
                              title={`Rumus: ${getNilaiBukuFormulaSAK(row)}`}
                            >
                              {formatRupiah(row.nilaiBuku)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        tabelPajak.map((row, idx) => (
                          <tr key={row.year} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-white text-center">{row.year} <span className="text-[9px] text-gray-400 font-normal">({row.months} bln)</span></td>
                            <td
                              className="px-3 py-2 text-right text-gray-800 dark:text-gray-300 cursor-help"
                              title={`Rumus: ${getBebanFormulaPajak(row, idx)}`}
                            >
                              {formatRupiah(row.beban)}
                            </td>
                            <td
                              className="px-3 py-2 text-right text-gray-800 dark:text-gray-300 cursor-help"
                              title={`Rumus: ${getAkumulasiFormulaPajak(row, idx)}`}
                            >
                              {formatRupiah(row.akumulasi)}
                            </td>
                            <td
                              className="px-3 py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400 cursor-help"
                              title={`Rumus: ${getNilaiBukuFormulaPajak(row)}`}
                            >
                              {formatRupiah(row.nilaiBuku)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Educational Box (Koreksi Fiskal) */}
                <div className="bg-yellow-50 dark:bg-yellow-955/20 border border-yellow-100 dark:border-yellow-900 rounded-xl p-3 text-xs text-yellow-800 dark:text-yellow-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5"><Info className="size-3.5" /> Edukasi Koreksi Fiskal:</div>
                  <p className="leading-relaxed text-[11px]">
                    Beban penyusutan komersial (SAK) Tahun Ke-1 adalah <strong>{formatRupiah(tabelSAK[0]?.beban || 0)}</strong>, sedangkan versi Pajak adalah <strong>{formatRupiah(tabelPajak[0]?.beban || 0)}</strong>.
                  </p>
                  <p className="leading-relaxed text-[11px]">
                    Perbedaan ini dinamakan <strong>Beda Waktu (Temporary Difference)</strong>. Di akhir tahun saat pelaporan SPT Badan, selisih beban penyusutan wajib direkonsiliasi melalui <strong>Koreksi Fiskal</strong> sehingga laba kena pajak sesuai dengan aturan UU PPh.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: JURNAL */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <BookOpen className="text-brand-500 size-5" />
                Tahap 6: Jurnal Penyesuaian Akhir Tahun (Pertama)
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Catat beban penyusutan akuntansi (SAK) Tahun Pertama ke dalam Buku Jurnal Penyesuaian Komersial.
              </p>
            </div>

            {!journalSuccess ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Ledger Sheet Inputs */}
                <div className="lg:col-span-2 bg-gray-55 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-5">

                  {/* Journal Header Info */}
                  <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-2">
                    <span><strong>Jurnal Umum Penyesuaian</strong></span>
                    <span>Periode: 31 Desember {tabelSAK[0]?.year || "2026"}</span>
                  </div>

                  {/* Journal Rows Grid */}
                  <div className="space-y-4 text-xs font-semibold">
                    {/* DEBIT Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div>
                        <label className="block text-[10px] text-gray-405 uppercase mb-1">Debited Account</label>
                        <select
                          value={jurnalDebitAkun}
                          onChange={(e) => setJurnalDebitAkun(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white"
                        >
                          <option value="">-- Pilih Akun --</option>
                          <option value="kas">Kas / Bank</option>
                          <option value="aset_tetap">Aset Tetap ({namaAset})</option>
                          <option value="beban_penyusutan">Beban Penyusutan Aset Tetap</option>
                          <option value="akumulasi_penyusutan">Akumulasi Penyusutan Aset Tetap</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-405 uppercase mb-1">Nominal Debit (Rp)</label>
                        <input
                          type="text"
                          value={jurnalDebitNilai}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                            setJurnalDebitNilai(formatRibuan(cleanVal));
                          }}
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white font-mono"
                          placeholder="Contoh: 25.000.000"
                        />
                      </div>
                      <div className="text-gray-400 dark:text-gray-600 italic mt-4 md:mt-0 text-[10px] pl-2">
                        * Posisikan akun beban di sisi Debit.
                      </div>
                    </div>

                    {/* KREDIT Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center pt-2 border-t border-dashed border-gray-200 dark:border-gray-800">
                      <div>
                        <label className="block text-[10px] text-gray-405 uppercase mb-1">Credited Account</label>
                        <select
                          value={jurnalKreditAkun}
                          onChange={(e) => setJurnalKreditAkun(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white pl-4"
                        >
                          <option value="">-- Pilih Akun --</option>
                          <option value="kas">Kas / Bank</option>
                          <option value="aset_tetap">Aset Tetap ({namaAset})</option>
                          <option value="beban_penyusutan">Beban Penyusutan Aset Tetap</option>
                          <option value="akumulasi_penyusutan">Akumulasi Penyusutan Aset Tetap</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-405 uppercase mb-1">Nominal Kredit (Rp)</label>
                        <input
                          type="text"
                          value={jurnalKreditNilai}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                            setJurnalKreditNilai(formatRibuan(cleanVal));
                          }}
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white font-mono"
                          placeholder="Contoh: 25.000.000"
                        />
                      </div>
                      <div className="text-gray-400 dark:text-gray-600 italic mt-4 md:mt-0 text-[10px] pl-2">
                        * Posisikan akun akumulasi penyusutan di sisi Kredit.
                      </div>
                    </div>
                  </div>

                  {/* Submission and prompt */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">
                      Petunjuk: Gunakan beban komersial tahun pertama yaitu <strong>{formatRupiah(tabelSAK[0]?.beban || 0)}</strong>.
                    </span>
                    <button
                      onClick={handleVerifyJournal}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
                    >
                      Verifikasi Jurnal
                    </button>
                  </div>
                </div>

                {/* Feedback Panel */}
                <div className="space-y-4">
                  {journalAttempt && (
                    <div className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 animate-fadeIn ${journalSuccess
                      ? "bg-success-50 border-success-100 text-success-800 dark:bg-success-950/20 dark:border-success-900 dark:text-success-400"
                      : "bg-error-50 border-error-100 text-error-800 dark:bg-error-955/20 dark:border-error-900 dark:text-error-400"
                      }`}>
                      {journalSuccess ? <CheckCircle2 className="size-5 shrink-0 mt-0.5" /> : <AlertTriangle className="size-5 shrink-0 mt-0.5" />}
                      <div>
                        <span className="font-bold">{journalSuccess ? "Sukses!" : "Koreksi!"}</span>{" "}
                        {journalFeedback}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-955/40 border border-blue-100 dark:border-blue-900 rounded-xl p-4 text-xs text-blue-700 dark:text-blue-300">
                    <h5 className="font-bold mb-1.5 flex items-center gap-1"><Info className="size-3.5" /> Aturan Penjurnalan:</h5>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Beban Penyusutan bertambah di sisi <strong>Debit</strong> karena merupakan komponen beban operasi perusahaan.</li>
                      <li>Akumulasi Penyusutan bertambah di sisi <strong>Kredit</strong> sebagai akun kontra-aset pengurang nilai buku aset tetap.</li>
                    </ol>
                  </div>
                </div>

              </div>
            ) : (
              // Success Certificate Dashboard / Summary printable view
              <div className="bg-success-50/50 dark:bg-success-955/10 border border-success-200 dark:border-success-900 rounded-2xl p-6 text-center space-y-6 max-w-xl mx-auto animate-zoomIn">
                <div className="inline-flex items-center justify-center p-3 bg-success-500 rounded-full text-white shadow-lg shadow-success-200 dark:shadow-none mb-2">
                  <Sparkles className="size-8 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-success-800 dark:text-success-400">
                    Simulasi Siklus Aset Selesai!
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Anda berhasil menyelesaikan seluruh 6 tahap siklus pencatatan dan penyusutan aset tetap secara komersial dan fiskal.
                  </p>
                </div>

                {/* Summary Box */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-left text-xs space-y-2.5">
                  <h5 className="font-bold text-gray-700 dark:text-gray-200 border-b pb-1 border-gray-100 dark:border-gray-800">
                    RINGKASAN SIKLUS ASET
                  </h5>
                  <div className="grid grid-cols-2 gap-y-1.5 text-gray-600 dark:text-gray-400">
                    <span>Nama Aset:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">{namaAset}</span>

                    <span>Total Harga Perolehan:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">{formatRupiah(totalPerolehan)}</span>

                    <span>Golongan Pajak:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">
                      {golonganRules[selectedGolongan]?.name || "Kelompok 2"}
                    </span>

                    <span>Penyusutan SAK Thn 1:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">{formatRupiah(tabelSAK[0]?.beban || 0)}</span>

                    <span>Penyusutan Pajak Thn 1:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">{formatRupiah(tabelPajak[0]?.beban || 0)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {refleksiSaved && (
                    <button
                      onClick={handleResetAll}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition shadow-md cursor-pointer"
                    >
                      Simulasi Aset Lain
                    </button>
                  )}
                  <button
                    onClick={() => {
                      downloadSimulationPDF({
                        timestamp: new Date().toISOString(),
                        namaAset,
                        tanggalBeli,
                        hargaBeli,
                        biayaKirim,
                        biayaBbn,
                        totalPerolehan,
                        tanggalPakai,
                        tanggalMulaiSusut,
                        selectedGolongan,
                        metodeSAK,
                        metodePajak,
                        nilaiResiduSAK,
                        masaManfaatSAK,
                        totalKapasitasJam,
                        jamTahun1,
                        totalKapasitasProduksi,
                        produksiTahun1,
                        bebanSAKThn1: tabelSAK[0]?.beban || 0,
                        bebanPajakThn1: tabelPajak[0]?.beban || 0,
                        tabelSAK,
                        tabelPajak
                      });
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    Unduh Hasil Laporan (PDF)
                  </button>
                </div>

                {/* Reflection Form */}
                <ReflectionForm
                  onSaveReflection={onSaveReflection}
                  refleksiSaved={refleksiSaved}
                />
              </div>
            )}
          </div>
        )}

        {/* BOTTOM NAVIGATION CONTROLS */}
        {!journalSuccess && (
          <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 text-xs">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-1 px-4 py-2 font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              Kembali
            </button>

            <button
              onClick={() => {
                const userJson = localStorage.getItem("clickaset_user");
                if (!userJson) {
                  window.dispatchEvent(new CustomEvent("show-auth-modal", {
                    detail: { message: "Ingin melanjutkan simulasi siklus aset ke tahap berikutnya? Yuk, login terlebih dahulu!" }
                  }));
                  return;
                }
                if (step === 1) {
                  if (namaAset && hargaBeli > 0) setStep(2);
                } else if (step === 2) {
                  if (tanggalPakai >= tanggalBeli && tanggalMulaiSusut >= tanggalBeli) setStep(3);
                } else if (step === 3) {
                  if (selectedGolongan) setStep(4);
                } else if (step === 4) {
                  setStep(5);
                } else if (step === 5) {
                  setStep(6);
                }
              }}
              disabled={
                (step === 1 && (!namaAset || hargaBeli <= 0 || !truckDone)) ||
                (step === 2 && (tanggalPakai < tanggalBeli || tanggalMulaiSusut < tanggalBeli)) ||
                (step === 3 && !selectedGolongan)
              }
              className="flex items-center gap-1 px-4 py-2 font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Lanjut
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

      </div>
    </>
  );
};
