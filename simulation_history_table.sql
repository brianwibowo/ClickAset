-- SQL SCRIPT UNTUK MEMBUAT TABEL SIMULATION_HISTORY DI SUPABASE
-- Salin kode di bawah ini lalu jalankan di SQL Editor Supabase Anda.

CREATE TABLE IF NOT EXISTS public.simulation_history (
    "id" text PRIMARY KEY,
    "studentId" uuid REFERENCES public.users(id) ON DELETE CASCADE,
    "timestamp" timestamptz DEFAULT now(),
    "namaAset" text NOT NULL,
    "tanggalBeli" text NOT NULL,
    "hargaBeli" numeric NOT NULL,
    "biayaKirim" numeric NOT NULL,
    "biayaBbn" numeric NOT NULL,
    "totalPerolehan" numeric NOT NULL,
    "tanggalPakai" text NOT NULL,
    "tanggalMulaiSusut" text NOT NULL,
    "selectedGolongan" text NOT NULL,
    "metodeSAK" text NOT NULL,
    "metodePajak" text NOT NULL,
    "nilaiResiduSAK" numeric NOT NULL,
    "masaManfaatSAK" integer NOT NULL,
    "totalKapasitasJam" numeric,
    "jamTahun1" numeric,
    "totalKapasitasProduksi" numeric,
    "produksiTahun1" numeric,
    "jamKerjaPerTahun" jsonb,
    "produksiPerTahun" jsonb,
    "bebanSAKThn1" numeric NOT NULL,
    "bebanPajakThn1" numeric NOT NULL,
    "tabelSAK" jsonb NOT NULL,
    "tabelPajak" jsonb NOT NULL,
    "chartData" jsonb NOT NULL,
    "refleksi" jsonb DEFAULT NULL,
    "komentar" jsonb DEFAULT '[]'::jsonb,
    "studentName" text,
    "studentUsername" text
);

-- Mengaktifkan RLS (Row Level Security)
ALTER TABLE public.simulation_history ENABLE ROW LEVEL SECURITY;

-- Membuat Kebijakan RLS (Policy) agar semua orang dapat membaca & mengedit demi kemudahan testing/demo kuis/kelas
CREATE POLICY "Allow public read access" ON public.simulation_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.simulation_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.simulation_history FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.simulation_history FOR DELETE USING (true);
