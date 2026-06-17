# Product Requirement Document (PRD): CLICKASET

CLICKASET adalah platform web pembelajaran interaktif berbasis game (*gamified interactive learning platform*) yang dirancang khusus untuk membantu siswa dan mahasiswa akuntansi memahami konsep **Penyesuaian Penyusutan Aset Tetap** sesuai dengan standar SAK (Standar Akuntansi Keuangan) dan Ketentuan Perpajakan di Indonesia.

---

## 1. Ringkasan Produk & Solusi

### Masalah
* Penyesuaian penyusutan aset tetap sering kali dianggap abstrak, membosankan, dan rumit oleh siswa.
* Minimnya media pembelajaran yang memadukan teori akuntansi SAK dan perpajakan secara interaktif dan visual.
* Rendahnya keterlibatan siswa (*student engagement*) dalam metode pembelajaran konvensional.

### Solusi CLICKASET
* **Materi Belajar Interaktif & Dinamis:** Menyajikan komparasi SAK dan Pajak secara visual, dengan materi yang dapat dikelola (CRUD) langsung oleh Guru.
* **Simulator Siklus Aset (6 Tahap):** Pengguna berperan langsung sebagai staf akuntansi yang memegang kontrol dari pembelian aset hingga pencatatan jurnal penyesuaian.
* **Kuis Edukasi Multiplayer (Self-Paced):** Kuis diaktifkan oleh Guru, kemudian siswa dapat menjawab dengan kecepatan masing-masing (*self-paced*). Peringkat siswa di-update secara dinamis di papan peringkat (*leaderboard*).

---

## 2. Peran Pengguna (User Roles)

Aplikasi memiliki dua peran utama dengan alur kerja sebagai berikut:

| Peran | Hak Akses & Fitur |
| :--- | :--- |
| **Guru (Teacher)** | <ul><li>Melakukan registrasi & login menggunakan Username, No. HP, dan Password.</li><li>Mengelola konten materi pembelajaran (CRUD Materi: Judul, Konten Markdown, dan Video Animasi YouTube).</li><li>Membuat kuis baru dan memasukkan butir-butir soal.</li><li>Membuka room kuis (menghasilkan kode room unik).</li><li>Memantau jalannya kuis dan menampilkan *Live Leaderboard* secara real-time.</li></ul> |
| **Siswa (Student)** | <ul><li>Melakukan registrasi & login menggunakan Username, No. HP, dan Password.</li><li>Membaca dan mempelajari modul materi pembelajaran interaktif yang dibuat Guru.</li><li>Menggunakan simulator siklus aset (dapat diakses dengan/tanpa login).</li><li>Bergabung ke room kuis aktif menggunakan kode room unik.</li><li>Mengerjakan soal kuis secara mandiri (*self-paced*) sebelum batas waktu habis, dan melihat papan peringkat.</li></ul> |

---

## 3. Spesifikasi Teknis & Arsitektur

### Tech Stack
* **Frontend:** Vite + React.js + TypeScript (Single Page Application).
* **Styling & UI:** Tailwind CSS + **Preline UI** (Boilerplate tema menggunakan komponen modern Preline UI seperti Stepper/Wizard, Sidebar, Forms, Table, Modals dengan transisi halus).
* **Database & Realtime Service:** **Supabase** (PostgreSQL database untuk data kuis, materi, & autentikasi kustom menggunakan tabel `users` untuk menghindari kewajiban verifikasi email/SMS OTP).
* **Charts:** Recharts / Chart.js (Visualisasi kurva penurunan nilai buku aset).
* **Deployment:** **Netlify** (otomatis build via GitHub).

### Mekanisme Autentikasi & Reset Password Kustom
Untuk kemudahan akses siswa dan guru tanpa biaya SMS Gateway atau verifikasi email:
1. **Pendaftaran:** Mengisi `username` (unik), `phone_number` (unik), `full_name`, `password`, dan `role` (GURU/SISWA).
2. **Lupa Kata Sandi (Custom Reset Flow):** Jika pengguna lupa password, mereka cukup masuk ke menu reset, memasukkan `username` dan `phone_number` yang cocok. Jika data di database cocok, sistem langsung mengizinkan penggantian password baru (tanpa verifikasi token eksternal).

---

## 4. Skema Database (Supabase PostgreSQL)

Berikut adalah rancangan tabel database untuk mendukung autentikasi kustom, materi dinamis, dan kuis:

### `users` (Tabel Autentikasi Terpadu)
* `id`: uuid (Primary Key, di-generate oleh database)
* `username`: string (Unique, indeks pencarian)
* `phone_number`: string (Unique, indeks pencarian)
* `password`: string (Hashed, kata sandi tersimpan menggunakan enkripsi/hashing satu arah SHA-256)
* `full_name`: string
* `role`: string (enum: `'GURU'`, `'SISWA'`)
* `created_at`: timestamp

### `materials` (Materi Belajar Interaktif - Kelolaan Guru)
* `id`: uuid (Primary Key)
* `title`: string
* `content`: text (Mendukung format Markdown untuk rumus & tabel SAK/Pajak)
* `video_url`: string (Link embed YouTube/Video Animasi)
* `category`: string (enum: `'DEFINISI'`, `'KELOMPOK'`, `'SAK'`, `'PAJAK'`)
* `order_index`: integer (Urutan tampilan modul)
* `created_at`: timestamp

### `quizzes` (Template Kuis buatan Guru)
* `id`: uuid (Primary Key)
* `teacher_id`: uuid (Foreign Key ke `users.id`)
* `title`: string
* `description`: text
* `created_at`: timestamp

### `questions` (Soal Kuis)
* `id`: uuid (Primary Key)
* `quiz_id`: uuid (Foreign Key ke `quizzes.id` dengan Cascade Delete)
* `question_text`: text
* `options`: jsonb (Array pilihan jawaban, misal: `["Mobil", "Gedung", "Tanah", "Hak Paten"]`)
* `correct_option_index`: integer (Index jawaban benar: 0 untuk A, 1 untuk B, dst.)
* `time_limit`: integer (detik, default: 30)
* `explanation`: text (pembahasan soal)
* `order_index`: integer (urutan soal)

### `rooms` (Room Aktif Kuis)
* `id`: uuid (Primary Key)
* `quiz_id`: uuid (Foreign Key ke `quizzes.id`)
* `room_code`: string (6 karakter unik alfanumerik, misal: `AX927B`)
* `status`: string (enum: `'LOBBY'`, `'PLAYING'`, `'FINISHED'`)
* `created_at`: timestamp

### `participants` (Siswa dalam Room)
* `id`: uuid (Primary Key)
* `room_id`: uuid (Foreign Key ke `rooms.id`)
* `user_id`: uuid (Foreign Key ke `users.id`)
* `score`: integer (default: 0)
* `current_question_index`: integer (default: 0 - Menunjukkan progres pengerjaan mandiri siswa)
* `joined_at`: timestamp

---

## 5. Spesifikasi Fitur Utama

### Fitur A: Home & Materi (Belajar)
* **Visual Landing:** Banner modern dengan tema Retro Blues dan glassmorphism, menyajikan "KlikAset" dengan tagline edukatif.
* **Modul Teori Dinamis:** Siswa dapat membaca materi akuntansi. Bagi Guru, tersedia panel admin khusus untuk melakukan CRUD (Create, Read, Update, Delete) pada modul materi dan menyisipkan link video animasi YouTube.
* **Kategori Modul:**
  1. *Definisi & Karakteristik Aset Tetap:* Kriteria aset yang disusutkan.
  2. *Kelompok Harta Berwujud Perpajakan:* Tabel interaktif kelompok 1-4 dan bangunan.
  3. *Metode Penyusutan SAK:* Penjelasan beserta formula SAK.
  4. *Metode Penyusutan Pajak:* Komparasi perbedaan tarif dan larangan beberapa metode menurut pajak.

### Fitur B: Simulator Siklus Aset (6 Tahap)
Siswa menggunakan form langkah-demi-langkah (Preline UI Stepper/Wizard) dengan input dinamis:
1. **Tahap 1: Membeli Aset**
   * Input: Nama Aset, Tanggal Pembelian, Biaya Perolehan (Harga Beli + Biaya Pengiriman + Biaya BBN).
   * Animasi: Aset yang dibeli bergerak visual di layar menuju area perusahaan.
2. **Tahap 2: Timeline Penggunaan**
   * Visualisasi timeline: Pembelian $\rightarrow$ Pemakaian $\rightarrow$ Dimulainya Penyusutan.
3. **Tahap 3: Golongan Aset**
   * Siswa mencocokkan aset dengan ketentuan pajak (misal: Mobil masuk Kelompok 2 - Masa Manfaat 8 Tahun).
4. **Tahap 4: Metode Penyusutan**
   * Siswa memilih metode (Garis Lurus vs Saldo Menurun) untuk melihat dampak perbedaannya terhadap nilai sisa secara langsung.
5. **Tahap 5: Perhitungan & Grafik**
   * Grafik visual interaktif garis tren nilai buku aset vs akumulasi penyusutan menggunakan Recharts.
   * Tabel depresiasi per tahun berisi kolom: Tahun, Harga Perolehan, Beban Penyusutan, Akumulasi Penyusutan, Nilai Buku Akhir Tahun.
6. **Tahap 6: Jurnal Penyesuaian**
   * Siswa mengisi form entri jurnal:
     * **Debit:** Beban Penyusutan Aset Tetap
     * **Kredit:** Akumulasi Penyusutan Aset Tetap
   * Input angka harus *balance* dan divalidasi otomatis sesuai hasil perhitungan Tahap 5.

### Fitur C: Kuis Interaktif (Self-Paced Gamification)
* **Pengerjaan Mandiri (*Self-Paced*):** Siswa join ke room menggunakan kode room. Setelah kuis dimulai oleh Guru, siswa dapat menjawab soal demi soal dengan kecepatan masing-masing. Setiap soal memiliki timer tersendiri (misal 30 detik).
* **Kalkulasi Skor:** Poin dihitung berdasarkan ketepatan jawaban (100 poin) ditambah bonus kecepatan (makin cepat menjawab, dapat tambahan hingga 50 poin).
* **Live Leaderboard:** Papan peringkat diperbarui secara asinkron di database dan ditampilkan secara *real-time* di layar Guru. Setelah siswa menyelesaikan soal terakhir, layar Guru menampilkan podium 3 besar.

---

## 6. Desain Visual & UI Guidelines (Aesthetic System)

Untuk mencapai desain yang konsisten, modern, dan premium, CLICKASET akan menggunakan penuh sistem desain dan styling bawaan dari **TailAdmin React Dashboard Template**:
* **Color Palette (TailAdmin Colors):**
  * **Slate Dark Backgrounds:** Menggunakan warna gelap slate khas TailAdmin (`dark:bg-boxdark` untuk card, `dark:bg-boxdark-2` untuk background body/halaman).
  * **Accent Color:** Menggunakan warna biru brand bawaan TailAdmin (`text-primary` / `bg-primary`) untuk sorotan utama, tombol aktif, dan penanda posisi menu.
  * **Border & Line:** Menggunakan warna border tipis (`border-stroke` / `dark:border-stroke-dark`) untuk batas card dan layout.
* **Layout:** Tata letak sidebar lipat (collapsible sidebar), header atas dengan info nama pengguna, tombol ganti tema (Dark/Light mode), dan navigasi halaman terpadu.
* **Tipografi:** Menggunakan font Google **Outfit** untuk heading dan **Inter** untuk teks body, selaras dengan konfigurasi font-family bawaan template TailAdmin.
* **Animasi Mikro:** Hover state pada button berupa pembesaran halus (`scale-105`), perubahan warna, dan transisi antar halaman menggunakan transisi CSS murni yang sangat halus.

---

## 7. Rencana Rilis MVP (Minimum Viable Product)

* **Fase 1 (Pondasi & Layout):** Inisialisasi Vite + React + Tailwind + Preline UI + Sidebar Nav + Landing Page.
* **Fase 2 (Simulator Core Engine):** Implementasi form multi-step simulasi, perhitungan rumus akuntansi, visualisasi grafik Recharts, dan pembuatan jurnal penyesuaian.
* **Fase 3 (Integrasi Supabase & Kuis):** Pembuatan database di Supabase, custom auth (username/No. HP), CRUD materi belajar, dan kuis *self-paced* real-time.
* **Fase 4 (Deployment & Finishing):** Deploy ke Netlify, optimasi performa, dan pengujian end-to-end.
