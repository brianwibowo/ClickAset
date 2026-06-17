import React, { useState, useEffect } from "react";
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
  RotateCcw,
  Sparkles,
  Truck,
  Building2,
  Play,
  Check,
  Info,
  BookOpen,
  Award,
  Trash2,
  Download,
  History
} from "lucide-react";
import { jsPDF } from "jspdf";

// Types
interface SAKRow {
  year: number;
  months: number;
  hargaPerolehan: number;
  beban: number;
  akumulasi: number;
  nilaiBuku: number;
}

interface PajakRow {
  year: number;
  months: number;
  hargaPerolehan: number;
  beban: number;
  akumulasi: number;
  nilaiBuku: number;
}

interface ChartDataPoint {
  year: number;
  "SAK Nilai Buku": number;
  "Pajak Nilai Buku": number;
}

const GOLONGAN_RULES = {
  KELOMPOK_1: { name: "Kelompok 1 (Bukan Bangunan)", years: 4, glRate: 0.25, smRate: 0.50, desc: "Masa manfaat 4 tahun. Contoh: Komputer, printer, sepeda motor, alat pertanian ringan." },
  KELOMPOK_2: { name: "Kelompok 2 (Bukan Bangunan)", years: 8, glRate: 0.125, smRate: 0.25, desc: "Masa manfaat 8 tahun. Contoh: Mobil operasional, mebel kayu, AC, mesin kantor sedang." },
  KELOMPOK_3: { name: "Kelompok 3 (Bukan Bangunan)", years: 16, glRate: 0.0625, smRate: 0.125, desc: "Masa manfaat 16 tahun. Contoh: Mesin pabrik berat, kapal penumpang sedang." },
  KELOMPOK_4: { name: "Kelompok 4 (Bukan Bangunan)", years: 20, glRate: 0.05, smRate: 0.10, desc: "Masa manfaat 20 tahun. Contoh: Kereta api, kapal barang besar." },
  BANGUNAN_PERMANEN: { name: "Bangunan Permanen", years: 20, glRate: 0.05, smRate: 0, desc: "Masa manfaat 20 tahun. Wajib menggunakan Metode Garis Lurus untuk Pajak." },
  BANGUNAN_SEMI_PERMANEN: { name: "Bangunan Semi-Permanen", years: 10, glRate: 0.10, smRate: 0, desc: "Masa manfaat 10 tahun. Wajib menggunakan Metode Garis Lurus untuk Pajak." }
};

type GolonganKey = keyof typeof GOLONGAN_RULES;

const Simulasi: React.FC = () => {
  // Navigation Steps
  const [step, setStep] = useState<number>(1);

  // Step 1: Pembelian Aset
  const [namaAset, setNamaAset] = useState<string>("Mobil Avanza");
  const [tanggalBeli, setTanggalBeli] = useState<string>("2026-03-15");
  const [hargaBeli, setHargaBeli] = useState<number>(240000000);
  const [biayaKirim, setBiayaKirim] = useState<number>(5000000);
  const [biayaBbn, setBiayaBbn] = useState<number>(5000000);
  const [totalPerolehan, setTotalPerolehan] = useState<number>(250000000);

  // Formatted string states for Indonesian local currency input format
  const [hargaBeliInput, setHargaBeliInput] = useState<string>("240.000.000");
  const [biayaKirimInput, setBiayaKirimInput] = useState<string>("5.000.000");
  const [biayaBbnInput, setBiayaBbnInput] = useState<string>("5.000.000");

  // Step 1 Animation
  const [isTruckMoving, setIsTruckMoving] = useState<boolean>(false);
  const [truckDone, setTruckDone] = useState<boolean>(false);

  // Step 2: Timeline
  const [tanggalPakai, setTanggalPakai] = useState<string>("2026-04-01");
  const [tanggalMulaiSusut, setTanggalMulaiSusut] = useState<string>("2026-04-01");

  // Step 3: Golongan Pajak (Gamified Matching)
  const [selectedGolongan, setSelectedGolongan] = useState<GolonganKey | "">("");
  const [hasAttemptedGolongan, setHasAttemptedGolongan] = useState<boolean>(false);
  const [golonganFeedback, setGolonganFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Step 4: Metode & Asumsi
  const [metodeSAK, setMetodeSAK] = useState<"GL" | "SM">("GL");
  const [metodePajak, setMetodePajak] = useState<"GL" | "SM">("GL");
  const [nilaiResiduSAK, setNilaiResiduSAK] = useState<number>(10000000);
  const [masaManfaatSAK, setMasaManfaatSAK] = useState<number>(8);
  const [nilaiResiduSAKInput, setNilaiResiduSAKInput] = useState<string>("10.000.000");

  // Step 5: Perhitungan
  const [tabelSAK, setTabelSAK] = useState<SAKRow[]>([]);
  const [tabelPajak, setTabelPajak] = useState<PajakRow[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [activeTabTable, setActiveTabTable] = useState<"SAK" | "Pajak">("SAK");

  // Step 6: Jurnal Penyesuaian
  const [jurnalDebitAkun, setJurnalDebitAkun] = useState<string>("");
  const [jurnalDebitNilai, setJurnalDebitNilai] = useState<string>("");
  const [jurnalKreditAkun, setJurnalKreditAkun] = useState<string>("");
  const [jurnalKreditNilai, setJurnalKreditNilai] = useState<string>("");
  const [journalAttempt, setJournalAttempt] = useState<boolean>(false);
  const [journalSuccess, setJournalSuccess] = useState<boolean>(false);
  const [journalFeedback, setJournalFeedback] = useState<string>("");
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);

  // Simulation History state
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [selectedHistoryView, setSelectedHistoryView] = useState<any | null>(null);

  // Auto calculate total perolehan on Step 1 changes
  useEffect(() => {
    setTotalPerolehan(hargaBeli + biayaKirim + biayaBbn);
  }, [hargaBeli, biayaKirim, biayaBbn]);

  // Synchronize dates defaults on Step 1 date change
  useEffect(() => {
    setTanggalPakai(tanggalBeli);
    setTanggalMulaiSusut(tanggalBeli);
  }, [tanggalBeli]);

  // Handle building restriction in Step 4
  useEffect(() => {
    if (selectedGolongan === "BANGUNAN_PERMANEN" || selectedGolongan === "BANGUNAN_SEMI_PERMANEN") {
      setMetodePajak("GL");
    }
  }, [selectedGolongan]);

  // Load/refresh history on step changes or mount
  useEffect(() => {
    refreshHistoryList();
  }, [step]);

  // Trigger Calculations when step 5 is loaded
  useEffect(() => {
    if (step === 5) {
      calculateSchedules();
    }
  }, [step, metodeSAK, metodePajak, nilaiResiduSAK, masaManfaatSAK, selectedGolongan]);

  // Helper formatter currency Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Format numeric value to Indonesian thousands dot separator (e.g. 250000 -> "250.000")
  const formatRibuan = (val: number | string) => {
    if (val === undefined || val === null || val === "") return "";
    const numStr = String(val).replace(/[^0-9]/g, "");
    if (!numStr) return "";
    return new Intl.NumberFormat("id-ID").format(Number(numStr));
  };

  // Run Step 1 Truck Animation
  const runPurchaseSimulation = () => {
    setIsTruckMoving(true);
    setTruckDone(false);
    setTimeout(() => {
      setIsTruckMoving(false);
      setTruckDone(true);
    }, 2500); // Animation duration
  };

  // Guess checking for Step 3 Golongan matching game
  const handleGuessGolongan = (key: GolonganKey) => {
    setSelectedGolongan(key);
    setHasAttemptedGolongan(true);

    const namaLower = namaAset.toLowerCase();
    let correctKey: GolonganKey = "KELOMPOK_2"; // default

    if (namaLower.includes("komputer") || namaLower.includes("laptop") || namaLower.includes("printer") || namaLower.includes("handphone") || namaLower.includes("hp") || namaLower.includes("sepeda motor")) {
      correctKey = "KELOMPOK_1";
    } else if (namaLower.includes("mobil") || namaLower.includes("truk") || namaLower.includes("bus") || namaLower.includes("kendaraan") || namaLower.includes("ac") || namaLower.includes("mebel")) {
      correctKey = "KELOMPOK_2";
    } else if (namaLower.includes("mesin pabrik") || namaLower.includes("dermaga") || namaLower.includes("kapal sedang")) {
      correctKey = "KELOMPOK_3";
    } else if (namaLower.includes("kereta api") || namaLower.includes("kapal besar")) {
      correctKey = "KELOMPOK_4";
    } else if (namaLower.includes("gedung") || namaLower.includes("bangunan") || namaLower.includes("ruko") || namaLower.includes("kantor")) {
      correctKey = "BANGUNAN_PERMANEN";
    }

    const isCorrect = (key === correctKey);
    const correctName = GOLONGAN_RULES[correctKey].name;

    if (isCorrect) {
      setGolonganFeedback({
        isCorrect: true,
        text: `Tepat sekali! "${namaAset}" memang cocok diklasifikasikan ke dalam ${GOLONGAN_RULES[key].name} (${GOLONGAN_RULES[key].years} Tahun).`
      });
      // Auto-set the SAK useful life to match
      setMasaManfaatSAK(GOLONGAN_RULES[key].years);
    } else {
      setGolonganFeedback({
        isCorrect: false,
        text: `Kurang tepat. Secara aturan umum perpajakan, "${namaAset}" dikategorikan ke dalam ${correctName}. Namun Anda tetap dapat menggunakan pilihan "${GOLONGAN_RULES[key].name}" untuk simulasi ini.`
      });
      setMasaManfaatSAK(GOLONGAN_RULES[key].years);
    }
  };

  // Central Calculation Engine for SAK & Pajak
  const calculateSchedules = () => {
    const perolehan = totalPerolehan;

    // --- SAK CALCULATIONS ---
    const residuSAK = Number(nilaiResiduSAK) || 0;
    const nSAK = Number(masaManfaatSAK) || 1;
    const startDateSAK = new Date(tanggalMulaiSusut);
    const startMonthSAK = startDateSAK.getMonth() + 1; // 1-12
    const startYearSAK = startDateSAK.getFullYear();

    const sakRows: SAKRow[] = [];
    let bvSAK = perolehan;
    let accumSAK = 0;
    let remainingMonthsSAK = nSAK * 12;
    let currentYearSAK = startYearSAK;

    // Year 1 SAK
    const y1MonthsSAK = 13 - startMonthSAK;
    let y1BebanSAK = 0;

    if (metodeSAK === "GL") {
      const annualDep = (perolehan - residuSAK) / nSAK;
      y1BebanSAK = Math.min(bvSAK - residuSAK, (annualDep / 12) * y1MonthsSAK);
    } else {
      // Saldo Menurun SAK (Double Declining)
      const rate = 2 / nSAK;
      const annualDep = bvSAK * rate;
      y1BebanSAK = Math.min(bvSAK - residuSAK, (annualDep / 12) * y1MonthsSAK);
    }

    accumSAK += y1BebanSAK;
    bvSAK -= y1BebanSAK;
    remainingMonthsSAK -= y1MonthsSAK;

    sakRows.push({
      year: currentYearSAK,
      months: y1MonthsSAK,
      hargaPerolehan: perolehan,
      beban: Math.round(y1BebanSAK),
      akumulasi: Math.round(accumSAK),
      nilaiBuku: Math.max(residuSAK, Math.round(bvSAK))
    });

    // Subsequent years SAK
    while (remainingMonthsSAK > 0) {
      currentYearSAK += 1;
      const months = Math.min(12, remainingMonthsSAK);
      let beban = 0;

      if (metodeSAK === "GL") {
        const annualDep = (perolehan - residuSAK) / nSAK;
        beban = Math.min(bvSAK - residuSAK, (annualDep / 12) * months);
      } else {
        // SM SAK
        const rate = 2 / nSAK;
        if (remainingMonthsSAK <= 12) {
          // Last period: write down remaining book value to residual value
          beban = bvSAK - residuSAK;
        } else {
          const annualDep = bvSAK * rate;
          beban = Math.min(bvSAK - residuSAK, (annualDep / 12) * months);
        }
      }

      accumSAK += beban;
      bvSAK -= beban;
      remainingMonthsSAK -= months;

      sakRows.push({
        year: currentYearSAK,
        months,
        hargaPerolehan: perolehan,
        beban: Math.round(beban),
        akumulasi: Math.round(accumSAK),
        nilaiBuku: Math.max(residuSAK, Math.round(bvSAK))
      });
    }

    // --- PAJAK CALCULATIONS ---
    const targetGolongan: GolonganKey = (selectedGolongan as GolonganKey) || "KELOMPOK_2";
    const rules = GOLONGAN_RULES[targetGolongan];
    const nPajak = rules.years;
    const rateGL = rules.glRate;
    const rateSM = rules.smRate;

    const buyDate = new Date(tanggalBeli); // Pajak starts at acquisition month
    const startMonthPajak = buyDate.getMonth() + 1;
    const startYearPajak = buyDate.getFullYear();

    const pajakRows: PajakRow[] = [];
    let bvPajak = perolehan;
    let accumPajak = 0;
    let remainingMonthsPajak = nPajak * 12;
    let currentYearPajak = startYearPajak;

    // Year 1 Pajak
    const y1MonthsPajak = 13 - startMonthPajak;
    let y1BebanPajak = 0;

    if (metodePajak === "GL" || rateSM === 0) {
      const annualDep = perolehan * rateGL;
      y1BebanPajak = annualDep * (y1MonthsPajak / 12);
    } else {
      // SM
      const annualDep = perolehan * rateSM;
      y1BebanPajak = annualDep * (y1MonthsPajak / 12);
    }

    // Clamp
    if (y1BebanPajak > bvPajak) y1BebanPajak = bvPajak;

    accumPajak += y1BebanPajak;
    bvPajak -= y1BebanPajak;
    remainingMonthsPajak -= y1MonthsPajak;

    pajakRows.push({
      year: currentYearPajak,
      months: y1MonthsPajak,
      hargaPerolehan: perolehan,
      beban: Math.round(y1BebanPajak),
      akumulasi: Math.round(accumPajak),
      nilaiBuku: Math.max(0, Math.round(bvPajak))
    });

    // Subsequent years Pajak
    while (remainingMonthsPajak > 0) {
      currentYearPajak += 1;
      const months = Math.min(12, remainingMonthsPajak);
      let beban = 0;

      if (metodePajak === "GL" || rateSM === 0) {
        const annualDep = perolehan * rateGL;
        beban = annualDep * (months / 12);
        if (beban > bvPajak) beban = bvPajak;
      } else {
        // SM
        if (remainingMonthsPajak <= 12) {
          // Indonesian Tax Law: Final year is depreciated fully to 0
          beban = bvPajak;
        } else {
          const annualDep = bvPajak * rateSM;
          beban = annualDep * (months / 12);
        }
      }

      accumPajak += beban;
      bvPajak -= beban;
      remainingMonthsPajak -= months;

      pajakRows.push({
        year: currentYearPajak,
        months,
        hargaPerolehan: perolehan,
        beban: Math.round(beban),
        akumulasi: Math.round(accumPajak),
        nilaiBuku: Math.max(0, Math.round(bvPajak))
      });
    }

    setTabelSAK(sakRows);
    setTabelPajak(pajakRows);

    // Build Chart Data
    // Combine years
    const allYears = Array.from(new Set([...sakRows.map(r => r.year), ...pajakRows.map(r => r.year)])).sort();

    // Initial year 0 for starting perolehan
    const startYear = Math.min(...allYears) - 1;
    const cData: ChartDataPoint[] = [{
      year: startYear,
      "SAK Nilai Buku": perolehan,
      "Pajak Nilai Buku": perolehan
    }];

    allYears.forEach(y => {
      const sakVal = sakRows.find(r => r.year === y)?.nilaiBuku ?? sakRows[sakRows.length - 1].nilaiBuku;
      const pajVal = pajakRows.find(r => r.year === y)?.nilaiBuku ?? 0;
      cData.push({
        year: y,
        "SAK Nilai Buku": sakVal,
        "Pajak Nilai Buku": pajVal
      });
    });

    setChartData(cData);
  };

  // Validate Step 6 Jurnal Entry
  const handleVerifyJournal = () => {
    setJournalAttempt(true);
    const correctBeban = tabelSAK[0]?.beban || 0;

    const cleanDebitNilai = Number(jurnalDebitNilai.replace(/[^0-9]/g, ""));
    const cleanKreditNilai = Number(jurnalKreditNilai.replace(/[^0-9]/g, ""));

    // Check account matches
    const isDebitAccountCorrect = (jurnalDebitAkun === "beban_penyusutan");
    const isKreditAccountCorrect = (jurnalKreditAkun === "akumulasi_penyusutan");

    // Check balancing
    const isBalance = (cleanDebitNilai === cleanKreditNilai);

    // Check values match Year 1 SAK expense
    const isValueCorrect = (cleanDebitNilai === correctBeban);

    if (!isDebitAccountCorrect) {
      setJournalFeedback("Gagal: Akun DEBIT tidak tepat. Akun yang didebit untuk mencatat penyesuaian penyusutan adalah Beban Penyusutan Aset Tetap.");
      setJournalSuccess(false);
    } else if (!isKreditAccountCorrect) {
      setJournalFeedback("Gagal: Akun KREDIT tidak tepat. Akun yang dikredit untuk mencatat penyesuaian penyusutan adalah Akumulasi Penyusutan Aset Tetap.");
      setJournalSuccess(false);
    } else if (!isBalance) {
      setJournalFeedback("Gagal: Jurnal TIDAK BALANCE. Jumlah Debit dan Kredit harus sama.");
      setJournalSuccess(false);
    } else if (!isValueCorrect) {
      setJournalFeedback(`Gagal: Nominal tidak sesuai. Jurnal penyesuaian dibuat berdasarkan Beban Penyusutan Komersial (SAK) Tahun Pertama, yaitu ${formatRupiah(correctBeban)}.`);
      setJournalSuccess(false);
    } else {
      setJournalFeedback("Luar Biasa! Jurnal Penyesuaian Anda 100% BENAR dan BALANCE!");
      setJournalSuccess(true);
      triggerConfetti();
      saveSimulationToHistory();
    }
  };

  // Simple pure JS confetti trigger
  const triggerConfetti = () => {
    const particles = [];
    const colors = ["#465fff", "#12b76a", "#f79009", "#ee46bc", "#7a5af8"];
    for (let i = 0; i < 60; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100, // percentage left
        y: -10 - Math.random() * 20, // percentage top
        size: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2
      });
    }
    setConfettiParticles(particles);
  };

  // Reset simulator to start new study
  const handleResetAll = () => {
    setStep(1);
    setNamaAset("Mobil Avanza");
    setTanggalBeli("2026-03-15");
    setHargaBeli(240000000);
    setBiayaKirim(5000000);
    setBiayaBbn(5000000);
    setTanggalPakai("2026-04-01");
    setTanggalMulaiSusut("2026-04-01");
    setSelectedGolongan("");
    setHasAttemptedGolongan(false);
    setGolonganFeedback(null);
    setMetodeSAK("GL");
    setMetodePajak("GL");
    setNilaiResiduSAK(10000000);
    setMasaManfaatSAK(8);
    setJurnalDebitAkun("");
    setJurnalDebitNilai("");
    setJurnalKreditAkun("");
    setJurnalKreditNilai("");
    setJournalAttempt(false);
    setJournalSuccess(false);
    setJournalFeedback("");
    setConfettiParticles([]);
    setTruckDone(false);

    // Reset formatted inputs
    setHargaBeliInput("240.000.000");
    setBiayaKirimInput("5.000.000");
    setBiayaBbnInput("5.000.000");
    setNilaiResiduSAKInput("10.000.000");
  };

  const refreshHistoryList = () => {
    const userJson = localStorage.getItem("clickaset_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      const userId = user.id || user.email || "guest";
      const historyKey = `clickaset_sim_history_${userId}`;
      const existingHistoryJson = localStorage.getItem(historyKey);
      setHistoryList(existingHistoryJson ? JSON.parse(existingHistoryJson) : []);
    } else {
      setHistoryList([]);
    }
  };

  const saveSimulationToHistory = () => {
    const userJson = localStorage.getItem("clickaset_user");
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const userId = user.id || user.email || "guest";

    const historyKey = `clickaset_sim_history_${userId}`;
    const existingHistoryJson = localStorage.getItem(historyKey);
    const existingHistory = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];

    const newHistoryItem = {
      id: "sim-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9),
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
      bebanSAKThn1: tabelSAK[0]?.beban || 0,
      bebanPajakThn1: tabelPajak[0]?.beban || 0,
      tabelSAK,
      tabelPajak,
      chartData
    };

    const updatedHistory = [newHistoryItem, ...existingHistory];
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    refreshHistoryList();
  };

  const downloadSimulationPDF = (data: any) => {
    const doc = new jsPDF();

    doc.setFont("helvetica");

    // Kop Surat (Header Panel)
    doc.setFillColor(59, 145, 155);
    doc.rect(0, 0, 210, 8, "F");

    // Logo & Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 145, 155);
    doc.text("CLICKASET", 15, 23);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Aplikasi Edukasi Siklus Hidup Aset & Akuntansi Penyusutan", 15, 29);

    // Right-aligned Date & Author
    const formattedDate = new Date(data.timestamp || new Date()).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    });
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Tanggal: ${formattedDate}`, 195, 23, { align: "right" });
    doc.text("Author: CLICKASET Education Team", 195, 29, { align: "right" });

    // Decorative Line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 34, 195, 34);

    // Title
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("LAPORAN SIKLUS HIDUP & PENYUSUTAN ASET", 15, 45);

    // Section 1: Detail Aset
    doc.setFontSize(11);
    doc.setTextColor(59, 145, 155);
    doc.text("1. Informasi & Perolehan Aset", 15, 54);

    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(248, 249, 250);
    doc.rect(15, 57, 180, 50, "FD");

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    let currentY = 63;
    const drawRow = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(value, 95, currentY);
      currentY += 5.5;
    };

    drawRow("Nama Aset", `: ${data.namaAset}`);
    drawRow("Tanggal Perolehan (Beli)", `: ${data.tanggalBeli}`);
    drawRow("Tanggal Mulai Digunakan", `: ${data.tanggalPakai}`);
    drawRow("Tanggal Mulai Penyusutan", `: ${data.tanggalMulaiSusut}`);
    drawRow("Harga Pembelian", `: ${formatRupiah(data.hargaBeli)}`);
    drawRow("Biaya Kirim", `: ${formatRupiah(data.biayaKirim)}`);
    drawRow("Biaya Balik Nama / Instalasi", `: ${formatRupiah(data.biayaBbn)}`);
    drawRow("Total Harga Perolehan", `: ${formatRupiah(data.totalPerolehan)}`);

    // Section 2: Kebijakan
    currentY = 114;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 145, 155);
    doc.text("2. Kebijakan Akuntansi & Fiskal (Pajak)", 15, currentY);

    currentY += 3;
    doc.setFillColor(248, 249, 250);
    doc.rect(15, currentY, 180, 28, "FD");

    currentY += 6;
    const getMetodeName = (code: string) => code === "GL" ? "Garis Lurus (Straight Line)" : "Saldo Menurun (Double Declining)";
    const rulePajak = GOLONGAN_RULES[data.selectedGolongan as GolonganKey];
    
    drawRow("Metode Akuntansi (SAK)", `: ${getMetodeName(data.metodeSAK)}`);
    drawRow("Masa Manfaat / Nilai Residu (SAK)", `: ${data.masaManfaatSAK} Tahun / ${formatRupiah(data.nilaiResiduSAK)}`);
    drawRow("Golongan Pajak (Fiskal)", `: ${rulePajak?.name || data.selectedGolongan}`);
    drawRow("Masa Manfaat & Metode Pajak", `: ${rulePajak?.years || 8} Tahun / ${getMetodeName(data.metodePajak)}`);

    // Section 3: Jurnal Penyesuaian
    currentY = 152;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 145, 155);
    doc.text("3. Jurnal Penyesuaian Akhir Tahun Ke-1 (Komersial)", 15, currentY);

    currentY += 3;
    doc.setFillColor(59, 145, 155);
    doc.rect(15, currentY, 180, 7, "F");
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Keterangan / Akun", 20, currentY + 4.5);
    doc.text("Ref", 110, currentY + 4.5);
    doc.text("Debit (Rp)", 135, currentY + 4.5);
    doc.text("Kredit (Rp)", 165, currentY + 4.5);

    currentY += 7;
    doc.setTextColor(50, 50, 50);
    doc.setDrawColor(210, 210, 210);
    
    // Row 1: Debit
    doc.rect(15, currentY, 180, 7);
    doc.setFont("helvetica", "normal");
    doc.text("Beban Penyusutan Aset Tetap", 20, currentY + 4.5);
    doc.text("5-101", 110, currentY + 4.5);
    doc.text(formatRupiah(data.bebanSAKThn1), 135, currentY + 4.5);
    doc.text("-", 165, currentY + 4.5);

    currentY += 7;
    // Row 2: Kredit
    doc.rect(15, currentY, 180, 7);
    doc.text("   Akumulasi Penyusutan Aset Tetap", 20, currentY + 4.5);
    doc.text("1-201", 110, currentY + 4.5);
    doc.text("-", 135, currentY + 4.5);
    doc.text(formatRupiah(data.bebanSAKThn1), 165, currentY + 4.5);

    currentY += 7;
    // Row 3: Total
    doc.rect(15, currentY, 180, 7);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 20, currentY + 4.5);
    doc.text("", 110, currentY + 4.5);
    doc.text(formatRupiah(data.bebanSAKThn1), 135, currentY + 4.5);
    doc.text(formatRupiah(data.bebanSAKThn1), 165, currentY + 4.5);

    // Section 4: Rekonsiliasi
    currentY = 188;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 145, 155);
    doc.text("4. Rekonsiliasi Depresiasi Tahun Pertama (Komersial vs Pajak)", 15, currentY);

    currentY += 3;
    doc.setFillColor(248, 249, 250);
    doc.rect(15, currentY, 180, 22, "FD");

    currentY += 5.5;
    doc.setFontSize(9);
    drawRow("Penyusutan Komersial (SAK)", `: ${formatRupiah(data.bebanSAKThn1)}`);
    drawRow("Penyusutan Fiskal (Pajak)", `: ${formatRupiah(data.bebanPajakThn1)}`);
    const selisihVal = Math.abs(data.bebanSAKThn1 - data.bebanPajakThn1);
    const koreksiTipe = data.bebanSAKThn1 > data.bebanPajakThn1 ? "Koreksi Fiskal Positif" : "Koreksi Fiskal Negatif";
    drawRow("Selisih Rekonsiliasi (Beda Waktu)", `: ${formatRupiah(selisihVal)} (${koreksiTipe})`);

    // Section 5: Comparative Table
    currentY = 222;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 145, 155);
    doc.text("5. Jadwal Penyusutan Komparatif (Beban per Tahun)", 15, currentY);

    currentY += 3;
    doc.setFillColor(59, 145, 155);
    doc.rect(15, currentY, 180, 6, "F");

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Tahun", 18, currentY + 4.5);
    doc.text("Beban Akuntansi (SAK)", 45, currentY + 4.5);
    doc.text("Nilai Buku SAK", 95, currentY + 4.5);
    doc.text("Beban Pajak (Fiskal)", 135, currentY + 4.5);
    doc.text("Nilai Buku Pajak", 168, currentY + 4.5);

    currentY += 6;
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);

    const maxLines = Math.max(data.tabelSAK?.length || 0, data.tabelPajak?.length || 0);
    const printLines = Math.min(maxLines, 5);

    for (let i = 0; i < printLines; i++) {
      const sakRowObj = data.tabelSAK?.[i];
      const pajakRowObj = data.tabelPajak?.[i];

      doc.rect(15, currentY, 180, 5.5);
      doc.text(`Thn ${i + 1}`, 18, currentY + 4);
      doc.text(sakRowObj ? formatRupiah(sakRowObj.beban) : "-", 45, currentY + 4);
      doc.text(sakRowObj ? formatRupiah(sakRowObj.nilaiBuku) : "-", 95, currentY + 4);
      doc.text(pajakRowObj ? formatRupiah(pajakRowObj.beban) : "-", 135, currentY + 4);
      doc.text(pajakRowObj ? formatRupiah(pajakRowObj.nilaiBuku) : "-", 168, currentY + 4);
      currentY += 5.5;
    }

    if (maxLines > 5) {
      doc.rect(15, currentY, 180, 5);
      doc.setFont("helvetica", "italic");
      doc.text(`... (+ ${maxLines - 5} tahun berikutnya disembunyikan untuk kerapian halaman)`, 20, currentY + 3.5);
      currentY += 5;
    }

    // Footer
    currentY = 270;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, currentY, 195, currentY);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Laporan ini diunduh secara resmi melalui aplikasi CLICKASET.", 15, currentY + 4);
    doc.text("CLICKASET - Media Interaktif Pembelajaran Siklus Aset Tetap, Golongan Perpajakan, dan Jurnal Penyesuaian.", 15, currentY + 7.5);

    doc.setFont("helvetica", "normal");
    doc.text("Dokumen Sah & Digital", 195, currentY + 4, { align: "right" });
    
    const docFilename = `Laporan_ClickAset_${data.namaAset.replace(/\s+/g, "_")}.pdf`;
    doc.save(docFilename);
  };

  const handleDeleteHistory = (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat simulasi ini?")) return;
    
    const userJson = localStorage.getItem("clickaset_user");
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const userId = user.id || user.email || "guest";

    const historyKey = `clickaset_sim_history_${userId}`;
    const existingHistoryJson = localStorage.getItem(historyKey);
    if (!existingHistoryJson) return;

    const existingHistory = JSON.parse(existingHistoryJson);
    const updatedHistory = existingHistory.filter((item: any) => item.id !== id);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    
    refreshHistoryList();
  };

  const handleLoadHistory = (item: any) => {
    setNamaAset(item.namaAset);
    setTanggalBeli(item.tanggalBeli);
    setHargaBeli(item.hargaBeli);
    setBiayaKirim(item.biayaKirim);
    setBiayaBbn(item.biayaBbn);
    setTanggalPakai(item.tanggalPakai);
    setTanggalMulaiSusut(item.tanggalMulaiSusut);
    setSelectedGolongan(item.selectedGolongan);
    setMetodeSAK(item.metodeSAK || "GL");
    setMetodePajak(item.metodePajak || "GL");
    setNilaiResiduSAK(item.nilaiResiduSAK || 0);
    setMasaManfaatSAK(item.masaManfaatSAK || 8);
    setTabelSAK(item.tabelSAK || []);
    setTabelPajak(item.tabelPajak || []);
    
    // Set formatted inputs
    setHargaBeliInput(formatRibuan(item.hargaBeli));
    setBiayaKirimInput(formatRibuan(item.biayaKirim));
    setBiayaBbnInput(formatRibuan(item.biayaBbn));
    setNilaiResiduSAKInput(formatRibuan(item.nilaiResiduSAK));

    setJurnalDebitAkun("");
    setJurnalDebitNilai("");
    setJurnalKreditAkun("");
    setJurnalKreditNilai("");
    setJournalAttempt(false);
    setJournalSuccess(false);
    setJournalFeedback("");
    
    // Close modal
    setSelectedHistoryView(null);
    
    setStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-heading dark:text-white">
            Simulator Siklus Aset
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Perankan staf akuntansi dalam mengelola aset dari pembelian hingga jurnal penyesuaian (SAK vs Pajak).
          </p>
        </div>
        <button
          onClick={handleResetAll}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition"
        >
          <RotateCcw className="size-3.5" />
          Reset Simulasi
        </button>
      </div>

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
                  <input
                    type="date"
                    value={tanggalBeli}
                    onChange={(e) => setTanggalBeli(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition"
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
                      Biaya Balik Nama / BBN (Rp)
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
                  <span className="flex items-center gap-1"><Info className="size-3" /> Dealer CLICKASET</span>
                  <span className="flex items-center gap-1"><Building2 className="size-3" /> PT CLICKASET Jaya</span>
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
                      <Truck className="size-6 animate-pulse" />
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
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="size-4" />
                      Simulasi Pengiriman Aset
                    </button>
                  ) : isTruckMoving ? (
                    <span className="text-xs text-brand-400 font-semibold flex items-center gap-2 animate-pulse">
                      <Truck className="size-4 animate-bounce" /> Aset sedang dikirim ke perusahaan...
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
                  <input
                    type="date"
                    min={tanggalBeli}
                    value={tanggalPakai}
                    onChange={(e) => setTanggalPakai(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Tanggal aset fisik mulai digunakan secara aktif dalam operasional.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Tanggal Dimulai Penyusutan
                  </label>
                  <input
                    type="date"
                    min={tanggalBeli}
                    value={tanggalMulaiSusut}
                    onChange={(e) => setTanggalMulaiSusut(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 transition"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Saat aset siap digunakan (*available for use*) menurut ketentuan SAK.
                  </p>
                </div>
              </div>

              {/* Right Educational Details */}
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
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
                  <div className="bg-error-50 dark:bg-error-950/40 border border-error-100 dark:border-error-900 rounded-xl p-3 flex items-start gap-2 text-xs text-error-700 dark:text-error-400">
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
                  {(Object.keys(GOLONGAN_RULES) as GolonganKey[]).map((key) => {
                    const rule = GOLONGAN_RULES[key];
                    const isSelected = selectedGolongan === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleGuessGolongan(key)}
                        className={`text-left p-4 rounded-xl border transition-all text-sm flex flex-col justify-between hover:scale-[1.01] ${isSelected
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
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-gray-50 dark:bg-gray-900/30 space-y-4">
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
                    onChange={(e) => setMetodeSAK(e.target.value as "GL" | "SM")}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="GL">Garis Lurus (Straight Line)</option>
                    <option value="SM">Saldo Menurun Ganda (Double Declining)</option>
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
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none"
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
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none font-mono"
                      placeholder="Contoh: 10.000.000"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">
                  * Catatan: SAK membolehkan perusahaan menaksir masa manfaat dan nilai sisa secara realistis sesuai kondisi operasional.
                </p>
              </div>

              {/* Pajak Box */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-gray-50 dark:bg-gray-900/30 space-y-4">
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
                    <label className="block text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mb-1">
                      Masa Manfaat (Tahun)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${GOLONGAN_RULES[selectedGolongan as GolonganKey]?.years || 8} Tahun`}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mb-1">
                      Nilai Residu (Rp)
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Rp 0"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
              <div className="lg:col-span-7 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-4 min-h-[300px] flex flex-col justify-between">
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
                    className={`pb-2 text-sm font-semibold border-b-2 px-4 transition-all ${activeTabTable === "SAK"
                        ? "border-brand-500 text-brand-600 dark:text-brand-400"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      }`}
                  >
                    Akuntansi (SAK)
                  </button>
                  <button
                    onClick={() => setActiveTabTable("Pajak")}
                    className={`pb-2 text-sm font-semibold border-b-2 px-4 transition-all ${activeTabTable === "Pajak"
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
                        <th className="px-3 py-2 text-right">Nilai Buku</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTabTable === "SAK" ? (
                        tabelSAK.map((row) => (
                          <tr key={row.year} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-white text-center">{row.year} <span className="text-[9px] text-gray-400 font-normal">({row.months} bln)</span></td>
                            <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-300">{formatRupiah(row.beban)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-brand-600 dark:text-brand-400">{formatRupiah(row.nilaiBuku)}</td>
                          </tr>
                        ))
                      ) : (
                        tabelPajak.map((row) => (
                          <tr key={row.year} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-white text-center">{row.year} <span className="text-[9px] text-gray-400 font-normal">({row.months} bln)</span></td>
                            <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-300">{formatRupiah(row.beban)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(row.nilaiBuku)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Educational Box (Koreksi Fiskal) */}
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900 rounded-xl p-3 text-xs text-yellow-800 dark:text-yellow-400 space-y-1">
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
                <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-5">

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
                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Debited Account</label>
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
                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Nominal Debit (Rp)</label>
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
                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Credited Account</label>
                        <select
                          value={jurnalKreditAkun}
                          onChange={(e) => setJurnalKreditAkun(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white pl-4" // pl-4 to indicate indent credit
                        >
                          <option value="">-- Pilih Akun --</option>
                          <option value="kas">Kas / Bank</option>
                          <option value="aset_tetap">Aset Tetap ({namaAset})</option>
                          <option value="beban_penyusutan">Beban Penyusutan Aset Tetap</option>
                          <option value="akumulasi_penyusutan">Akumulasi Penyusutan Aset Tetap</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Nominal Kredit (Rp)</label>
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
                    <span className="text-xs text-gray-500">
                      Petunjuk: Gunakan beban komersial tahun pertama yaitu <strong>{formatRupiah(tabelSAK[0]?.beban || 0)}</strong>.
                    </span>
                    <button
                      onClick={handleVerifyJournal}
                      disabled={!jurnalDebitAkun || !jurnalKreditAkun || !jurnalDebitNilai}
                      className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                        : "bg-error-50 border-error-100 text-error-800 dark:bg-error-950/20 dark:border-error-900 dark:text-error-400"
                      }`}>
                      {journalSuccess ? <CheckCircle2 className="size-5 shrink-0 mt-0.5" /> : <AlertTriangle className="size-5 shrink-0 mt-0.5" />}
                      <div>
                        <span className="font-bold">{journalSuccess ? "Sukses!" : "Koreksi!"}</span>{" "}
                        {journalFeedback}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl p-4 text-xs text-blue-700 dark:text-blue-300">
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
              <div className="bg-success-50/50 dark:bg-success-950/10 border border-success-200 dark:border-success-900 rounded-2xl p-6 text-center space-y-6 max-w-xl mx-auto animate-zoomIn">
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
                  <h5 className="font-bold text-gray-700 dark:text-gray-200 border-b pb-1">
                    RINGKASAN SIKLUS ASET
                  </h5>
                  <div className="grid grid-cols-2 gap-y-1.5 text-gray-600 dark:text-gray-400">
                    <span>Nama Aset:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">{namaAset}</span>

                    <span>Total Harga Perolehan:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">{formatRupiah(totalPerolehan)}</span>

                    <span>Golongan Pajak:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">
                      {GOLONGAN_RULES[selectedGolongan as GolonganKey]?.name || "Kelompok 2"}
                    </span>

                    <span>Penyusutan SAK Thn 1:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">{formatRupiah(tabelSAK[0]?.beban || 0)}</span>

                    <span>Penyusutan Pajak Thn 1:</span>
                    <span className="font-semibold text-right text-gray-800 dark:text-white">{formatRupiah(tabelPajak[0]?.beban || 0)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleResetAll}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition shadow-md cursor-pointer"
                  >
                    Simulasi Aset Lain
                  </button>
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
              </div>
            )}
          </div>
        )}

        {/* BOTTOM NAVIGATION CONTROLS */}
        {!journalSuccess && (
          <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                  // Ensure name and purchase price is positive
                  if (namaAset && hargaBeli > 0) setStep(2);
                } else if (step === 2) {
                  // Ensure usage dates are logical
                  if (tanggalPakai >= tanggalBeli && tanggalMulaiSusut >= tanggalBeli) setStep(3);
                } else if (step === 3) {
                  // Ensure a tax group has been attempted
                  if (selectedGolongan) setStep(4);
                } else if (step === 4) {
                  // Continue to calculations
                  setStep(5);
                } else if (step === 5) {
                  // Continue to journal penyesuaian
                  setStep(6);
                }
              }}
              disabled={
                (step === 1 && (!namaAset || hargaBeli <= 0 || !truckDone)) ||
                (step === 2 && (tanggalPakai < tanggalBeli || tanggalMulaiSusut < tanggalBeli)) ||
                (step === 3 && !selectedGolongan)
              }
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Lanjut
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* RIWAYAT SIMULASI SECTION */}
      <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-2xl p-6 shadow-theme-md space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-900 pb-4">
          <div className="p-2 bg-brand-50 dark:bg-brand-950/30 text-brand-500 rounded-lg">
            <History className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white font-heading">
              Riwayat Simulasi Aset Anda
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pantau, muat kembali, atau unduh laporan PDF resmi dari simulasi siklus aset yang telah selesai.
            </p>
          </div>
        </div>

        {(() => {
          const userJson = localStorage.getItem("clickaset_user");
          const user = userJson ? JSON.parse(userJson) : null;

          if (user) {
            if (historyList.length === 0) {
              return (
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
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyList.map((item) => (
                  <div 
                    key={item.id} 
                    className="border border-gray-100 dark:border-gray-800 rounded-xl p-5 bg-gray-50/30 dark:bg-gray-900/10 space-y-4 hover:shadow-theme-xs transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">
                          {item.namaAset}
                        </h4>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Perolehan:</span>
                        <span className="font-semibold text-right text-gray-700 dark:text-gray-300">
                          {formatRupiah(item.totalPerolehan)}
                        </span>

                        <span>Golongan Pajak:</span>
                        <span className="font-semibold text-right text-gray-700 dark:text-gray-300">
                          {GOLONGAN_RULES[item.selectedGolongan as GolonganKey]?.name.split(" ")[0] || item.selectedGolongan}
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
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-1.5 border border-red-100 dark:border-red-950/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg transition cursor-pointer"
                        title="Hapus Riwayat"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          } else {
            return (
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
                <a
                  href="/signin"
                  className="inline-block px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  Masuk Sekarang
                </a>
              </div>
            );
          }
        })()}
      </div>

      {/* RIWAYAT SIMULASI DETAIL VIEW MODAL */}
      {selectedHistoryView && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white font-heading">
                  Detail Laporan: {selectedHistoryView.namaAset}
                </h3>
                <p className="text-xs text-gray-500">
                  Riwayat simulasi diselesaikan pada {new Date(selectedHistoryView.timestamp).toLocaleString("id-ID")}
                </p>
              </div>
              <button
                onClick={() => setSelectedHistoryView(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 transition cursor-pointer"
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
                    <span className="font-semibold text-right">{selectedHistoryView.metodeSAK === "GL" ? "Garis Lurus" : "Saldo Menurun"}</span>
                    <span>Masa Manfaat (SAK):</span>
                    <span className="font-semibold text-right">{selectedHistoryView.masaManfaatSAK} Tahun</span>
                    <span>Nilai Residu (SAK):</span>
                    <span className="font-semibold text-right">{formatRupiah(selectedHistoryView.nilaiResiduSAK)}</span>
                    <span>Golongan Pajak:</span>
                    <span className="font-semibold text-right">{GOLONGAN_RULES[selectedHistoryView.selectedGolongan as GolonganKey]?.name || selectedHistoryView.selectedGolongan}</span>
                    <span>Masa Manfaat Pajak:</span>
                    <span className="font-semibold text-right">{GOLONGAN_RULES[selectedHistoryView.selectedGolongan as GolonganKey]?.years || 8} Tahun</span>
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
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                      <tr>
                        <td className="p-2 pl-4 text-gray-800 dark:text-white">Beban Penyusutan Aset Tetap</td>
                        <td className="p-2 text-center text-gray-500">5-101</td>
                        <td className="p-2 text-right pr-4 text-gray-800 dark:text-white">{formatRupiah(selectedHistoryView.bebanSAKThn1)}</td>
                        <td className="p-2 text-right pr-4 text-gray-400">-</td>
                      </tr>
                      <tr>
                        <td className="p-2 pl-8 text-gray-800 dark:text-white">Akumulasi Penyusutan Aset Tetap</td>
                        <td className="p-2 text-center text-gray-500">1-201</td>
                        <td className="p-2 text-right pr-4 text-gray-400">-</td>
                        <td className="p-2 text-right pr-4 text-gray-800 dark:text-white">{formatRupiah(selectedHistoryView.bebanSAKThn1)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Recharts Chart of Book Value */}
              {selectedHistoryView.chartData && selectedHistoryView.chartData.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-3">
                  <h4 className="font-bold text-brand-500 text-xs uppercase tracking-wider">
                    Grafik Penurunan Nilai Buku
                  </h4>
                  <div className="w-full h-[220px] text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedHistoryView.chartData}>
                        <XAxis dataKey="year" stroke="#9ca3af" />
                        <YAxis 
                          stroke="#9ca3af" 
                          tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}jt`}
                        />
                        <Tooltip 
                          formatter={(value: any) => formatRupiah(Number(value))}
                          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="SAK Nilai Buku" 
                          stroke="#465fff" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Pajak Nilai Buku" 
                          stroke="#10b981" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* 4. Comparative Schedule Table */}
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
                            <tr key={idx} className="hover:bg-gray-100/50 dark:hover:bg-gray-800/20 font-medium">
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
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 text-xs">
              <button
                onClick={() => handleLoadHistory(selectedHistoryView)}
                className="w-full sm:w-auto px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition cursor-pointer"
              >
                Gunakan Parameter di Simulator
              </button>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
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

    </div>
  );
};

export default Simulasi;
