import { useState, useEffect } from "react";
import {
  BookOpen,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Video,
  Award,
  Activity,
  Users,
  Search,
  HelpCircle,
  Calculator,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import materiPdf from "../assets/Materi perpajakan.pdf";
import { showLoading, hideLoading } from "../utils/loader";

type Material = {
  id: string;
  title: string;
  content: string;
  video_url: string;
  category: "DEFINISI" | "KELOMPOK" | "SAK" | "PAJAK";
  order_index: number;
};

type ContentBlock =
  | { id: string; type: "text"; value: string; title?: string }
  | { id: string; type: "video"; value: string; title: string }
  | { id: string; type: "pdf"; value: string; title: string };

const defaultMaterials: Material[] = [
  {
    id: "d3b07384-d113-43d6-a5cc-ef6113b2c1a1",
    category: "DEFINISI",
    title: "Definisi & Karakteristik Aset Tetap",
    content: JSON.stringify([
      {
        id: "def-b1",
        type: "text",
        value: `Aset Tetap adalah aset berwujud yang dimiliki untuk digunakan dalam produksi atau penyediaan barang or jasa, untuk direntalkan kepada orang lain, atau untuk tujuan administratif; dan diharapkan untuk digunakan selama lebih dari satu periode (Standar Akuntansi Keuangan / SAK).

Karakteristik Utama Aset Tetap:
1. Memiliki bentuk fisik nyata (berwujud).
2. Digunakan secara aktif dalam operasional normal perusahaan (bukan untuk diperjualbelikan kembali sebagai barang dagang).
3. Memiliki masa manfaat ekonomis lebih dari 1 tahun akuntansi.
4. Nilai perolehan atau nilai asetnya material (cukup signifikan/mahal).

Penyusutan (Depresiasi) adalah alokasi sistematis jumlah yang dapat disusutkan dari suatu aset selama masa manfaatnya. Karena manfaat ekonomi aset menurun seiring waktu, nilai tersebut harus diakui sebagai beban penyusutan di laporan laba rugi.`
      },
      {
        id: "def-b2",
        type: "video",
        value: "https://youtu.be/gv9_xTQYNaM?si=e_eKXXNcC5Zmxnng",
        title: "Definisi & Karakteristik Aset Tetap"
      }
    ]),
    video_url: "https://youtu.be/gv9_xTQYNaM?si=e_eKXXNcC5Zmxnng",
    order_index: 1
  },
  {
    id: "d3b07384-d113-43d6-a5cc-ef6113b2c1a2",
    category: "KELOMPOK",
    title: "Kelompok Harta Berwujud Perpajakan",
    content: JSON.stringify([
      {
        id: "kel-b1",
        type: "text",
        value: `Menurut Ketentuan Perpajakan di Indonesia (UU PPh Pasal 11), penyusutan harta berwujud dilakukan berdasarkan pembagian kelompok harta sesuai dengan masa manfaatnya sebagai berikut:

I. BUKAN BANGUNAN:
1. Kelompok 1:
   - Masa Manfaat: 4 Tahun
   - Tarif Garis Lurus: 25% | Tarif Saldo Menurun: 50%
   - Contoh: Komputer, printer, HP, sepeda motor, alat pertanian ringan.

2. Kelompok 2:
   - Masa Manfaat: 8 Tahun
   - Tarif Garis Lurus: 12,5% | Tarif Saldo Menurun: 25%
   - Contoh: Mobil operasional, mebel kayu/logam, AC, mesin kantor sedang.

3. Kelompok 3:
   - Masa Manfaat: 16 Tahun
   - Tarif Garis Lurus: 6,25% | Tarif Saldo Menurun: 12,5%
   - Contoh: Mesin pabrik berat, kapal penumpang sedang.

4. Kelompok 4:
   - Masa Manfaat: 20 Tahun
   - Tarif Garis Lurus: 5% | Tarif Saldo Menurun: 10%
   - Contoh: Kereta api, kapal barang besar.

II. BANGUNAN:
1. Bangunan Permanen:
   - Masa Manfaat: 20 Tahun
   - Tarif Garis Lurus: 5% | Tarif Saldo Menurun: (Tidak diperkenankan)
2. Bangunan Tidak Permanen (Semi-permanen):
   - Masa Manfaat: 10 Tahun
   - Tarif Garis Lurus: 10% | Tarif Saldo Menurun: (Tidak diperkenankan)`
      },
      {
        id: "kel-b2",
        type: "pdf",
        value: "/Users/mymac/Documents/Codes/ClickAset/src/assets/Materi perpajakan.pdf",
        title: "Kelompok Harta Berwujud Perpajakan (PDF)"
      }
    ]),
    video_url: "/Users/mymac/Documents/Codes/ClickAset/src/assets/Materi perpajakan.pdf",
    order_index: 2
  },
  {
    id: "d3b07384-d113-43d6-a5cc-ef6113b2c1a3",
    category: "SAK",
    title: "Metode Penyusutan Menurut SAK",
    content: JSON.stringify([
      {
        id: "sak-b1",
        type: "text",
        value: `Standar Akuntansi Keuangan (SAK) memperkenankan berbagai metode penyusutan yang mencerminkan pola konsumsi masa manfaat aset oleh perusahaan:

1. Metode Garis Lurus (Straight Line Method)
   - Beban penyusutan sama besar setiap tahunnya.
   - Rumus: (Harga Perolehan - Nilai Residu) / Masa Manfaat

2. Metode Saldo Menurun Ganda (Double Declining Balance Method)
   - Beban penyusutan lebih besar di awal tahun dan menyusut bertahap.
   - Rumus: Nilai Buku Awal x Tarif Penyusutan (2x Tarif Garis Lurus)

3. Metode Jumlah Angka Tahun (Sum of the Years' Digits)
   - Penyusutan dihitung dengan mengalikan pecahan angka tahun dengan jumlah yang dapat disusutkan.
   - Rumus: (Masa Manfaat Tersisa / Jumlah Angka Tahun) x (Harga Perolehan - Nilai Residu)

4. Metode Satuan Jam Kerja (Service Hours Method)
   - Penyusutan didasarkan pada jam pemakaian fisik aset.
   - Rumus: (Harga Perolehan - Nilai Residu) / Total Taksiran Jam x Jam Aktual Terpakai

5. Metode Satuan Hasil Produksi (Output Method)
   - Penyusutan didasarkan pada jumlah unit output yang diproduksi aset.
   - Rumus: (Harga Perolehan - Nilai Residu) / Total Taksiran Output x Output Aktual Dihasilkan`
      },
      {
        id: "sak-b2",
        type: "video",
        value: "https://youtu.be/5hN_dQwah5U?si=BnaMLGkSunxDUVzh",
        title: "Metode Penyusutan Menurut SAK"
      }
    ]),
    video_url: "https://youtu.be/5hN_dQwah5U?si=BnaMLGkSunxDUVzh",
    order_index: 3
  },
  {
    id: "d3b07384-d113-43d6-a5cc-ef6113b2c1a4",
    category: "PAJAK",
    title: "Metode Penyusutan Menurut Pajak",
    content: JSON.stringify([
      {
        id: "pajak-b1",
        type: "text",
        value: `Perpajakan Indonesia mengatur secara ketat tata cara penyusutan fiskal untuk menghitung Pajak Penghasilan (PPh):

Aturan Kunci Penyusutan Pajak:
1. Metode yang Diperbolehkan:
   - Hanya Metode Garis Lurus dan Metode Saldo Menurun.
2. Aturan Aset Bangunan:
   - Bangunan WAJIB disusutkan menggunakan Metode Garis Lurus. Metode Saldo Menurun dilarang untuk kelompok bangunan.
3. Nilai Residu Diabaikan:
   - Nilai sisa (nilai residu) akhir masa manfaat dianggap Rp0 dalam perhitungan pajak.
4. Mulai Penyusutan:
   - Penyusutan fiskal dimulai pada bulan dilakukannya pengeluaran/perolehan aset tetap, bukan saat mulai beroperasi.
5. Pembulatan Umur Manfaat:
   - Aset harus dicocokkan ke 4 kelompok harta bukan bangunan atau kelompok bangunan yang sudah ditentukan tarif pajaknya.`
      }
    ]),
    video_url: "",
    order_index: 4
  }
];

// Interactive Items for DEFINISI Game
const defGameItems = [
  { id: "tanah", name: "Tanah Tapak Gedung", isAsset: false, reason: "Bukan, meskipun merupakan aset tetap berwujud, Tanah TIDAK disusutkan karena masa manfaatnya tidak terbatas (tidak pernah berkurang nilainya secara fisik)." },
  { id: "laptop", name: "Laptop Staf Desain", isAsset: true, reason: "Ya! Memiliki wujud fisik, digunakan untuk operasional kantor, masa manfaat > 1 tahun, dan harganya material." },
  { id: "persediaan", name: "Kertas & ATK Kantor", isAsset: false, reason: "Bukan, ATK cepat habis dan dikelompokkan sebagai Perlengkapan Lancar (Supplies), bukan aset tetap, karena masa manfaatnya kurang dari 1 tahun." },
  { id: "truk", name: "Truk Pengiriman Barang", isAsset: true, reason: "Ya! Memiliki wujud fisik, digunakan untuk kegiatan distribusi operasional, masa manfaat > 1 tahun, dan nilainya material." },
];

// Interactive Items for KELOMPOK Table
const taxGroups = [
  { key: "1", name: "Kelompok 1", life: "4 Tahun", gl: "25%", sm: "50%", examples: "Komputer, printer, handphone, HP, sepeda motor, alat pertanian ringan, mebel bambu." },
  { key: "2", name: "Kelompok 2", life: "8 Tahun", gl: "12,5%", sm: "25%", examples: "Mobil operasional, mebel kayu/logam, AC, mesin kantor sedang, alat komunikasi." },
  { key: "3", name: "Kelompok 3", life: "16 Tahun", gl: "6,25%", sm: "12,5%", examples: "Mesin pabrik berat, kapal penumpang sedang, dermaga kayu." },
  { key: "4", name: "Kelompok 4", life: "20 Tahun", gl: "5%", sm: "10%", examples: "Kereta api, kapal barang besar, dermaga beton/baja." },
  { key: "perm", name: "Bangunan Permanen", life: "20 Tahun", gl: "5%", sm: "Tidak Diperkenankan", examples: "Gedung kantor beton, gudang permanen, ruko permanen." },
  { key: "semi", name: "Bangunan Semi-Permanen", life: "10 Tahun", gl: "10%", sm: "Tidak Diperkenankan", examples: "Pos satpam kayu, bangunan semi-permanen dari seng/kayu." }
];

// Helper to parse YouTube IDs and convert them to secure embed URLs
const getEmbedUrl = (url: string) => {
  if (!url) return "";

  // Extract YouTube video ID
  let videoId = "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const resolveMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("Materi perpajakan.pdf")) {
    return materiPdf;
  }
  return getEmbedUrl(url);
};

const isPdfUrl = (url: string) => {
  if (!url) return false;
  const resolved = resolveMediaUrl(url);
  return resolved === materiPdf || resolved.endsWith(".pdf") || resolved.includes(".pdf") || resolved.startsWith("data:application/pdf");
};

const parseMaterialContent = (contentStr: string, videoUrlStr: string): ContentBlock[] => {
  if (!contentStr) return [];
  if (contentStr.trim().startsWith("[")) {
    try {
      return JSON.parse(contentStr);
    } catch (e) {
      console.error("Failed to parse content blocks JSON:", e);
    }
  }

  // Fallback for legacy text + media attachments
  const blocks: ContentBlock[] = [];
  if (contentStr) {
    blocks.push({
      id: "legacy-txt-" + Math.random().toString(36).substring(2, 7),
      type: "text",
      value: contentStr
    });
  }

  if (videoUrlStr) {
    if (videoUrlStr.trim().startsWith("[")) {
      try {
        const legacyItems = JSON.parse(videoUrlStr);
        legacyItems.forEach((item: any, idx: number) => {
          blocks.push({
            id: `legacy-media-${idx}`,
            type: item.type === "pdf" ? "pdf" : "video",
            value: item.url,
            title: item.title
          });
        });
      } catch (e) {
        const isPdf = isPdfUrl(videoUrlStr);
        blocks.push({
          id: "legacy-med-" + Math.random().toString(36).substring(2, 7),
          type: isPdf ? "pdf" : "video",
          value: videoUrlStr,
          title: isPdf ? "Dokumen Lampiran" : "Video Penjelas"
        });
      }
    } else {
      const isPdf = isPdfUrl(videoUrlStr);
      blocks.push({
        id: "legacy-med-" + Math.random().toString(36).substring(2, 7),
        type: isPdf ? "pdf" : "video",
        value: videoUrlStr,
        title: isPdf ? "Dokumen Lampiran" : "Video Penjelas"
      });
    }
  }

  return blocks;
};

const uploadFile = async (file: File): Promise<string> => {
  if (supabase.storage) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error } = await supabase.storage
        .from('materi-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('materi-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.warn("Supabase storage upload failed, falling back to Base64:", err);
    }
  }

  // Fallback: base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const Materi: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeCategory, setActiveCategory] = useState<"DEFINISI" | "KELOMPOK" | "SAK" | "PAJAK">("DEFINISI");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Form states for Create/Edit
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"ADD" | "EDIT">("ADD");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"DEFINISI" | "KELOMPOK" | "SAK" | "PAJAK">("DEFINISI");

  // Block-Based Content Editor States
  const [editorBlocks, setEditorBlocks] = useState<ContentBlock[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // DEFINISI Interactive Game State
  const [selectedDefId, setSelectedDefId] = useState<string | null>(null);

  // KELOMPOK Search State
  const [searchTaxQuery, setSearchTaxQuery] = useState("");

  // SAK/PAJAK Sandbox State
  const [sandboxCost, setSandboxCost] = useState<number>(200000000);
  const [sandboxLife, setSandboxLife] = useState<number>(8);
  const [sandboxResidu, setSandboxResidu] = useState<number>(20000000);

  useEffect(() => {
    // Check logged in user
    const userJson = localStorage.getItem("clickaset_user");
    if (userJson) {
      setUser(JSON.parse(userJson));
    }

    fetchMaterials();
  }, []);
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // Fetch from Supabase / LocalStorage Mock
      const { data, error } = await supabase.from("materials").select("*").order("order_index", { ascending: true });

      if (error) {
        console.error("Gagal mengambil data materi dari database:", error);
        setMaterials(defaultMaterials);
        return;
      }

      if (data && data.length > 0) {
      // Auto-update the default entries with the new block-based content format if they still have the old defaults
      let needsUpdate = false;
      const updatedData = data.map((m: any) => {
        // Migration for def-1
        if ((m.id === "def-1" || m.id === "d3b07384-d113-43d6-a5cc-ef6113b2c1a1") && !m.content.trim().startsWith("[")) {
          m.content = JSON.stringify([
            {
              id: "def-b1",
              type: "text",
              value: `Aset Tetap adalah aset berwujud yang dimiliki untuk digunakan dalam produksi atau penyediaan barang or jasa, untuk direntalkan kepada orang lain, atau untuk tujuan administratif; dan diharapkan untuk digunakan selama lebih dari satu periode (Standar Akuntansi Keuangan / SAK).

Karakteristik Utama Aset Tetap:
1. Memiliki bentuk fisik nyata (berwujud).
2. Digunakan secara aktif dalam operasional normal perusahaan (bukan untuk diperjualbelikan kembali sebagai barang dagang).
3. Memiliki masa manfaat ekonomis lebih dari 1 tahun akuntansi.
4. Nilai perolehan atau nilai asetnya material (cukup signifikan/mahal).

Penyusutan (Depresiasi) adalah alokasi sistematis jumlah yang dapat disusutkan dari suatu aset selama masa manfaatnya. Karena manfaat ekonomi aset menurun seiring waktu, nilai tersebut harus diakui sebagai beban penyusutan di laporan laba rugi.`
            },
            {
              id: "def-b2",
              type: "video",
              value: "https://youtu.be/gv9_xTQYNaM?si=e_eKXXNcC5Zmxnng",
              title: "Definisi & Karakteristik Aset Tetap"
            }
          ]);
          m.video_url = "https://youtu.be/gv9_xTQYNaM?si=e_eKXXNcC5Zmxnng";
          needsUpdate = true;
        }

        // Migration for kel-1
        if ((m.id === "kel-1" || m.id === "d3b07384-d113-43d6-a5cc-ef6113b2c1a2") && !m.content.trim().startsWith("[")) {
          m.content = JSON.stringify([
            {
              id: "kel-b1",
              type: "text",
              value: `Menurut Ketentuan Perpajakan di Indonesia (UU PPh Pasal 11), penyusutan harta berwujud dilakukan berdasarkan pembagian kelompok harta sesuai dengan masa manfaatnya sebagai berikut:

I. BUKAN BANGUNAN:
1. Kelompok 1:
   - Masa Manfaat: 4 Tahun
   - Tarif Garis Lurus: 25% | Tarif Saldo Menurun: 50%
   - Contoh: Komputer, printer, HP, sepeda motor, alat pertanian ringan.

2. Kelompok 2:
   - Masa Manfaat: 8 Tahun
   - Tarif Garis Lurus: 12,5% | Tarif Saldo Menurun: 25%
   - Contoh: Mobil operasional, mebel kayu/logam, AC, mesin kantor sedang.

3. Kelompok 3:
   - Masa Manfaat: 16 Tahun
   - Tarif Garis Lurus: 6,25% | Tarif Saldo Menurun: 12,5%
   - Contoh: Mesin pabrik berat, kapal penumpang sedang.

4. Kelompok 4:
   - Masa Manfaat: 20 Tahun
   - Tarif Garis Lurus: 5% | Tarif Saldo Menurun: 10%
   - Contoh: Kereta api, kapal barang besar.

II. BANGUNAN:
1. Bangunan Permanen:
   - Masa Manfaat: 20 Tahun
   - Tarif Garis Lurus: 5% | Tarif Saldo Menurun: (Tidak diperkenankan)
2. Bangunan Tidak Permanen (Semi-permanen):
   - Masa Manfaat: 10 Tahun
   - Tarif Garis Lurus: 10% | Tarif Saldo Menurun: (Tidak diperkenankan)`
            },
            {
              id: "kel-b2",
              type: "pdf",
              value: "/Users/mymac/Documents/Codes/ClickAset/src/assets/Materi perpajakan.pdf",
              title: "Kelompok Harta Berwujud Perpajakan (PDF)"
            }
          ]);
          m.video_url = "/Users/mymac/Documents/Codes/ClickAset/src/assets/Materi perpajakan.pdf";
          needsUpdate = true;
        }

        // Migration for sak-1
        if ((m.id === "sak-1" || m.id === "d3b07384-d113-43d6-a5cc-ef6113b2c1a3") && !m.content.trim().startsWith("[")) {
          m.content = JSON.stringify([
            {
              id: "sak-b1",
              type: "text",
              value: `Standar Akuntansi Keuangan (SAK) memperkenankan berbagai metode penyusutan yang mencerminkan pola konsumsi masa manfaat aset oleh perusahaan:

1. Metode Garis Lurus (Straight Line Method)
   - Beban penyusutan sama besar setiap tahunnya.
   - Rumus: (Harga Perolehan - Nilai Residu) / Masa Manfaat

2. Metode Saldo Menurun Ganda (Double Declining Balance Method)
   - Beban penyusutan lebih besar di awal tahun dan menyusut bertahap.
   - Rumus: Nilai Buku Awal x Tarif Penyusutan (2x Tarif Garis Lurus)

3. Metode Jumlah Angka Tahun (Sum of the Years' Digits)
   - Penyusutan dihitung dengan mengalikan pecahan angka tahun dengan jumlah yang dapat disusutkan.
   - Rumus: (Masa Manfaat Tersisa / Jumlah Angka Tahun) x (Harga Perolehan - Nilai Residu)

4. Metode Satuan Jam Kerja (Service Hours Method)
   - Penyusutan didasarkan pada jam pemakaian fisik aset.
   - Rumus: (Harga Perolehan - Nilai Residu) / Total Taksiran Jam x Jam Aktual Terpakai

5. Metode Satuan Hasil Produksi (Output Method)
   - Penyusutan didasarkan pada jumlah unit output yang diproduksi aset.
   - Rumus: (Harga Perolehan - Nilai Residu) / Total Taksiran Output x Output Aktual Dihasilkan`
            },
            {
              id: "sak-b2",
              type: "video",
              value: "https://youtu.be/5hN_dQwah5U?si=BnaMLGkSunxDUVzh",
              title: "Metode Penyusutan Menurut SAK"
            }
          ]);
          m.video_url = "https://youtu.be/5hN_dQwah5U?si=BnaMLGkSunxDUVzh";
          needsUpdate = true;
        }

        // Migration for pajak-1
        if ((m.id === "pajak-1" || m.id === "d3b07384-d113-43d6-a5cc-ef6113b2c1a4") && !m.content.trim().startsWith("[")) {
          m.content = JSON.stringify([
            {
              id: "pajak-b1",
              type: "text",
              value: `Perpajakan Indonesia mengatur secara ketat tata cara penyusutan fiskal untuk menghitung Pajak Penghasilan (PPh):

Aturan Kunci Penyusutan Pajak:
1. Metode yang Diperbolehkan:
   - Hanya Metode Garis Lurus dan Metode Saldo Menurun.
2. Aturan Aset Bangunan:
   - Bangunan WAJIB disusutkan menggunakan Metode Garis Lurus. Metode Saldo Menurun dilarang untuk kelompok bangunan.
3. Nilai Residu Diabaikan:
   - Nilai sisa (nilai residu) akhir masa manfaat dianggap Rp0 dalam perhitungan pajak.
4. Mulai Penyusutan:
   - Penyusutan fiskal dimulai pada bulan dilakukannya pengeluaran/perolehan aset tetap, bukan saat mulai beroperasi.
5. Pembulatan Umur Manfaat:
   - Aset harus dicocokkan ke 4 kelompok harta bukan bangunan atau kelompok bangunan yang sudah ditentukan tarif pajaknya.`
            }
          ]);
          m.video_url = "";
          needsUpdate = true;
        }

        return m;
      });

        if (needsUpdate) {
          for (const m of updatedData) {
            await supabase.from("materials").update({ content: m.content, video_url: m.video_url }).eq("id", m.id);
          }
          setMaterials(updatedData);
        } else {
          setMaterials(data);
        }
      } else {
        const { error: seedError } = await supabase.from("materials").insert(defaultMaterials);
        if (seedError) {
          console.error("Gagal melakukan seeding default materials:", seedError);
        }
        setMaterials(defaultMaterials);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditorMode("ADD");
    setFormTitle("");
    setFormCategory(activeCategory);
    setEditorBlocks([{ id: "b-" + Math.random().toString(36).substring(2, 9), type: "text", value: "" }]);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditorMode("EDIT");
    setSelectedMaterialId(material.id);
    setFormTitle(material.title);
    setFormCategory(material.category);
    setEditorBlocks(parseMaterialContent(material.content, material.video_url));
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
      showLoading("Menghapus materi pembelajaran...");
      try {
        const { error } = await supabase.from("materials").delete().eq("id", id);
        if (error) {
          alert("Gagal menghapus materi dari database: " + error.message);
          return;
        }
        await fetchMaterials();
      } catch (err: any) {
        alert("Terjadi kesalahan: " + err.message);
      } finally {
        hideLoading();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) {
      alert("Judul materi wajib diisi!");
      return;
    }

    const hasContent = editorBlocks.some(b => b.value.trim() !== "");
    if (!hasContent) {
      alert("Materi harus memiliki setidaknya satu blok konten!");
      return;
    }

    const serializedBlocks = JSON.stringify(editorBlocks);
    const firstMediaBlock = editorBlocks.find(b => b.type === "video" || b.type === "pdf");
    const firstMediaUrl = firstMediaBlock ? firstMediaBlock.value : "";

    showLoading("Menyimpan materi pembelajaran...");
    try {
      if (editorMode === "ADD") {
        const newMat = {
          title: formTitle,
          content: serializedBlocks,
          video_url: firstMediaUrl,
          category: formCategory,
          order_index: materials.length + 1
        };
        const { error } = await supabase.from("materials").insert(newMat);
        if (error) {
          alert("Gagal menambahkan materi ke database: " + error.message);
          return;
        }
      } else if (editorMode === "EDIT" && selectedMaterialId) {
        const { error } = await supabase.from("materials").update({
          title: formTitle,
          content: serializedBlocks,
          video_url: firstMediaUrl,
          category: formCategory
        }).eq("id", selectedMaterialId);
        if (error) {
          alert("Gagal memperbarui materi di database: " + error.message);
          return;
        }
      }

      await fetchMaterials();
      setIsEditorOpen(false);
    } catch (err: any) {
      alert("Terjadi kesalahan saat menyimpan: " + err.message);
    } finally {
      hideLoading();
    }
  };

  const handleAddBlock = (type: "text" | "video" | "pdf") => {
    const newBlock: ContentBlock = {
      id: "b-" + Math.random().toString(36).substring(2, 9),
      type,
      value: "",
      title: ""
    };
    setEditorBlocks([...editorBlocks, newBlock]);
  };

  const handleUpdateBlockValue = (index: number, value: string) => {
    const updated = [...editorBlocks];
    updated[index].value = value;
    setEditorBlocks(updated);
  };

  const handleUpdateBlockTitle = (index: number, title: string) => {
    const updated = [...editorBlocks];
    if (updated[index].type !== "text") {
      (updated[index] as any).title = title;
    }
    setEditorBlocks(updated);
  };

  const handleDeleteBlock = (index: number) => {
    if (editorBlocks.length <= 1) {
      alert("Materi harus memiliki setidaknya satu blok konten!");
      return;
    }
    setEditorBlocks(editorBlocks.filter((_, idx) => idx !== index));
  };

  const handleMoveBlock = (index: number, direction: "UP" | "DOWN") => {
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editorBlocks.length) return;

    const updated = [...editorBlocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setEditorBlocks(updated);
  };

  const handleBlockFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingFile(true);
    showLoading("Mengunggah berkas materi...");
    try {
      const url = await uploadFile(file);
      const updated = [...editorBlocks];
      updated[index].value = url;
      updated[index].type = file.type.startsWith("video/") ? "video" : "pdf";
      if (!updated[index].title) {
        (updated[index] as any).title = file.name.replace(/\.[^/.]+$/, "");
      }
      setEditorBlocks(updated);
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Gagal mengunggah file. Silakan coba lagi.");
    } finally {
      setUploadingFile(false);
      hideLoading();
    }
  };

  // Safe inline markdown renderer helpers
  const formatInlineMarkdown = (text: string) => {
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // **bold** -> <strong>
    let formatted = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // *italic* -> <em>
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // `code` -> <code>
    formatted = formatted.replace(/`(.*?)`/g, "<code class='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-[11px] text-brand-600 dark:text-brand-400 font-bold'>$1</code>");
    return formatted;
  };

  // Line-by-line renderer for materials text
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    let currentList: React.ReactNode[] = [];
    let listType: "ul" | "ol" | null = null;
    let keyCounter = 0;

    const flushList = () => {
      if (listType === "ul" && currentList.length > 0) {
        elements.push(
          <ul key={`ul-${keyCounter++}`} className="list-disc list-inside space-y-1 my-3 pl-4 text-gray-700 dark:text-gray-300 text-sm">
            {currentList}
          </ul>
        );
      } else if (listType === "ol" && currentList.length > 0) {
        elements.push(
          <ol key={`ol-${keyCounter++}`} className="list-decimal list-inside space-y-1 my-3 pl-4 text-gray-700 dark:text-gray-300 text-sm">
            {currentList}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === "") {
        flushList();
        continue;
      }

      // Headers starting with ###
      if (line.startsWith("###")) {
        flushList();
        elements.push(
          <h4 key={`h-${keyCounter++}`} className="text-base font-bold text-gray-800 dark:text-white mt-5 mb-2" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.substring(3).trim()) }} />
        );
      } else if (line.startsWith("##")) {
        flushList();
        elements.push(
          <h3 key={`h-${keyCounter++}`} className="text-lg font-bold text-gray-800 dark:text-white mt-6 mb-3" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.substring(2).trim()) }} />
        );
      } else if (line.startsWith("#")) {
        flushList();
        elements.push(
          <h2 key={`h-${keyCounter++}`} className="text-xl font-bold text-gray-800 dark:text-white mt-7 mb-4" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.substring(1).trim()) }} />
        );
      }
      // Heading lines ending with : (capital lines or specific markers like I, II)
      else if (trimmed.endsWith(":") && (trimmed.length < 60 || trimmed.startsWith("I.") || trimmed.startsWith("II."))) {
        flushList();
        elements.push(
          <h4 key={`h-${keyCounter++}`} className="text-xs font-bold text-gray-900 dark:text-white mt-5 mb-2 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
        );
      }
      // Bullet items starting with - or *
      else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        const listContent = trimmed.substring(2).trim();
        currentList.push(
          <li key={`li-${keyCounter++}`} className="leading-relaxed pl-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(listContent) }} />
        );
      }
      // Numbered items
      else if (/^\d+\.\s+/.test(trimmed)) {
        if (listType !== "ol") {
          flushList();
          listType = "ol";
        }
        const match = trimmed.match(/^(\d+)\.\s+(.*)/);
        const listContent = match ? match[2].trim() : trimmed;
        currentList.push(
          <li key={`li-${keyCounter++}`} className="leading-relaxed pl-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(listContent) }} />
        );
      }
      // General paragraph
      else {
        flushList();
        const isIndent = line.startsWith("   ") || line.startsWith("  ") || line.startsWith("\t");
        const indentClass = isIndent ? "pl-6 text-xs text-gray-500 dark:text-gray-400 font-semibold" : "text-sm text-gray-650 dark:text-gray-300";
        elements.push(
          <p key={`p-${keyCounter++}`} className={`leading-relaxed my-2 ${indentClass}`} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
        );
      }
    }

    flushList();
    return elements;
  };

  const categories: { key: typeof activeCategory; label: string }[] = [
    { key: "DEFINISI", label: "Definisi & Karakteristik" },
    { key: "KELOMPOK", label: "Kelompok Aset (Pajak)" },
    { key: "SAK", label: "Metode SAK" },
    { key: "PAJAK", label: "Ketentuan Pajak" }
  ];

  const filteredMaterials = materials.filter((m) => m.category === activeCategory);
  const isGuru = user && user.role === "GURU";

  // Search filter for Tax groups
  const filteredTaxGroups = taxGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTaxQuery.toLowerCase()) ||
      g.examples.toLowerCase().includes(searchTaxQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-sm dark:bg-gray-950">
        <h2 className="font-heading font-semibold text-2xl text-gray-900 dark:text-white">
          {user ? `Halo, ${user.full_name}! 👋` : "Selamat Datang di ClickAsset! 👋"}
        </h2>
        <p className="text-brand-600 dark:text-brand-400 text-xs font-mono font-bold mt-1.5 uppercase tracking-wide">
          Cloud-based Learning Innovation for Comprehensive Knowledge in Asset Simulation
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2.5 max-w-xl leading-relaxed">
          ClickAsset membantu Anda menguasai pencatatan beban penyesuaian penyusutan aset tetap secara komparatif antara aturan akuntansi komersial (SAK) dan perpajakan (fiskal).
        </p>
      </div>

      {/* Dashboard Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {/* Card 1 */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white py-5 px-6 shadow-theme-xs dark:bg-gray-950">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
            <BookOpen className="text-brand-500 dark:text-brand-400 size-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">4 Kategori</h4>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Modul Belajar Dinamik</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white py-5 px-6 shadow-theme-xs dark:bg-gray-950">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
            <Activity className="text-emerald-500 dark:text-emerald-400 size-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Komparatif</h4>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Analisis SAK vs Pajak PPh</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white py-5 px-6 shadow-theme-xs dark:bg-gray-950">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-50 dark:bg-warning-500/10">
            <Award className="text-warning-500 dark:text-warning-400 size-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">6 Tahap</h4>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Simulator Siklus Aset</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white py-5 px-6 shadow-theme-xs dark:bg-gray-950">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
            <Users className="text-indigo-500 dark:text-indigo-400 size-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Kuis Room</h4>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Evaluasi Belajar Real-time</span>
          </div>
        </div>
      </div>

      {/* Tabs and Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar-like Tabs */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                if (!user && cat.key !== "DEFINISI") {
                  window.dispatchEvent(new CustomEvent("show-auth-modal", {
                    detail: { message: `Ingin mempelajari materi "${cat.label}"? Yuk, login terlebih dahulu!` }
                  }));
                  return;
                }
                setActiveCategory(cat.key);
              }}
              className={`px-4 py-3 rounded-lg font-semibold text-sm text-left whitespace-nowrap lg:whitespace-normal transition-all border cursor-pointer flex-1 lg:flex-none
                ${activeCategory === cat.key
                  ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                  : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-400"
                }`}
            >
              {cat.label}
            </button>
          ))}
          {isGuru && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-3 rounded-lg font-bold text-sm text-center border border-dashed border-brand-500/50 hover:border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50/20 dark:hover:bg-brand-500/5 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Materi
            </button>
          )}
        </div>

        {/* Learning Materials Display */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            /* Skeleton Loading Cards */
            <div className="space-y-6 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-sm dark:bg-gray-950 md:p-8 space-y-4">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="space-y-2 pt-2">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-12 text-center dark:bg-gray-950">
              <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="font-heading font-semibold text-lg text-gray-800 dark:text-white">Belum ada materi</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Silakan tambah materi baru menggunakan akun Guru.</p>
            </div>
          ) : (
            filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-sm dark:bg-gray-950 md:p-8 space-y-5 relative group"
              >
                {/* Guru Action Overlay */}
                {isGuru && (
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(mat)}
                      className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-brand-500 dark:text-brand-400 rounded border border-gray-200 dark:border-gray-700 transition cursor-pointer"
                      title="Edit materi"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mat.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 text-red-500 rounded border border-red-100 dark:border-red-500/20 transition cursor-pointer"
                      title="Hapus materi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Material Header */}
                <div className="border-b border-gray-150 dark:border-gray-850 pb-4 max-w-[80%]">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 uppercase tracking-wider">
                    {activeCategory}
                  </span>
                  <h3 className="font-heading font-bold text-lg md:text-xl text-gray-900 dark:text-white mt-2">
                    {mat.title}
                  </h3>
                </div>

                {/* Block-Based Content Rendering */}
                <div className="space-y-6">
                  {(() => {
                    const blocks = parseMaterialContent(mat.content, mat.video_url);

                    return blocks.map((block, idx) => {
                      if (block.type === "text") {
                        return (
                          <div key={block.id || idx} className="space-y-3">
                            {renderMarkdown(block.value)}
                          </div>
                        );
                      }

                      const resolvedUrl = resolveMediaUrl(block.value);
                      const isPdf = block.type === "pdf" || isPdfUrl(block.value);
                      const blockTitle = block.title || (isPdf ? "Dokumen Lampiran" : "Video Penjelas");

                      return isPdf ? (
                        <div key={block.id || idx} className="w-full max-w-3xl mx-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-theme-xs space-y-3 p-4">
                          <div className="flex items-center justify-between border-b pb-2 border-gray-150 dark:border-gray-850">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate max-w-[70%]">
                              📄 {blockTitle}
                            </span>
                            <a
                              href={resolvedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] sm:text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-semibold cursor-pointer shrink-0"
                            >
                              Buka Tab Baru ↗
                            </a>
                          </div>
                          <div className="w-full h-[350px] md:h-[400px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-150 dark:border-gray-850">
                            <iframe
                              src={resolvedUrl}
                              title={blockTitle}
                              className="w-full h-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <div key={block.id || idx} className="w-full max-w-2xl mx-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-black shadow-theme-xs">
                          <div className="relative pb-[56.25%] h-0">
                            <iframe
                              src={resolvedUrl}
                              title={blockTitle}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute top-0 left-0 w-full h-full"
                            />
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Video className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                            <span className="truncate">{blockTitle}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ))
          )}

          {/* INTERACTIVE MODULE INJECTIONS */}

          {/* DEFINISI TAB: "Apakah Ini Aset Tetap?" check game */}
          {activeCategory === "DEFINISI" && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-sm dark:bg-gray-950 mt-6 space-y-4">
              <div className="border-b border-gray-150 dark:border-gray-850 pb-3">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
                  <HelpCircle className="size-4.5 text-brand-500" />
                  Kuis Mini: Manakah yang Termasuk Aset Tetap?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Uji pemahaman Anda mengenai karakteristik aset tetap dengan mengklik salah satu objek di bawah.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {defGameItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDefId(item.id)}
                    className={`p-3 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${selectedDefId === item.id
                        ? item.isAsset
                          ? "bg-success-50 border-success-500 text-success-800 dark:bg-success-950/20 dark:text-success-400"
                          : "bg-orange-50 border-orange-500 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-300"
                      }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Show response explanation */}
              {selectedDefId && (
                <div className={`p-4 rounded-lg border text-xs leading-relaxed animate-fadeIn ${defGameItems.find(i => i.id === selectedDefId)?.isAsset
                    ? "bg-success-50 border-success-100 text-success-800 dark:bg-success-950/10 dark:border-success-900 dark:text-success-400"
                    : "bg-orange-50 border-orange-100 text-orange-800 dark:bg-orange-950/10 dark:border-orange-900 dark:text-orange-400"
                  }`}>
                  <div className="flex items-start gap-2">
                    {defGameItems.find(i => i.id === selectedDefId)?.isAsset ? (
                      <CheckCircle2 className="size-4.5 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
                    )}
                    <span>
                      {defGameItems.find(i => i.id === selectedDefId)?.reason}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KELOMPOK TAB: Interactive Tax Group Table & Search Finder */}
          {activeCategory === "KELOMPOK" && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-sm dark:bg-gray-950 mt-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-150 dark:border-gray-850 pb-3 gap-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
                    <Search className="size-4.5 text-brand-500" />
                    Tabel & Pencari Kelompok Pajak PPh
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Ketik nama aset untuk menyaring dan mencocokkan kelompok penyusutan pajak secara cepat.
                  </p>
                </div>

                {/* Search box input */}
                <div className="relative shrink-0 w-full md:w-64">
                  <input
                    type="text"
                    value={searchTaxQuery}
                    onChange={(e) => setSearchTaxQuery(e.target.value)}
                    placeholder="Ketik kata kunci (misal: Mobil)..."
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-xs text-gray-800 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-gray-400" />
                </div>
              </div>

              {/* Table rendering list */}
              <div className="overflow-x-auto custom-scrollbar border border-gray-200 dark:border-gray-800 rounded-lg">
                <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
                  <thead className="text-[10px] text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-300">
                    <tr>
                      <th className="px-3 py-2">Kelompok Harta</th>
                      <th className="px-3 py-2 text-center">Masa Manfaat</th>
                      <th className="px-3 py-2 text-center">Garis Lurus</th>
                      <th className="px-3 py-2 text-center">Saldo Menurun</th>
                      <th className="px-3 py-2">Contoh Aset</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTaxGroups.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-400">
                          Aset tidak ditemukan. Coba ketik "Komputer", "Mebel", atau "Mobil".
                        </td>
                      </tr>
                    ) : (
                      filteredTaxGroups.map((g) => {
                        const isMatch = searchTaxQuery !== "" && (
                          g.name.toLowerCase().includes(searchTaxQuery.toLowerCase()) ||
                          g.examples.toLowerCase().includes(searchTaxQuery.toLowerCase())
                        );
                        return (
                          <tr
                            key={g.key}
                            className={`border-b border-gray-100 dark:border-gray-850 transition-colors ${isMatch ? "bg-brand-50/50 dark:bg-brand-500/10 font-medium" : "hover:bg-gray-50/30"
                              }`}
                          >
                            <td className="px-3 py-3 font-semibold text-gray-900 dark:text-white">{g.name}</td>
                            <td className="px-3 py-3 text-center">{g.life}</td>
                            <td className="px-3 py-3 text-center font-mono font-bold text-brand-600 dark:text-brand-400">{g.gl}</td>
                            <td className="px-3 py-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-500">{g.sm}</td>
                            <td className="px-3 py-3 text-slate-500 dark:text-slate-400 italic max-w-xs truncate" title={g.examples}>
                              {g.examples}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SAK & PAJAK TAB: Interactive Depreciation Comparison Sandbox */}
          {(activeCategory === "SAK" || activeCategory === "PAJAK") && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-theme-sm dark:bg-gray-950 mt-6 space-y-4">
              <div className="border-b border-gray-150 dark:border-gray-850 pb-3">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
                  <Calculator className="size-4.5 text-brand-500" />
                  Depreciation Sandbox: Cek Beban Tahun Ke-1
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Masukkan nilai harga perolehan dan masa manfaat untuk membandingkan langsung beban penyusutan tahun pertama komersial vs pajak.
                </p>
              </div>

              {/* Calculator Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Harga Perolehan (Rp)
                  </label>
                  <input
                    type="number"
                    value={sandboxCost}
                    onChange={(e) => setSandboxCost(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 rounded-lg text-xs text-gray-800 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Masa Manfaat (Tahun)
                  </label>
                  <input
                    type="number"
                    value={sandboxLife}
                    onChange={(e) => setSandboxLife(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 rounded-lg text-xs text-gray-800 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Nilai Residu SAK (Rp)
                  </label>
                  <input
                    type="number"
                    value={sandboxResidu}
                    onChange={(e) => setSandboxResidu(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 rounded-lg text-xs text-gray-800 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Outputs cards comparisons */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                {/* SAK GL */}
                <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">SAK - Garis Lurus</span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format((sandboxCost - sandboxResidu) / sandboxLife)}
                  </span>
                </div>
                {/* SAK SM */}
                <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">SAK - Saldo Menurun</span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(sandboxCost * (2 / sandboxLife))}
                  </span>
                </div>
                {/* Pajak GL */}
                <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Pajak - Garis Lurus</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(sandboxCost * (1 / sandboxLife))}
                  </span>
                </div>
                {/* Pajak SM */}
                <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Pajak - Saldo Menurun</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(sandboxCost * (2 / sandboxLife))}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 leading-relaxed text-left flex gap-1 items-start bg-blue-50/30 dark:bg-gray-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                <AlertCircle className="size-3.5 text-brand-500 mt-0.5 shrink-0" />
                <span>
                  Catatan: Terlihat di atas bahwa versi Pajak memiliki beban lebih tinggi jika ada Nilai Residu pada SAK, karena undang-undang perpajakan di Indonesia tidak memperhitungkan nilai sisa dalam formulanya.
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Guru Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-2xl dark:bg-gray-950 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative text-gray-900 dark:text-white custom-scrollbar">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-4">
              {editorMode === "ADD" ? "Tambah Materi Pembelajaran" : "Edit Materi Pembelajaran"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Judul Materi</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ketik judul materi (contoh: Konsep Nilai Residu)"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-brand-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 py-2 px-3 text-gray-800 outline-none dark:text-white focus:border-brand-500"
                >
                  <option value="DEFINISI">Definisi & Karakteristik</option>
                  <option value="KELOMPOK">Kelompok Aset (Pajak)</option>
                  <option value="SAK">Metode SAK</option>
                  <option value="PAJAK">Ketentuan Pajak</option>
                </select>
              </div>

              {/* Block-Based Editor Section */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Susunan Blok Konten (Notion-Style)
                </label>

                <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                  {editorBlocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 space-y-3 relative group"
                    >
                      {/* Block Header Controls */}
                      <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-105 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                            {block.type === "text" ? "Teks" : block.type === "video" ? "Video YouTube" : "Dokumen PDF"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">Blok #{index + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(index, "UP")}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Pindah Ke Atas"
                          >
                            ⬆️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(index, "DOWN")}
                            disabled={index === editorBlocks.length - 1}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Pindah Ke Bawah"
                          >
                            ⬇️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(index)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-700 cursor-pointer ml-1"
                            title="Hapus Blok"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Block Content Inputs */}
                      {block.type === "text" ? (
                        <div>
                          <textarea
                            value={block.value}
                            onChange={(e) => handleUpdateBlockValue(index, e.target.value)}
                            placeholder="Ketik konten teks/markdown di sini. Anda bisa menggunakan **tebal**, *miring*, dan # header."
                            rows={4}
                            className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 py-2 px-3 text-gray-800 outline-none transition focus:border-brand-500 dark:text-white font-sans"
                          />
                        </div>
                      ) : block.type === "video" ? (
                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-0.5">Judul Video</label>
                            <input
                              type="text"
                              value={block.title}
                              onChange={(e) => handleUpdateBlockTitle(index, e.target.value)}
                              placeholder="Masukkan judul video (contoh: Video Definisi Aset Tetap)"
                              className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-955 p-2 text-gray-850 dark:text-white outline-none focus:border-brand-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-0.5">URL Video YouTube</label>
                            <input
                              type="text"
                              value={block.value}
                              onChange={(e) => handleUpdateBlockValue(index, e.target.value)}
                              placeholder="Contoh: https://www.youtube.com/watch?v=..."
                              className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-955 p-2 text-gray-850 dark:text-white outline-none focus:border-brand-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-0.5">Judul Dokumen</label>
                            <input
                              type="text"
                              value={block.title}
                              onChange={(e) => handleUpdateBlockTitle(index, e.target.value)}
                              placeholder="Masukkan judul dokumen (contoh: PDF Harta Berwujud Perpajakan)"
                              className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-955 p-2 text-gray-855 dark:text-white outline-none focus:border-brand-500"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-0.5">Unggah File PDF</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => handleBlockFileUpload(index, e)}
                                  className="block w-full text-xs text-gray-505 dark:text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400 cursor-pointer"
                                />
                                {uploadingFile && <span className="text-[10px] text-gray-450 animate-pulse shrink-0">Mengunggah...</span>}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-0.5">Atau Masukkan URL PDF Manual</label>
                              <input
                                type="text"
                                value={block.value}
                                onChange={(e) => handleUpdateBlockValue(index, e.target.value)}
                                placeholder="https://example.com/materi.pdf"
                                className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-955 p-2 text-gray-855 dark:text-white outline-none focus:border-brand-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add block controls */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => handleAddBlock("text")}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border border-brand-500 text-brand-600 hover:bg-brand-50/30 dark:border-brand-500/50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Blok Teks
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("video")}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border border-brand-500 text-brand-600 hover:bg-brand-50/30 dark:border-brand-500/50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Video YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("pdf")}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border border-brand-500 text-brand-600 hover:bg-brand-50/30 dark:border-brand-500/50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Dokumen PDF
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className={`flex items-center gap-2 px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-lg transition shadow-md cursor-pointer ${uploadingFile ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Save className="w-4 h-4" />
                  Simpan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materi;
