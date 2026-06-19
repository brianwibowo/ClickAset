import React, { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { jsPDF } from "jspdf";
import { SimulationSteps } from "../components/simulasi/SimulationSteps";
import { SimulationHistory } from "../components/simulasi/SimulationHistory";
import { supabase } from "../utils/supabaseClient";
import { showLoading, hideLoading } from "../utils/loader";

// Types
interface SAKRow {
  year: number;
  months: number;
  hargaPerolehan: number;
  beban: number;
  akumulasi: number;
  nilaiBuku: number;
  volume?: number;
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
  const [metodeSAK, setMetodeSAK] = useState<"GL" | "SM" | "JAT" | "SJK" | "SHP">("GL");
  const [metodePajak, setMetodePajak] = useState<"GL" | "SM">("GL");
  const [nilaiResiduSAK, setNilaiResiduSAK] = useState<number>(10000000);
  const [masaManfaatSAK, setMasaManfaatSAK] = useState<number>(8);
  const [nilaiResiduSAKInput, setNilaiResiduSAKInput] = useState<string>("10.000.000");

  // SJK (Service Hours) and SHP (Productive Output) inputs
  const [totalKapasitasJam, setTotalKapasitasJam] = useState<number>(20000);
  const [totalKapasitasJamInput, setTotalKapasitasJamInput] = useState<string>("20.000");
  const [jamTahun1, setJamTahun1] = useState<number>(3000);
  const [jamTahun1Input, setJamTahun1Input] = useState<string>("3.000");

  const [totalKapasitasProduksi, setTotalKapasitasProduksi] = useState<number>(50000);
  const [totalKapasitasProduksiInput, setTotalKapasitasProduksiInput] = useState<string>("50.000");
  const [produksiTahun1, setProduksiTahun1] = useState<number>(8000);
  const [produksiTahun1Input, setProduksiTahun1Input] = useState<string>("8.000");

  // Yearly arrays for SJK and SHP
  const [jamKerjaPerTahun, setJamKerjaPerTahun] = useState<number[]>(Array(8).fill(0));
  const [jamKerjaPerTahunInput, setJamKerjaPerTahunInput] = useState<string[]>(Array(8).fill(""));
  const [produksiPerTahun, setProduksiPerTahun] = useState<number[]>(Array(8).fill(0));
  const [produksiPerTahunInput, setProduksiPerTahunInput] = useState<string[]>(Array(8).fill(""));

  // Modal Confirmation states
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

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

  // Reflection state
  const [refleksiSaved, setRefleksiSaved] = useState<boolean>(false);
  const [currentSimHistoryId, setCurrentSimHistoryId] = useState<string>("");

  // Simulation History state
  const [historyList, setHistoryList] = useState<any[]>([]);

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
  }, [
    step,
    metodeSAK,
    metodePajak,
    nilaiResiduSAK,
    masaManfaatSAK,
    selectedGolongan,
    jamKerjaPerTahun,
    produksiPerTahun
  ]);

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

  // Synchronize arrays when masaManfaatSAK changes
  useEffect(() => {
    setJamKerjaPerTahun((prev) => {
      const newArr = [...prev];
      if (newArr.length < masaManfaatSAK) {
        while (newArr.length < masaManfaatSAK) newArr.push(0);
      } else if (newArr.length > masaManfaatSAK) {
        newArr.splice(masaManfaatSAK);
      }
      return newArr;
    });

    setJamKerjaPerTahunInput((prev) => {
      const newArr = [...prev];
      if (newArr.length < masaManfaatSAK) {
        while (newArr.length < masaManfaatSAK) newArr.push("");
      } else if (newArr.length > masaManfaatSAK) {
        newArr.splice(masaManfaatSAK);
      }
      return newArr;
    });

    setProduksiPerTahun((prev) => {
      const newArr = [...prev];
      if (newArr.length < masaManfaatSAK) {
        while (newArr.length < masaManfaatSAK) newArr.push(0);
      } else if (newArr.length > masaManfaatSAK) {
        newArr.splice(masaManfaatSAK);
      }
      return newArr;
    });

    setProduksiPerTahunInput((prev) => {
      const newArr = [...prev];
      if (newArr.length < masaManfaatSAK) {
        while (newArr.length < masaManfaatSAK) newArr.push("");
      } else if (newArr.length > masaManfaatSAK) {
        newArr.splice(masaManfaatSAK);
      }
      return newArr;
    });
  }, [masaManfaatSAK]);

  // Auto-calculate total capacity and first year capacity from yearly inputs
  useEffect(() => {
    const totalJam = jamKerjaPerTahun.reduce((sum, val) => sum + val, 0);
    setTotalKapasitasJam(totalJam);
    setTotalKapasitasJamInput(formatRibuan(totalJam));
    
    const j1 = jamKerjaPerTahun[0] || 0;
    setJamTahun1(j1);
    setJamTahun1Input(formatRibuan(j1));
  }, [jamKerjaPerTahun]);

  useEffect(() => {
    const totalProd = produksiPerTahun.reduce((sum, val) => sum + val, 0);
    setTotalKapasitasProduksi(totalProd);
    setTotalKapasitasProduksiInput(formatRibuan(totalProd));

    const p1 = produksiPerTahun[0] || 0;
    setProduksiTahun1(p1);
    setProduksiTahun1Input(formatRibuan(p1));
  }, [produksiPerTahun]);

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
    let currentYearSAK = startYearSAK;

    const annualDeps: number[] = [];
    const base = perolehan - residuSAK;

    if (metodeSAK === "GL") {
      const depVal = base / nSAK;
      for (let k = 1; k <= nSAK; k++) {
        annualDeps.push(depVal);
      }
    } else if (metodeSAK === "SM") {
      let tempBv = perolehan;
      const rate = 2 / nSAK;
      for (let k = 1; k <= nSAK; k++) {
        if (k === nSAK) {
          annualDeps.push(tempBv - residuSAK);
        } else {
          const depVal = Math.min(tempBv - residuSAK, tempBv * rate);
          annualDeps.push(depVal);
          tempBv -= depVal;
        }
      }
    } else if (metodeSAK === "JAT") {
      const sumDigits = (nSAK * (nSAK + 1)) / 2;
      for (let k = 1; k <= nSAK; k++) {
        const depVal = base * ((nSAK - k + 1) / sumDigits);
        annualDeps.push(depVal);
      }
    } else if (metodeSAK === "SJK") {
      const totalHrs = jamKerjaPerTahun.reduce((sum, val) => sum + val, 0) || 1;
      const rate = base / totalHrs;
      for (let k = 1; k <= nSAK; k++) {
        const yrHrs = jamKerjaPerTahun[k - 1] || 0;
        annualDeps.push(yrHrs * rate);
      }
    } else if (metodeSAK === "SHP") {
      const totalProd = produksiPerTahun.reduce((sum, val) => sum + val, 0) || 1;
      const rate = base / totalProd;
      for (let k = 1; k <= nSAK; k++) {
        const yrProd = produksiPerTahun[k - 1] || 0;
        annualDeps.push(yrProd * rate);
      }
    }

    const y1MonthsSAK = 13 - startMonthSAK;
    let remainingMonthsSAK = nSAK * 12;
    let calYearIdx = 0;
    
    while (remainingMonthsSAK > 0) {
      const months = (calYearIdx === 0 && startMonthSAK > 1) ? y1MonthsSAK : Math.min(12, remainingMonthsSAK);
      let beban = 0;
      
      if (startMonthSAK === 1) {
        beban = annualDeps[calYearIdx] || 0;
      } else {
        if (calYearIdx === 0) {
          beban = (annualDeps[0] || 0) * (y1MonthsSAK / 12);
        } else {
          const prevYrPart = (annualDeps[calYearIdx - 1] || 0) * ((12 - y1MonthsSAK) / 12);
          const currYrPart = (annualDeps[calYearIdx] || 0) * (y1MonthsSAK / 12);
          beban = prevYrPart + currYrPart;
        }
      }
      
      if (beban > bvSAK - residuSAK) {
        beban = bvSAK - residuSAK;
      }
      if (beban < 0) beban = 0;
      
      accumSAK += beban;
      bvSAK -= beban;
      remainingMonthsSAK -= months;
      
      let volume = 0;
      if (metodeSAK === "SJK") {
        if (startMonthSAK === 1) {
          volume = jamKerjaPerTahun[calYearIdx] || 0;
        } else {
          if (calYearIdx === 0) {
            volume = (jamKerjaPerTahun[0] || 0) * (y1MonthsSAK / 12);
          } else {
            const prevYrPart = (jamKerjaPerTahun[calYearIdx - 1] || 0) * ((12 - y1MonthsSAK) / 12);
            const currYrPart = (jamKerjaPerTahun[calYearIdx] || 0) * (y1MonthsSAK / 12);
            volume = prevYrPart + currYrPart;
          }
        }
      } else if (metodeSAK === "SHP") {
        if (startMonthSAK === 1) {
          volume = produksiPerTahun[calYearIdx] || 0;
        } else {
          if (calYearIdx === 0) {
            volume = (produksiPerTahun[0] || 0) * (y1MonthsSAK / 12);
          } else {
            const prevYrPart = (produksiPerTahun[calYearIdx - 1] || 0) * ((12 - y1MonthsSAK) / 12);
            const currYrPart = (produksiPerTahun[calYearIdx] || 0) * (y1MonthsSAK / 12);
            volume = prevYrPart + currYrPart;
          }
        }
      }

      sakRows.push({
        year: currentYearSAK,
        months,
        hargaPerolehan: perolehan,
        beban: Math.round(beban),
        akumulasi: Math.round(accumSAK),
        nilaiBuku: Math.max(residuSAK, Math.round(bvSAK)),
        volume: (metodeSAK === "SJK" || metodeSAK === "SHP") ? Math.round(volume) : undefined
      });
      
      currentYearSAK += 1;
      calYearIdx += 1;
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

      // Play victory sound effect
      const audio = new Audio("/src/assets/Yayyy! Sound Effect.mp3");
      audio.play().catch(err => console.log("Play audio error:", err));
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
    setRefleksiSaved(false);
    setCurrentSimHistoryId("");

    setTotalKapasitasJam(20000);
    setTotalKapasitasJamInput("20.000");
    setJamTahun1(3000);
    setJamTahun1Input("3.000");
    setTotalKapasitasProduksi(50000);
    setTotalKapasitasProduksiInput("50.000");
    setProduksiTahun1(8000);
    setProduksiTahun1Input("8.000");
    setJamKerjaPerTahun(Array(8).fill(0));
    setJamKerjaPerTahunInput(Array(8).fill(""));
    setProduksiPerTahun(Array(8).fill(0));
    setProduksiPerTahunInput(Array(8).fill(""));

    // Reset formatted inputs
    setHargaBeliInput("240.000.000");
    setBiayaKirimInput("5.000.000");
    setBiayaBbnInput("5.000.000");
    setNilaiResiduSAKInput("10.000.000");
  };

  const refreshHistoryList = async () => {
    const userJson = localStorage.getItem("clickaset_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      const isGuru = user.role === "GURU";

      showLoading("Memuat riwayat simulasi...");
      try {
        if (isGuru) {
          // Fetch all users to resolve names for legacy or updated history items
          let allDbUsers: any[] = [];
          try {
            const { data: dbUsers } = await supabase.from("users").select("*");
            allDbUsers = dbUsers || [];
          } catch (e) {
            console.warn("Could not fetch users to resolve names in history:", e);
          }

          // Guru: Fetch all simulation histories from Supabase database
          let dbHistory: any[] = [];
          try {
            const { data: dbHist } = await supabase.from("simulation_history").select("*");
            dbHistory = dbHist || [];
          } catch (e) {
            console.warn("Could not fetch simulation history from database:", e);
          }

          // Guru: scan all student history keys in localStorage (to merge)
          const localHistoryMap: Record<string, any> = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("clickaset_sim_history_")) {
              try {
                const userId = key.replace("clickaset_sim_history_", "");
                const items = JSON.parse(localStorage.getItem(key) || "[]");
                items.forEach((item: any) => {
                  localHistoryMap[item.id] = { ...item, userId };
                });
              } catch { /* skip corrupted */ }
            }
          }

          const combinedMap: Record<string, any> = {};
          const isUuid = (str: string) => /^[0-9a-fA-F-]{36}$/.test(str);

          // Process local items first
          Object.entries(localHistoryMap).forEach(([id, item]) => {
            const userId = item.userId;
            const dbUser = allDbUsers.find(
              (u: any) => String(u.id) === String(userId) || u.username.toLowerCase() === userId.toLowerCase()
            );
            const resolvedUsername = dbUser?.username || item.studentUsername || (userId && userId !== "guest" && !isUuid(userId) ? userId : "");
            const rawName = item.studentName || dbUser?.full_name || dbUser?.username || userId;
            const resolvedName = (rawName === "Siswa" || isUuid(rawName))
              ? (dbUser?.full_name || dbUser?.username || resolvedUsername || "Siswa")
              : rawName;

            combinedMap[id] = {
              ...item,
              studentId: item.studentId || userId,
              studentName: resolvedName,
              studentUsername: resolvedUsername
            };
          });

          // Overlay with database items (remote database has precedence)
          dbHistory.forEach((item: any) => {
            const userId = item.studentId || "";
            const dbUser = allDbUsers.find(
              (u: any) => String(u.id) === String(userId) || (item.studentUsername && u.username.toLowerCase() === item.studentUsername.toLowerCase())
            );
            const resolvedUsername = item.studentUsername || dbUser?.username || "";
            const resolvedName = item.studentName || dbUser?.full_name || dbUser?.username || "Siswa";

            combinedMap[item.id] = {
              ...item,
              studentId: userId || item.studentId,
              studentName: resolvedName,
              studentUsername: resolvedUsername
            };
          });

          const allHistory = Object.values(combinedMap);
          // Sort by most recent
          allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setHistoryList(allHistory);
        } else {
          // Siswa: own history from database + localStorage
          const userId = user.id || user.email || user.username || "guest";
          const historyKey = `clickaset_sim_history_${userId}`;
          
          let dbHistory: any[] = [];
          if (userId !== "guest") {
            try {
              const { data: dbHist } = await supabase.from("simulation_history").select("*").eq("studentId", userId);
              dbHistory = dbHist || [];
            } catch (e) {
              console.warn("Could not fetch own history from database:", e);
            }
          }

          let localHistory: any[] = [];
          const existingHistoryJson = localStorage.getItem(historyKey);
          if (existingHistoryJson) {
            try {
              localHistory = JSON.parse(existingHistoryJson);
            } catch {
              localHistory = [];
            }
          }

          const combinedMap: Record<string, any> = {};
          localHistory.forEach((item: any) => {
            combinedMap[item.id] = {
              ...item,
              studentName: item.studentName || user.full_name || "Siswa",
              studentUsername: item.studentUsername || user.username || "",
              studentId: item.studentId || userId
            };
          });

          dbHistory.forEach((item: any) => {
            combinedMap[item.id] = {
              ...item,
              studentName: item.studentName || user.full_name || "Siswa",
              studentUsername: item.studentUsername || user.username || "",
              studentId: item.studentId || userId
            };
          });

          const finalHistory = Object.values(combinedMap);
          finalHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setHistoryList(finalHistory);
        }
      } catch (err) {
        console.error("Gagal merefresh riwayat simulasi:", err);
      } finally {
        hideLoading();
      }
    } else {
      setHistoryList([]);
    }
  };

  const saveSimulationToHistory = async () => {
    const userJson = localStorage.getItem("clickaset_user");
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const userId = user.id || user.email || user.username || "guest";

    const historyKey = `clickaset_sim_history_${userId}`;
    const existingHistoryJson = localStorage.getItem(historyKey);
    const existingHistory = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];

    const newId = "sim-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
    const newHistoryItem = {
      id: newId,
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
      jamKerjaPerTahun,
      produksiPerTahun,
      bebanSAKThn1: tabelSAK[0]?.beban || 0,
      bebanPajakThn1: tabelPajak[0]?.beban || 0,
      tabelSAK,
      tabelPajak,
      chartData,
      // Reflection & identity metadata
      studentName: user.full_name || user.username || "Siswa",
      studentUsername: user.username || "",
      studentId: userId,
      refleksi: null,
      komentar: []
    };

    setCurrentSimHistoryId(newId);

    // Save locally
    const updatedHistory = [newHistoryItem, ...existingHistory];
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

    // Save to database if logged in and not guest
    if (userId !== "guest") {
      try {
        const isUuid = (str: string) => /^[0-9a-fA-F-]{36}$/.test(str);
        const dbPayload = {
          ...newHistoryItem,
          studentId: isUuid(userId) ? userId : null
        };
        await supabase.from("simulation_history").insert(dbPayload);
      } catch (err) {
        console.error("Gagal menyimpan ke database Supabase:", err);
      }
    }

    refreshHistoryList();
  };

  const handleSaveReflection = async (text: string) => {
    const userJson = localStorage.getItem("clickaset_user");
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const userId = user.id || user.email || user.username || "guest";
    const historyKey = `clickaset_sim_history_${userId}`;
    const existingHistoryJson = localStorage.getItem(historyKey);
    if (!existingHistoryJson) return;

    const existingHistory = JSON.parse(existingHistoryJson);
    const updatedHistory = existingHistory.map((item: any) => {
      if (item.id === currentSimHistoryId) {
        return {
          ...item,
          refleksi: {
            text,
            submittedAt: new Date().toISOString()
          }
        };
      }
      return item;
    });

    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

    // Save reflection to remote database if logged in
    if (userId !== "guest") {
      try {
        await supabase.from("simulation_history").update({
          refleksi: {
            text,
            submittedAt: new Date().toISOString()
          }
        }).eq("id", currentSimHistoryId);
      } catch (err) {
        console.error("Gagal mengupdate refleksi di database:", err);
      }
    }

    setRefleksiSaved(true);
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
    doc.text("ClickAsset", 15, 23);

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
    doc.text("Author: ClickAsset Education Team", 195, 29, { align: "right" });

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
    const hasCapacity = data.metodeSAK === "SJK" || data.metodeSAK === "SHP";
    doc.rect(15, currentY, 180, hasCapacity ? 36 : 28, "FD");

    currentY += 6;
    const getMetodeName = (code: string) => {
      switch (code) {
        case "GL": return "Garis Lurus (Straight Line)";
        case "SM": return "Saldo Menurun (Double Declining)";
        case "JAT": return "Jumlah Angka Tahun (Sum-of-the-Years-Digits)";
        case "SJK": return "Satuan Hasil Kerja (Service Hours)";
        case "SHP": return "Satuan Hasil Produksi (Productive Output)";
        default: return code;
      }
    };
    const rulePajak = GOLONGAN_RULES[data.selectedGolongan as GolonganKey];
    
    drawRow("Metode Akuntansi (SAK)", `: ${getMetodeName(data.metodeSAK)}`);
    drawRow("Masa Manfaat / Nilai Residu (SAK)", `: ${data.masaManfaatSAK} Tahun / ${formatRupiah(data.nilaiResiduSAK)}`);
    if (data.metodeSAK === "SJK") {
      drawRow("Taksiran Jam Kerja (Total / Thn 1)", `: ${formatRibuan(data.totalKapasitasJam || 20000)} Jam / ${formatRibuan(data.jamTahun1 || 3000)} Jam`);
    } else if (data.metodeSAK === "SHP") {
      drawRow("Taksiran Produksi (Total / Thn 1)", `: ${formatRibuan(data.totalKapasitasProduksi || 50000)} Unit / ${formatRibuan(data.produksiTahun1 || 8000)} Unit`);
    }
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

    for (let i = 0; i < maxLines; i++) {
      // Handle multi-page overflow for large tables
      if (currentY + 5.5 > 265) {
        doc.addPage();
        currentY = 15;

        // Print header comparison table on the new page
        doc.setFillColor(59, 145, 155);
        doc.rect(15, currentY, 180, 6, "F");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Tahun", 18, currentY + 4.5);
        doc.text("Beban Akuntansi (SAK)", 45, currentY + 4.5);
        doc.text("Nilai Buku SAK", 95, currentY + 4.5);
        doc.text("Beban Pajak (Fiskal)", 135, currentY + 4.5);
        doc.text("Nilai Buku Pajak", 168, currentY + 4.5);

        currentY += 6;
        doc.setFontSize(7.5);
        doc.setTextColor(50, 50, 50);
      }

      const sakRowObj = data.tabelSAK?.[i];
      const pajakRowObj = data.tabelPajak?.[i];

      doc.setFont("helvetica", "normal");
      doc.rect(15, currentY, 180, 5.5);
      doc.text(`Thn ${i + 1}`, 18, currentY + 4);
      doc.text(sakRowObj ? formatRupiah(sakRowObj.beban) : "-", 45, currentY + 4);
      doc.text(sakRowObj ? formatRupiah(sakRowObj.nilaiBuku) : "-", 95, currentY + 4);
      doc.text(pajakRowObj ? formatRupiah(pajakRowObj.beban) : "-", 135, currentY + 4);
      doc.text(pajakRowObj ? formatRupiah(pajakRowObj.nilaiBuku) : "-", 168, currentY + 4);
      currentY += 5.5;
    }

    // Footer
    currentY = 270;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, currentY, 195, currentY);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Laporan ini diunduh secara resmi melalui aplikasi ClickAsset.", 15, currentY + 4);
    doc.text("ClickAsset - Media Interaktif Pembelajaran Siklus Aset Tetap, Golongan Perpajakan, dan Jurnal Penyesuaian.", 15, currentY + 7.5);

    doc.setFont("helvetica", "normal");
    doc.text("Dokumen Sah & Digital", 195, currentY + 4, { align: "right" });
    
    const docFilename = `Laporan_ClickAsset_${data.namaAset.replace(/\s+/g, "_")}.pdf`;
    doc.save(docFilename);
  };

  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat simulasi ini?")) return;
    
    const userJson = localStorage.getItem("clickaset_user");
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const userId = user.id || user.email || "guest";

    const historyKey = `clickaset_sim_history_${userId}`;
    const existingHistoryJson = localStorage.getItem(historyKey);
    if (existingHistoryJson) {
      const existingHistory = JSON.parse(existingHistoryJson);
      const updatedHistory = existingHistory.filter((item: any) => item.id !== id);
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    }
    
    // Delete in Supabase if logged in
    if (userId !== "guest") {
      try {
        await supabase.from("simulation_history").delete().eq("id", id);
      } catch (e) {
        console.error("Gagal menghapus riwayat dari database:", e);
      }
    }
    
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

    setTotalKapasitasJam(item.totalKapasitasJam || 20000);
    setTotalKapasitasJamInput(formatRibuan(item.totalKapasitasJam || 20000));
    setJamTahun1(item.jamTahun1 || 3000);
    setJamTahun1Input(formatRibuan(item.jamTahun1 || 3000));
    setTotalKapasitasProduksi(item.totalKapasitasProduksi || 50000);
    setTotalKapasitasProduksiInput(formatRibuan(item.totalKapasitasProduksi || 50000));
    setProduksiTahun1(item.produksiTahun1 || 8000);
    setProduksiTahun1Input(formatRibuan(item.produksiTahun1 || 8000));

    const loadedJam = item.jamKerjaPerTahun || [];
    if (loadedJam.length === 0) {
      const totalHrs = item.totalKapasitasJam || 20000;
      const hrsY1 = item.jamTahun1 || 3000;
      const nSAK = item.masaManfaatSAK || 8;
      const jamArr = [hrsY1];
      if (nSAK > 1) {
        const remainingHrs = Math.max(0, totalHrs - hrsY1);
        const wSum = (nSAK * (nSAK - 1)) / 2;
        for (let k = 2; k <= nSAK; k++) {
          const weight = nSAK - k + 1;
          const yrHrs = wSum > 0 ? Math.round((remainingHrs * weight) / wSum) : 0;
          jamArr.push(yrHrs);
        }
      }
      setJamKerjaPerTahun(jamArr);
      setJamKerjaPerTahunInput(jamArr.map((v: number) => formatRibuan(v)));
    } else {
      setJamKerjaPerTahun(loadedJam);
      setJamKerjaPerTahunInput(loadedJam.map((v: number) => formatRibuan(v)));
    }

    const loadedProd = item.produksiPerTahun || [];
    if (loadedProd.length === 0) {
      const totalProd = item.totalKapasitasProduksi || 50000;
      const prodY1 = item.produksiTahun1 || 8000;
      const nSAK = item.masaManfaatSAK || 8;
      const prodArr = [prodY1];
      if (nSAK > 1) {
        const remainingProd = Math.max(0, totalProd - prodY1);
        const wSum = (nSAK * (nSAK - 1)) / 2;
        for (let k = 2; k <= nSAK; k++) {
          const weight = nSAK - k + 1;
          const yrProd = wSum > 0 ? Math.round((remainingProd * weight) / wSum) : 0;
          prodArr.push(yrProd);
        }
      }
      setProduksiPerTahun(prodArr);
      setProduksiPerTahunInput(prodArr.map((v: number) => formatRibuan(v)));
    } else {
      setProduksiPerTahun(loadedProd);
      setProduksiPerTahunInput(loadedProd.map((v: number) => formatRibuan(v)));
    }
    
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
        {step < 6 && (
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            Reset Simulasi
          </button>
        )}
      </div>

      <SimulationSteps
        step={step}
        setStep={setStep}
        namaAset={namaAset}
        setNamaAset={setNamaAset}
        tanggalBeli={tanggalBeli}
        setTanggalBeli={setTanggalBeli}
        hargaBeli={hargaBeli}
        setHargaBeli={setHargaBeli}
        biayaKirim={biayaKirim}
        setBiayaKirim={setBiayaKirim}
        biayaBbn={biayaBbn}
        setBiayaBbn={setBiayaBbn}
        totalPerolehan={totalPerolehan}
        hargaBeliInput={hargaBeliInput}
        setHargaBeliInput={setHargaBeliInput}
        biayaKirimInput={biayaKirimInput}
        setBiayaKirimInput={setBiayaKirimInput}
        biayaBbnInput={biayaBbnInput}
        setBiayaBbnInput={setBiayaBbnInput}
        isTruckMoving={isTruckMoving}
        truckDone={truckDone}
        runPurchaseSimulation={runPurchaseSimulation}
        tanggalPakai={tanggalPakai}
        setTanggalPakai={setTanggalPakai}
        tanggalMulaiSusut={tanggalMulaiSusut}
        setTanggalMulaiSusut={setTanggalMulaiSusut}
        selectedGolongan={selectedGolongan}
        hasAttemptedGolongan={hasAttemptedGolongan}
        golonganFeedback={golonganFeedback}
        handleGuessGolongan={handleGuessGolongan}
        metodeSAK={metodeSAK}
        setMetodeSAK={setMetodeSAK}
        metodePajak={metodePajak}
        setMetodePajak={setMetodePajak}
        nilaiResiduSAK={nilaiResiduSAK}
        setNilaiResiduSAK={setNilaiResiduSAK}
        masaManfaatSAK={masaManfaatSAK}
        setMasaManfaatSAK={setMasaManfaatSAK}
        nilaiResiduSAKInput={nilaiResiduSAKInput}
        setNilaiResiduSAKInput={setNilaiResiduSAKInput}
        totalKapasitasJam={totalKapasitasJam}
        setTotalKapasitasJam={setTotalKapasitasJam}
        totalKapasitasJamInput={totalKapasitasJamInput}
        setTotalKapasitasJamInput={setTotalKapasitasJamInput}
        jamTahun1={jamTahun1}
        setJamTahun1={setJamTahun1}
        jamTahun1Input={jamTahun1Input}
        setJamTahun1Input={setJamTahun1Input}
        totalKapasitasProduksi={totalKapasitasProduksi}
        setTotalKapasitasProduksi={setTotalKapasitasProduksi}
        totalKapasitasProduksiInput={totalKapasitasProduksiInput}
        setTotalKapasitasProduksiInput={setTotalKapasitasProduksiInput}
        produksiTahun1={produksiTahun1}
        setProduksiTahun1={setProduksiTahun1}
        produksiTahun1Input={produksiTahun1Input}
        setProduksiTahun1Input={setProduksiTahun1Input}
        jamKerjaPerTahun={jamKerjaPerTahun}
        setJamKerjaPerTahun={setJamKerjaPerTahun}
        jamKerjaPerTahunInput={jamKerjaPerTahunInput}
        setJamKerjaPerTahunInput={setJamKerjaPerTahunInput}
        produksiPerTahun={produksiPerTahun}
        setProduksiPerTahun={setProduksiPerTahun}
        produksiPerTahunInput={produksiPerTahunInput}
        setProduksiPerTahunInput={setProduksiPerTahunInput}
        tabelSAK={tabelSAK}
        tabelPajak={tabelPajak}
        chartData={chartData}
        activeTabTable={activeTabTable}
        setActiveTabTable={setActiveTabTable}
        jurnalDebitAkun={jurnalDebitAkun}
        setJurnalDebitAkun={setJurnalDebitAkun}
        jurnalDebitNilai={jurnalDebitNilai}
        setJurnalDebitNilai={setJurnalDebitNilai}
        jurnalKreditAkun={jurnalKreditAkun}
        setJurnalKreditAkun={setJurnalKreditAkun}
        jurnalKreditNilai={jurnalKreditNilai}
        setJurnalKreditNilai={setJurnalKreditNilai}
        journalAttempt={journalAttempt}
        journalSuccess={journalSuccess}
        journalFeedback={journalFeedback}
        confettiParticles={confettiParticles}
        handleVerifyJournal={handleVerifyJournal}
        downloadSimulationPDF={downloadSimulationPDF}
        handleResetAll={handleResetAll}
        formatRupiah={formatRupiah}
        formatRibuan={formatRibuan}
        golonganRules={GOLONGAN_RULES}
        refleksiSaved={refleksiSaved}
        onSaveReflection={handleSaveReflection}
      />

      <SimulationHistory
        user={JSON.parse(localStorage.getItem("clickaset_user") || "null")}
        historyList={historyList}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
        downloadSimulationPDF={downloadSimulationPDF}
        formatRupiah={formatRupiah}
        golonganRules={GOLONGAN_RULES}
        onRefreshHistory={refreshHistoryList}
        highlightedId={refleksiSaved ? currentSimHistoryId : undefined}
      />

      {/* CUSTOM RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-950 border border-gray-205 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white font-heading">
                Reset Simulasi?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Apakah Anda yakin ingin me-reset simulasi ini? Semua langkah pengerjaan yang sedang berjalan akan diulang dari awal dan data yang belum disimpan akan hilang.
              </p>
            </div>
            <div className="flex justify-end gap-3 text-xs">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  handleResetAll();
                  setShowResetModal(false);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition cursor-pointer"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Simulasi;
