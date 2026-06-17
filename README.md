# ClickAset

**ClickAset** adalah platform web pembelajaran interaktif berbasis game (*gamified interactive learning platform*) yang dirancang khusus untuk membantu siswa dan mahasiswa akuntansi di Indonesia memahami konsep **Penyesuaian Penyusutan Aset Tetap** berdasarkan **Standar Akuntansi Keuangan (SAK)** dan **Ketentuan Perpajakan (Fiskal) UU PPh**.

Aplikasi ini memadukan materi teoritis dinamis, simulasi siklus hidup aset 6 tahap, dan kuis edukasi multiplayer real-time untuk meningkatkan keterlibatan belajar siswa (*student engagement*).

---

## 🚀 Fitur Utama

### 1. Modul Materi Interaktif (Notion-Style Block Editor)
* **Editor berbasis Blok untuk Guru:** Memudahkan Guru mengelola materi pembelajaran secara granular dengan menambahkan, menghapus, atau memindahkan urutan blok (Teks Markdown, Embed Video YouTube, dan Dokumen PDF).
* **Tata Letak Dinamis (Top, Bottom, Side):** Media/PDF dapat diletakkan di atas, bawah, atau di samping teks (tampilan 2 kolom berdampingan pada perangkat desktop) untuk mempermudah membaca teori sembari menonton/membaca lampiran.
* **Unggah Dokumen Pintar:** Mendukung pengunggahan dokumen PDF langsung ke awan (Supabase Storage) atau konversi otomatis ke Base64 lokal jika server sedang offline.
* **Kompatibilitas Mundur:** Modul parser otomatis menyelaraskan format data lama menjadi struktur blok Notion-style tanpa memecah data yang sudah ada di database.

### 2. Simulator Siklus Aset (6 Tahap)
Siswa diajak mempraktikkan peran sebagai Staf Akuntansi perusahaan secara mendalam melalui alur wizard/stepper interaktif:
* **Tahap 1: Membeli Aset:** Input Nama Aset, Tanggal Perolehan, dan rincian harga perolehan (Harga Beli, Biaya Pengiriman, Biaya Balik Nama/BBN). Dilengkapi visualisasi animasi truk pengantar aset yang bergerak secara interaktif.
* **Tahap 2: Timeline Penggunaan:** Grafik waktu yang memetakan titik pembelian, pemakaian awal, dan mulainya penghitungan beban penyusutan secara proporsional.
* **Tahap 3: Klasifikasi Golongan Pajak:** Menentukan kelompok harta berwujud bukan bangunan (Kelompok 1-4) atau bangunan (Permanen/Semi-permanen) berdasarkan aturan perpajakan UU PPh Pasal 11.
* **Tahap 4: Metode Penyusutan:** Memilih dan membandingkan secara langsung dampak metode penyusutan (Garis Lurus vs Saldo Menurun) terhadap sisa umur manfaat dan nilai buku.
* **Tahap 5: Perhitungan & Grafik:** Menyajikan tabel akumulasi depresiasi tahunan dan grafik visual penurunan nilai buku menggunakan grafik garis interaktif **Recharts**. Dilengkapi perhitungan rekonsiliasi koreksi fiskal (beda waktu positif/negatif).
* **Tahap 6: Jurnal Penyesuaian:** Siswa menyusun entri jurnal penyesuaian penyusutan (Debit: Beban Penyusutan, Kredit: Akumulasi Penyusutan) dengan validasi keseimbangan debit-kredit dan kecocokan nominal hasil perhitungan.

### 3. Riwayat Simulasi & Ekspor Laporan PDF
* **Penyimpanan Riwayat Akun:** Menyimpan hasil akhir simulasi secara asinkron di penyimpanan lokal yang terikat dengan akun pengguna (`clickaset_sim_history_[userId]`). Untuk tamu, disediakan status terkunci (locked state) yang ramah agar mereka masuk log terlebih dahulu.
* **Kajian Ulang & Gunakan Parameter:** Riwayat dapat ditinjau ulang lewat modal pop-up visual (read-only) lengkap dengan grafik kurva penyusutan, dengan opsi tombol untuk memuat ulang parameter masa lalu langsung ke simulator utama.
* **Ekspor Laporan PDF Premium:** Menghasilkan dokumen laporan PDF menggunakan **jsPDF** yang terformat elegan. PDF dilengkapi **Kop Surat Resmi ClickAset**, detail harga perolehan, ringkasan perbandingan kebijakan akuntansi SAK vs Pajak, tabel Jurnal Penyesuaian, tabel Koreksi Fiskal, dan tabel depresiasi komparatif 5 tahun pertama.
* **Format Angka Rupiah Otomatis:** Memformat secara real-time nominal input angka finansial dengan tanda pemisah ribuan titik (titik desimal) khas Indonesia saat pengguna mengetik (misal: `250000` menjadi `250.000`), menjaga kerapian visual.

### 4. Kuis Edukasi Multiplayer Real-Time
* **Sinkronisasi Multiplayer:** Menggunakan Supabase Broadcast Channel untuk sinkronisasi real-time antar peramban, dengan otomatisasi fallback menggunakan LocalStorage Event-Broadcasting jika dijalankan secara luring.
* **Antarmuka Guru (Quiz Host):**
  * Ruang lobby kuis lengkap dengan kode PIN 6-digit yang dinamis.
  * Form pembuatan soal 2-kolom dengan **Live Student Preview** (guru langsung melihat bentuk tampilan soal di HP siswa saat sedang mengetik pertanyaan).
  * Penentuan kunci jawaban inline (cukup mengeklik tombol "Set Kunci" di sebelah input opsi jawaban) dan pemilihan durasi timer (10s, 20s, 30s, dst.).
  * Papan peringkat *Live Leaderboard* dan visual podium 3 besar saat kuis berakhir.
* **Antarmuka Siswa (Quiz Player):**
  * Tombol opsi ganda visual bertema game (Merah/▲, Biru/◆, Kuning/●, Hijau/■) dengan transisi hover glow responsif.
  * Perhitungan skor berdasarkan ketepatan jawaban (100 pt) ditambah bonus kecepatan menjawab (hingga +50 pt).
  * Layar skor akhir lengkap dengan persentase **Akurasi Jawaban** (misal: 3/4 Soal - 75%) dan feedback interpretasi performa.
  * **Review Board (Kajian Soal):** Papan pembahasan di akhir kuis agar siswa dapat membuka kembali tiap butir soal, melihat jawaban pribadinya, melihat jawaban yang benar, dan membaca pembahasan edukatifnya.

---

## 🛠️ Teknologi & Stack
* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
* **UI Components:** Preline UI (Wizard Stepper, Sidebars, Modals, Forms)
* **Grafik:** Recharts (responsive line charts)
* **PDF Engine:** jsPDF
* **Realtime & Database:** Supabase (PostgreSQL Database, Realtime Subscription, Storage, Auth)
* **Fallback System:** LocalStorage Database Engine (untuk skenario offline local development)

---

## 💻 Cara Menjalankan Aplikasi Secara Lokal

### 1. Prasyarat
Pastikan Anda telah memasang [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan) di komputer Anda.

### 2. Kloning dan Instalasi
Kloning repositori ini dan masuk ke direktori proyek:
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Salin berkas `.env.example` menjadi `.env` dan masukkan kredensial Supabase Anda jika ada:
```properties
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
*Catatan: Jika variabel di atas dibiarkan kosong, aplikasi akan berjalan secara luring menggunakan **Mock/LocalStorage Database Engine**.*

### 4. Menjalankan Server Pengembangan
Jalankan server lokal untuk memulai pengerjaan:
```bash
npm run dev
```
Aplikasi Anda akan berjalan secara default di tautan `http://localhost:5173`.

### 5. Build Produksi
Untuk melakukan bundel aplikasi untuk keperluan hosting/production:
```bash
npm run build
```
Hasil kompilasi akan diletakkan pada folder `/dist`.
