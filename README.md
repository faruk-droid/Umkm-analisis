# SMART-BIZ — Opsi Tepat, Bukan Sekedar Firasat

Platform web analitik keputusan bisnis yang membantu calon pengusaha dan pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) mengevaluasi kelayakan rencana usaha, menguji ketahanan modal, menghitung titik impas (Break-Even Point), dan menganalisis risiko bisnis secara terukur sebelum modal terlanjur diinvestasikan.

Nama proyek bersifat fleksibel dan dapat diganti kapan saja melalui file konfigurasi atau menu **Pengaturan**.

---

## 1. Fitur Utama yang Sudah Berfungsi Penuh

1. **Jalur Calon Pengusaha (Business Planning)**:
   - Formulir bertahap adaptif (Profil Bisnis, Struktur Modal & Biaya, Target Pasar, Pengalaman).
   - Fitur "Saya Belum Tahu" yang memperhitungkan ketidakpastian data.
   - Tombol instan **"Isi Data Demo (Kopi Seduh)"** untuk pengujian langsung tanpa mengetik.

2. **Jalur Pelaku UMKM (Business Growth & Optimization)**:
   - Formulir evaluasi operasional (Omset aktual, Biaya tetap, COGS per unit, Produk slow-moving vs hero).
   - Tombol instan **"Isi Data Demo (Keripik Singkong)"**.

3. **Kalkulator Finansial Deterministik (Bebas Halusinasi)**:
   - Menghitung omset bulanan, biaya variabel, beban tetap, laba operasional, dan margin laba.
   - Perhitungan Break-Even Point (BEP) dalam satuan unit dan rupiah omset.
   - Proteksi aman dari pembagian dengan nol (*zero-division safe*).
   - Deteksi margin kontribusi negatif (memberikan peringatan bahwa BEP mustahil dicapai jika struktur harga lebih rendah dari biaya variabel).
   - Estimasi runway modal kas (berapa bulan dana cadangan bertahan dalam skenario defisit).

4. **Scenario Simulator (Konservatif, Moderat, Optimistis)**:
   - Tabel dan grafik batang perbandingan visual menggunakan Recharts.
   - Uji stres-tes penurunan volume penjualan (-30%) dan lonjakan biaya bahan (+10%).
   - **Playground Sensitivitas Interaktif** dengan slider perubahan volume dan harga secara real-time.

5. **Matriks Evaluasi Risiko Bisnis**:
   - Penilaian heuristik transparan (Likuiditas modal, struktur biaya, komitmen sewa tempat tanpa validasi, ketergantungan produk tunggal).
   - Klasifikasi tingkat keparahan (*Kritis*, *Tinggi*, *Sedang*, *Rendah*).
   - Rekomendasi langkah mitigasi konkret.

6. **Tingkat Keyakinan Data (Data Confidence Score)**:
   - Bukan skor kepastian buatan (*no fake 99% accuracy*).
   - Dihitung transparan berdasarkan kelengkapan parameter formulir dan jumlah variabel "belum tahu".

7. **Business AI Chatbot Kontekstual**:
   - Chatbot yang terikat ketat pada data snapshot laporan yang sedang dibuka.
   - Mendukung pertanyaan skenario sensitivitas (misal: *"Apa yang terjadi jika penjualan turun 20%?"*).
   - Memiliki fallback cerdas deterministik bila kunci API eksternal belum diisi.

8. **Cetak / Ekspor PDF**:
   - Tampilan cetak yang dioptimasi dengan print stylesheet bersih (`window.print()`).

9. **Penyimpanan Lokal & Skema Supabase Siap Pakai**:
   - Berfungsi 100% *out-of-the-box* menggunakan local browser storage tanpa perlu login database awal.
   - File skema SQL lengkap (`supabase/schema.sql`) dengan Row Level Security (RLS) siap digunakan untuk deployment produksi.

---

## 2. Kebutuhan Sistem & Instalasi

### Prasyarat
- **Node.js**: Versi 18+ (direkomendasikan v20+)
- **npm**: Versi 9+

### Langkah Pemasangan & Menjalankan Aplikasi
```bash
# 1. Pastikan dependensi telah terpasang
npm install

# 2. Salin environment example
cp .env.example .env.local

# 3. Jalankan pengujian unit kalkulator finansial
npm run test

# 4. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban di `http://localhost:3000`.

---

## 3. Variabel Lingkungan (.env.local)

Lihat `.env.example`:
```env
NEXT_PUBLIC_APP_NAME="SMART-BIZ"

# Server-side AI provider. Pengunjung website tidak perlu login.
GEMINI_API_KEY=""
OPENAI_API_KEY=""
AI_PROVIDER="gemini"

# Opsional: Konfigurasi Supabase
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

NEXT_PUBLIC_DEMO_MODE="true"
```

Untuk mengaktifkan AI, buat satu key di [Google AI Studio](https://aistudio.google.com/apikey), simpan sebagai `GEMINI_API_KEY` di `.env.local`, lalu restart `npm run dev`. Untuk Vercel, tambahkan key di **Project Settings → Environment Variables** dan redeploy. Jangan memakai variabel `NEXT_PUBLIC_` untuk key dan jangan commit atau membagikannya. Model Gemini yang digunakan adalah `gemini-3.5-flash-lite`. Pengunjung aplikasi tidak perlu akun; pemilik perlu masuk ke Google AI Studio untuk membuat key. Kuota dan biaya mengikuti ketentuan provider.

Lampiran laporan PDF teks, XLSX, atau CSV dapat diproses tanpa API key. Sistem mengekstrak angka utama laba rugi, arus kas, dan neraca yang labelnya dikenali, lalu menjalankan pemeriksaan aritmetika dasar. Angka historis dari lampiran ditampilkan terpisah dari skenario bulanan yang tetap dihitung menggunakan input formulir; validasi periode dan interpretasi akuntansi tetap perlu dilakukan manual. Pada jalur Growth, jika laporan tidak dilampirkan, Data Confidence dikurangi 15 poin dan daftar verifikasi menandai bahwa analisis hanya memakai input formulir. Jalur Planner tidak memerlukan lampiran historis. Jika API key dikonfigurasi, teks lampiran juga dapat dianalisis oleh provider AI.

---

## 4. Pengujian Otomatis (Unit Testing)

Kalkulator finansial diuji menggunakan Vitest:
```bash
npm run test
```
Cakupan pengujian:
1. Akurasi pendapatan, total biaya, laba operasional, dan margin laba.
2. Penanganan pembagian dengan nol ketika pendapatan atau unit bernilai 0.
3. Deteksi kontribusi negatif (harga jual < biaya variabel).
4. Perhitungan runway modal kerja saat defisit operasional.
5. Konsistensi 3 skenario pasar.
6. Deteksi dini risiko modal kritis dan komitmen sewa fisik.

---

## 5. Status Fitur & Keterbatasan

| Fitur | Status | Catatan |
|---|---|---|
| Kalkulator Finansial & BEP | **Aktif & Teruji** | Deterministik berbasis rumus unit economics |
| Scenario Simulator & Slider | **Aktif & Teruji** | Dinamis di sisi klien |
| Risk Assessment Matrix | **Aktif & Teruji** | Heuristik transparan |
| Business AI Chat | **Aktif** | Mode LLM jika ada API key, fallback rule-based jika offline |
| Local Storage Demo Mode | **Aktif** | Langsung berfungsi tanpa registrasi |
| Supabase Auth & RLS | **Skema Tersedia** | File `supabase/schema.sql` siap dieksekusi |
| Integrasi API Data BPS/Peta Riil | **Konseptual (Tahap Berikutnya)** | Diberi label transparan "Belum Terhubung" |
