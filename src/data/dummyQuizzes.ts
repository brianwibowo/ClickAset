export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  time_limit: number;
  explanation: string;
  order_index: number;
}

export interface DummyQuiz {
  id: string;
  title: string;
  description: string;
  iconName: "Coins" | "Building2" | "Calculator" | "Shield";
  playsCount: string;
  questions: Question[];
}

export const DUMMY_QUIZZES: DummyQuiz[] = [
  {
    id: "dummy-1",
    title: "Kelompok Harta Berwujud Perpajakan",
    description: "Pahami pengelompokan harta berwujud, masa manfaat, dan tarif penyusutan menurut ketentuan fiskal perpajakan di Indonesia.",
    iconName: "Coins",
    playsCount: "4.2k plays",
    questions: [
      {
        id: "d1-q1",
        quiz_id: "dummy-1",
        question_text: "Harta berwujud adalah....",
        options: [
          "Aset yang tidak memiliki bentuk fisik",
          "Aset yang memiliki bentuk fisik dan digunakan dalam usaha",
          "Utang perusahaan",
          "Modal pemilik"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Aset berwujud (tangible assets) memiliki wujud fisik konkret dan digunakan untuk kegiatan operasional usaha sehari-hari.",
        order_index: 1
      },
      {
        id: "d1-q2",
        quiz_id: "dummy-1",
        question_text: "Tujuan pengelompokan harta berwujud dalam perpajakan adalah....",
        options: [
          "Menentukan harga jual aset",
          "Menentukan nilai pasar aset",
          "Menentukan masa manfaat dan tarif penyusutan",
          "Menentukan laba perusahaan"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Pengelompokan harta berwujud perpajakan bertujuan menetapkan masa manfaat fiskal serta besaran tarif penyusutan secara sah.",
        order_index: 2
      },
      {
        id: "d1-q3",
        quiz_id: "dummy-1",
        question_text: "Masa manfaat Kelompok 1 adalah....",
        options: [
          "4 tahun",
          "8 tahun",
          "16 tahun",
          "20 tahun"
        ],
        correct_option_index: 0,
        time_limit: 30,
        explanation: "Berdasarkan peraturan perpajakan di Indonesia, Kelompok 1 memiliki masa manfaat selama 4 tahun.",
        order_index: 3
      },
      {
        id: "d1-q4",
        quiz_id: "dummy-1",
        question_text: "Masa manfaat Kelompok 2 adalah....",
        options: [
          "4 tahun",
          "8 tahun",
          "16 tahun",
          "20 tahun"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Berdasarkan peraturan perpajakan di Indonesia, Kelompok 2 memiliki masa manfaat selama 8 tahun.",
        order_index: 4
      },
      {
        id: "d1-q5",
        quiz_id: "dummy-1",
        question_text: "Masa manfaat Kelompok 3 adalah....",
        options: [
          "4 tahun",
          "8 tahun",
          "16 tahun",
          "20 tahun"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Berdasarkan peraturan perpajakan di Indonesia, Kelompok 3 memiliki masa manfaat selama 16 tahun.",
        order_index: 5
      },
      {
        id: "d1-q6",
        quiz_id: "dummy-1",
        question_text: "Masa manfaat Kelompok 4 adalah....",
        options: [
          "4 tahun",
          "8 tahun",
          "16 tahun",
          "20 tahun"
        ],
        correct_option_index: 3,
        time_limit: 30,
        explanation: "Berdasarkan peraturan perpajakan di Indonesia, Kelompok 4 memiliki masa manfaat terlama yaitu 20 tahun.",
        order_index: 6
      },
      {
        id: "d1-q7",
        quiz_id: "dummy-1",
        question_text: "Bangunan permanen memiliki masa manfaat selama....",
        options: [
          "5 tahun",
          "10 tahun",
          "20 tahun",
          "25 tahun"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Bangunan permanen disusutkan selama 20 tahun secara fiskal dengan metode garis lurus.",
        order_index: 7
      },
      {
        id: "d1-q8",
        quiz_id: "dummy-1",
        question_text: "Bangunan tidak permanen memiliki masa manfaat selama....",
        options: [
          "10 tahun",
          "15 tahun",
          "20 tahun",
          "25 tahun"
        ],
        correct_option_index: 0,
        time_limit: 30,
        explanation: "Bangunan tidak permanen (semi-permanen atau bangunan kayu darurat) didepresiasikan selama 10 tahun.",
        order_index: 8
      },
      {
        id: "d1-q9",
        quiz_id: "dummy-1",
        question_text: "Berikut yang termasuk metode penyusutan fiskal adalah....",
        options: [
          "FIFO",
          "LIFO",
          "Garis lurus",
          "Average"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Ketentuan perpajakan di Indonesia hanya melegalkan Metode Garis Lurus (Straight Line) dan Saldo Menurun (Declining Balance).",
        order_index: 9
      },
      {
        id: "d1-q10",
        quiz_id: "dummy-1",
        question_text: "Kendaraan operasional perusahaan merupakan contoh....",
        options: [
          "Harta tidak berwujud",
          "Harta berwujud",
          "Kewajiban perusahaan",
          "Modal perusahaan"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Kendaraan operasional adalah objek fisik nyata yang dimiliki untuk membantu kelancaran bisnis, sehingga merupakan harta berwujud.",
        order_index: 10
      }
    ]
  },
  {
    id: "dummy-2",
    title: "Definisi & Karakteristik Aset Tetap",
    description: "Evaluasi dasar mengenai apa itu aset tetap, karakteristik utama, serta klasifikasinya dalam laporan keuangan entitas.",
    iconName: "Building2",
    playsCount: "3.8k plays",
    questions: [
      {
        id: "d2-q1",
        quiz_id: "dummy-2",
        question_text: "Aset tetap adalah....",
        options: [
          "Aset yang dibeli untuk dijual kembali",
          "Aset yang digunakan dalam kegiatan operasional perusahaan dan memiliki masa manfaat lebih dari satu tahun",
          "Utang jangka panjang perusahaan",
          "Persediaan barang dagang"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Aset tetap merupakan sarana fisik operasional jangka panjang (> 1 tahun) dan tidak dimaksudkan untuk dijual kembali dalam bisnis normal.",
        order_index: 1
      },
      {
        id: "d2-q2",
        quiz_id: "dummy-2",
        question_text: "Berikut yang termasuk aset tetap adalah....",
        options: [
          "Persediaan barang",
          "Piutang usaha",
          "Kendaraan operasional",
          "Kas di bank"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Kendaraan operasional merupakan sarana pendukung operasional yang berumur panjang, sedangkan kas, piutang, dan persediaan adalah aset lancar.",
        order_index: 2
      },
      {
        id: "d2-q3",
        quiz_id: "dummy-2",
        question_text: "Salah satu karakteristik aset tetap adalah....",
        options: [
          "Mudah diperjualbelikan setiap hari",
          "Digunakan untuk operasional perusahaan",
          "Memiliki masa manfaat kurang dari satu tahun",
          "Selalu berbentuk uang tunai"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Karakteristik mendasar dari aset tetap adalah ia dikuasai perusahaan untuk membantu proses produksi atau administrasi, bukan komoditas jual beli.",
        order_index: 3
      },
      {
        id: "d2-q4",
        quiz_id: "dummy-2",
        question_text: "Aset tetap umumnya memiliki masa manfaat....",
        options: [
          "Kurang dari satu tahun",
          "Tepat satu tahun",
          "Lebih dari satu periode akuntansi",
          "Kurang dari enam bulan"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Masa manfaat ekonomi aset tetap berlangsung lebih lama dari satu siklus akuntansi (umumnya lebih dari 12 bulan).",
        order_index: 4
      },
      {
        id: "d2-q5",
        quiz_id: "dummy-2",
        question_text: "Berikut yang bukan merupakan aset tetap adalah....",
        options: [
          "Gedung kantor",
          "Mesin produksi",
          "Kendaraan perusahaan",
          "Persediaan bahan baku"
        ],
        correct_option_index: 3,
        time_limit: 30,
        explanation: "Persediaan bahan baku akan diolah dan langsung terjual habis dalam jangka pendek, sehingga tergolong sebagai aset lancar.",
        order_index: 5
      },
      {
        id: "d2-q6",
        quiz_id: "dummy-2",
        question_text: "Aset tetap berwujud adalah aset yang....",
        options: [
          "Tidak memiliki bentuk fisik",
          "Memiliki bentuk fisik dan dapat digunakan dalam operasi perusahaan",
          "Berupa hak cipta",
          "Berupa paten perusahaan"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Aset tetap berwujud memiliki substansi fisik riil yang kasat mata, berbeda dengan hak cipta atau paten.",
        order_index: 6
      },
      {
        id: "d2-q7",
        quiz_id: "dummy-2",
        question_text: "Gedung kantor termasuk jenis aset tetap....",
        options: [
          "Tidak berwujud",
          "Lancar",
          "Berwujud",
          "Fiktif"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Gedung kantor adalah contoh utama aset tetap berwujud karena fisiknya ada dan digunakan dalam operasional berkesinambungan.",
        order_index: 7
      },
      {
        id: "d2-q8",
        quiz_id: "dummy-2",
        question_text: "Tujuan utama perusahaan memiliki aset tetap adalah untuk....",
        options: [
          "Dijual kembali dalam waktu dekat",
          "Digunakan dalam kegiatan operasional perusahaan",
          "Menambah utang perusahaan",
          "Mengurangi modal perusahaan"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Perusahaan memperoleh aset tetap agar proses produksi barang atau jasa dapat berjalan dengan lancar.",
        order_index: 8
      },
      {
        id: "d2-q9",
        quiz_id: "dummy-2",
        question_text: "Aset tetap biasanya mengalami....",
        options: [
          "Kenaikan persediaan",
          "Penyusutan nilai selama masa manfaatnya",
          "Penambahan utang otomatis",
          "Penghapusan pajak langsung"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Karena aus dipakai (physical wear) atau perkembangan zaman (obsolescence), nilai manfaat ekonomis aset tetap akan menyusut bertahap.",
        order_index: 9
      },
      {
        id: "d2-q10",
        quiz_id: "dummy-2",
        question_text: "Manakah yang merupakan contoh aset tetap tidak berwujud?",
        options: [
          "Kendaraan",
          "Mesin produksi",
          "Hak paten",
          "Gedung kantor"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Hak paten bernilai secara ekonomi bagi perusahaan tetapi tidak memiliki substansi fisik, sehingga digolongkan sebagai aset tidak berwujud.",
        order_index: 10
      }
    ]
  },
  {
    id: "dummy-3",
    title: "Metode Penyusutan Menurut SAK",
    description: "Pelajari metode-metode penyusutan sesuai Standar Akuntansi Keuangan (SAK) beserta penentuan nilai residu dan masa manfaat.",
    iconName: "Calculator",
    playsCount: "5.1k plays",
    questions: [
      {
        id: "d3-q1",
        quiz_id: "dummy-3",
        question_text: "Penyusutan adalah....",
        options: [
          "Penambahan nilai aset tetap",
          "Pengalokasian biaya perolehan aset tetap selama masa manfaatnya",
          "Penjualan aset tetap",
          "Pembelian aset tetap"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Penyusutan adalah proses alokasi sistematis atas biaya perolehan aset tetap menjadi beban selama periode perkiraan masa manfaatnya.",
        order_index: 1
      },
      {
        id: "d3-q2",
        quiz_id: "dummy-3",
        question_text: "Menurut SAK, metode penyusutan harus mencerminkan....",
        options: [
          "Harga pasar aset",
          "Cara aset menghasilkan manfaat ekonomi bagi perusahaan",
          "Nilai tukar mata uang",
          "Jumlah karyawan perusahaan"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Pemilihan metode penyusutan menurut SAK harus selaras dengan perkiraan pola konsumsi manfaat ekonomi dari aset tersebut.",
        order_index: 2
      },
      {
        id: "d3-q3",
        quiz_id: "dummy-3",
        question_text: "Metode penyusutan yang menghasilkan beban penyusutan sama setiap tahun adalah....",
        options: [
          "Saldo menurun",
          "Jumlah angka tahun",
          "Garis lurus",
          "Unit produksi"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Metode Garis Lurus (Straight Line Method) menghasilkan beban penyusutan yang seragam atau konstan di setiap periode tahunan.",
        order_index: 3
      },
      {
        id: "d3-q4",
        quiz_id: "dummy-3",
        question_text: "Pada metode garis lurus, beban penyusutan dihitung berdasarkan....",
        options: [
          "Jam kerja mesin",
          "Jumlah unit yang diproduksi",
          "Nilai residu saja",
          "Masa manfaat aset yang sama setiap periode"
        ],
        correct_option_index: 3,
        time_limit: 30,
        explanation: "Metode garis lurus mengasumsikan penurunan nilai kegunaan berjalan linear/konstan sebanding dengan berjalannya waktu (masa manfaat).",
        order_index: 4
      },
      {
        id: "d3-q5",
        quiz_id: "dummy-3",
        question_text: "Metode penyusutan yang didasarkan pada penggunaan atau hasil produksi aset adalah....",
        options: [
          "Garis lurus",
          "Unit produksi",
          "Saldo menurun",
          "Revaluasi"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Metode Unit Produksi membebankan depresiasi berdasarkan intensitas pemakaian fisik atau jumlah produk yang dihasilkan oleh mesin/alat.",
        order_index: 5
      },
      {
        id: "d3-q6",
        quiz_id: "dummy-3",
        question_text: "Metode saldo menurun menghasilkan beban penyusutan yang....",
        options: [
          "Sama setiap tahun",
          "Semakin besar setiap tahun",
          "Lebih besar pada awal masa manfaat aset",
          "Tidak berubah selama masa manfaat"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Metode saldo menurun (Declining Balance) mengalikan persentase tarif tetap dengan nilai buku bersih, sehingga menghasilkan nilai beban tertinggi di tahun-tahun awal.",
        order_index: 6
      },
      {
        id: "d3-q7",
        quiz_id: "dummy-3",
        question_text: "Berikut yang bukan merupakan metode penyusutan menurut SAK adalah....",
        options: [
          "Garis lurus",
          "Unit produksi",
          "Saldo menurun",
          "FIFO"
        ],
        correct_option_index: 3,
        time_limit: 30,
        explanation: "FIFO (First In First Out) adalah metode penilaian dan penentuan arus biaya persediaan (inventory), bukan penyusutan aset tetap.",
        order_index: 7
      },
      {
        id: "d3-q8",
        quiz_id: "dummy-3",
        question_text: "Nilai residu adalah....",
        options: [
          "Nilai aset saat dibeli",
          "Nilai aset setelah dikurangi penyusutan",
          "Perkiraan nilai aset pada akhir masa manfaatnya",
          "Nilai pasar aset setiap tahun"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Nilai residu (salvage value) adalah taksiran nilai sisa pelepasan aset yang diharapkan bisa didapatkan di akhir masa manfaat setelah dikurangi biaya pelepasan.",
        order_index: 8
      },
      {
        id: "d3-q9",
        quiz_id: "dummy-3",
        question_text: "Perusahaan perlu meninjau kembali metode penyusutan apabila....",
        options: [
          "Tidak ada perubahan penggunaan aset",
          "Terdapat perubahan pola manfaat ekonomi aset",
          "Harga saham naik",
          "Jumlah karyawan bertambah"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Jika terdeteksi perubahan signifikan dalam pola konsumsi manfaat ekonomi dari aset tetap, metode penyusutan wajib disesuaikan agar tetap relevan.",
        order_index: 9
      },
      {
        id: "d3-q10",
        quiz_id: "dummy-3",
        question_text: "Tujuan utama penyusutan adalah....",
        options: [
          "Menghapus aset dari laporan keuangan",
          "Mengalokasikan biaya aset secara sistematis selama masa manfaatnya",
          "Menentukan harga jual aset",
          "Menambah laba perusahaan"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Tujuan penyusutan adalah pengalokasian biaya perolehan yang sistematis agar seimbang dengan kontribusi pendapatan (matching concept).",
        order_index: 10
      }
    ]
  },
  {
    id: "dummy-4",
    title: "Metode Penyusutan Menurut Pajak",
    description: "Evaluasi pemahaman mendalam metode depresiasi komersial vs fiskal (pajak) serta kepatuhan UU Pajak Penghasilan Pasal 11.",
    iconName: "Shield",
    playsCount: "2.9k plays",
    questions: [
      {
        id: "d4-q1",
        quiz_id: "dummy-4",
        question_text: "Menurut ketentuan perpajakan di Indonesia, metode penyusutan untuk harta berwujud selain bangunan adalah....",
        options: [
          "FIFO dan LIFO",
          "Garis lurus dan saldo menurun",
          "Unit produksi dan FIFO",
          "Revaluasi dan amortisasi"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "UU Pajak Penghasilan Pasal 11 membatasi metode penyusutan bukan bangunan hanya pada metode Garis Lurus dan Saldo Menurun.",
        order_index: 1
      },
      {
        id: "d4-q2",
        quiz_id: "dummy-4",
        question_text: "Metode garis lurus dalam perpajakan menghitung penyusutan dengan cara....",
        options: [
          "Beban penyusutan sama setiap tahun",
          "Beban penyusutan semakin besar setiap tahun",
          "Berdasarkan jumlah produksi",
          "Berdasarkan harga pasar aset"
        ],
        correct_option_index: 0,
        time_limit: 30,
        explanation: "Penyusutan fiskal garis lurus mengalikan tarif persentase tetap dengan harga perolehan awal, menghasilkan beban depresiasi konstan per tahun.",
        order_index: 2
      },
      {
        id: "d4-q3",
        quiz_id: "dummy-4",
        question_text: "Metode saldo menurun menghasilkan beban penyusutan yang....",
        options: [
          "Sama setiap tahun",
          "Lebih kecil pada awal masa manfaat",
          "Lebih besar pada awal masa manfaat",
          "Tidak dapat dihitung"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Metode Saldo Menurun fiskal menerapkan tarif ganda ke nilai buku fiskal awal tahun, membuat depresiasi tertinggi di tahun pertama.",
        order_index: 3
      },
      {
        id: "d4-q4",
        quiz_id: "dummy-4",
        question_text: "Untuk bangunan, metode penyusutan yang diperbolehkan menurut pajak adalah....",
        options: [
          "Saldo menurun",
          "Unit produksi",
          "Garis lurus",
          "FIFO"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Harta berwujud berupa bangunan (baik permanen maupun semi-permanen) hanya diperbolehkan disusutkan menggunakan Metode Garis Lurus secara fiskal.",
        order_index: 4
      },
      {
        id: "d4-q5",
        quiz_id: "dummy-4",
        question_text: "Harta berwujud Kelompok 1 memiliki masa manfaat selama....",
        options: [
          "4 tahun",
          "8 tahun",
          "16 tahun",
          "20 tahun"
        ],
        correct_option_index: 0,
        time_limit: 30,
        explanation: "Harta berwujud bukan bangunan Kelompok 1 memiliki masa manfaat perpajakan selama 4 tahun.",
        order_index: 5
      },
      {
        id: "d4-q6",
        quiz_id: "dummy-4",
        question_text: "Harta berwujud Kelompok 2 memiliki masa manfaat selama....",
        options: [
          "4 tahun",
          "8 tahun",
          "16 tahun",
          "20 tahun"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Harta berwujud bukan bangunan Kelompok 2 memiliki masa manfaat perpajakan selama 8 tahun.",
        order_index: 6
      },
      {
        id: "d4-q7",
        quiz_id: "dummy-4",
        question_text: "Bangunan permanen menurut ketentuan pajak memiliki masa manfaat....",
        options: [
          "10 tahun",
          "15 tahun",
          "20 tahun",
          "25 tahun"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Fiskal di Indonesia mengelompokkan bangunan permanen dengan masa manfaat pajak selama 20 tahun.",
        order_index: 7
      },
      {
        id: "d4-q8",
        quiz_id: "dummy-4",
        question_text: "Bangunan tidak permanen memiliki masa manfaat....",
        options: [
          "5 tahun",
          "10 tahun",
          "15 tahun",
          "20 tahun"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Bangunan semi-permanen atau tidak permanen memiliki masa manfaat perpajakan selama 10 tahun.",
        order_index: 8
      },
      {
        id: "d4-q9",
        quiz_id: "dummy-4",
        question_text: "Tujuan penyusutan dalam perpajakan adalah....",
        options: [
          "Menentukan harga jual aset",
          "Mengalokasikan biaya perolehan aset selama masa manfaatnya untuk menghitung penghasilan kena pajak",
          "Menentukan nilai pasar aset",
          "Menambah laba perusahaan"
        ],
        correct_option_index: 1,
        time_limit: 30,
        explanation: "Depresiasi fiskal dibebankan sebagai pengurang laba bruto kena pajak guna menakar beban pajak penghasilan terutang (deductible expense).",
        order_index: 9
      },
      {
        id: "d4-q10",
        quiz_id: "dummy-4",
        question_text: "Berikut yang termasuk metode penyusutan menurut pajak adalah....",
        options: [
          "FIFO",
          "Average",
          "Garis lurus",
          "Moving Average"
        ],
        correct_option_index: 2,
        time_limit: 30,
        explanation: "Penyusutan fiskal mengakui metode Garis Lurus (Straight Line) dan Saldo Menurun (Double Declining Balance).",
        order_index: 10
      }
    ]
  }
];
