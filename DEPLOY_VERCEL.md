# Panduan Deploy ke Vercel — SMART-BIZ

Proyek ini telah dikonfigurasi penuh dengan Next.js 14 App Router dan siap dideploy ke Vercel secara *zero-config*.

---

## Opsi 1: Deploy via GitHub (Paling Direkomendasikan)

Metode ini memungkinkan deployment otomatis setiap kali Anda melakukan `git push`.

### Langkah 1: Buat Repository di GitHub
1. Buka [github.com/new](https://github.com/new).
2. Beri nama repository, misalnya: `umkm-insight-ai`.
3. Pilih **Public** atau **Private**, lalu klik **Create repository**.

### Langkah 2: Hubungkan & Push Kode dari Komputer Anda
Buka terminal PowerShell di folder proyek ini (`c:\Users\breed\Desktop\ESAI TEMPEKK`), lalu jalankan:

```powershell
git remote add origin https://github.com/USERNAME_ANDA/umkm-insight-ai.git
git push -u origin main
```
*(Ganti `USERNAME_ANDA` dengan username GitHub Anda)*

### Langkah 3: Import ke Vercel
1. Buka [vercel.com](https://vercel.com) dan login (bisa login dengan akun GitHub).
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Cari repository `umkm-insight-ai` yang baru Anda buat, lalu klik **"Import"**.
4. Di bagian **Environment Variables**, tambahkan variabel:
   - `NEXT_PUBLIC_APP_NAME` : `SMART-BIZ`
   - `AI_PROVIDER` : `gemini`
   - `GEMINI_API_KEY` : *(Buat satu key server-side di [Google AI Studio](https://aistudio.google.com/apikey))*
   - `NEXT_PUBLIC_DEMO_MODE` : `true`
   *(Jika key tidak diisi, aplikasi tetap menggunakan analisis deterministik. Jangan gunakan prefix `NEXT_PUBLIC_` pada key.)*
5. Klik **"Deploy"**.
6. Tunggu sekitar 1-2 menit hingga proses build selesai. Domain gratis dari Vercel (misal: `umkm-insight-ai.vercel.app`) akan langsung aktif!

---

## Opsi 2: Deploy Langsung Menggunakan Vercel CLI (Tanpa Buka Browser)

Jika Anda tidak ingin membuat repository GitHub terlebih dahulu:

1. Jalankan perintah berikut di terminal:
   ```powershell
   npx vercel
   ```
2. Terminal akan memandu Anda:
   - Tekan `y` untuk konfirmasi setup.
   - Login ke akun Vercel Anda di peramban yang terbuka otomatis.
   - Pilih scope / tim akun Anda.
   - Link to existing project? Jawab `N`.
   - What's your project's name? Tekan Enter (default: `umkm-insight-ai`).
   - In which directory is your code located? Tekan Enter (`./`).
   - Want to modify settings? Jawab `N`.
3. Setelah beberapa detik, link deploy preview akan diberikan.
4. Untuk deploy ke domain production utama, jalankan:
   ```powershell
   npx vercel --prod
   ```

---

## Checklist Kesiapan Vercel

- [x] Framework: Next.js App Router dideteksi otomatis (`vercel.json` telah disiapkan).
- [x] Build Test: `npm run build` sukses 100% tanpa error TypeScript/Linting.
- [x] Client-Safe Storage: LocalStorage dan objek browser hanya diakses pada sisi klien (`"use client"` & pengecekan `typeof window !== "undefined"`).
- [x] API Routes Serverless: Endpoint `/api/ai/analyze` dan `/api/ai/chat` siap berjalan sebagai Vercel Serverless Functions.
