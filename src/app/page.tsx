import Link from "next/link";
import { APP_CONFIG } from "@/lib/config";
import {
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  HelpCircle,
  Cpu,
  Layers,
  Scale,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-6 shadow-sm">
              <Scale className="w-3.5 h-3.5" />
              <span>Sistem Pendukung Keputusan Bisnis Terukur</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
              Ambil Keputusan Usaha Berdasarkan Data,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-700">
                Bukan Sekadar Firasat
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Bantu calon pengusaha dan pemilik UMKM mengevaluasi kelayakan rencana usaha,
              menghitung Break-Even Point (BEP) riil, menguji 3 skenario pasar, dan memitigasi risiko finansial sebelum modal terlanjur keluar.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/analysis/new/planner"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-base shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Mulai Analisis Rencana Bisnis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/analysis/new/growth"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium text-base shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <span>Analisis Usaha Berjalan</span>
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              *Tersedia Mode Demo Instan. Tidak memerlukan pendaftaran akun untuk mencoba kalkulasi.
            </p>
          </div>
        </div>
      </section>

      {/* MASALAH & REALITAS UMKM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Masalah Terbesar yang Ingin Diselesaikan
              </h2>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                Banyak usaha rintisan tutup di tahun pertama bukan karena produknya buruk, melainkan karena salah menghitung biaya tetap, mengabaikan titik impas (BEP), atau terburu-buru menyewa tempat fisik sebelum pasar terbukti. 
                Platform ini bukan sekadar chatbot yang selalu mengiyakan ide Anda, melainkan rekan analis kritis yang membantu menguji ketahanan finansial rencana Anda sebelum berinvestasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DUA LAYANAN UTAMA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Dua Jalur Analisis yang Disesuaikan
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Pilih jalur yang sesuai dengan tahapan usaha Anda saat ini
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Jalur A: Calon Pengusaha */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg mb-6">
                A
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Calon Pengusaha — Business Planning
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Untuk Anda yang baru memiliki ide atau sedang mempersiapkan pembukaan bisnis baru.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>Kalkulasi kecukupan modal awal & perkiraan runway kas</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>Hitung Break-Even Point (unit & nominal omset bulanan)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>Perbandingan model usaha: Toko fisik vs Rumah vs Pre-Order</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>Identifikasi risiko belanja aset awal (Capex) yang berlebihan</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/analysis/new/planner"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Mulai Rencana Bisnis Baru</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Jalur B: Pelaku UMKM */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mb-6">
                B
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Pelaku UMKM — Business Growth & Optimization
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Untuk usaha yang sudah beroperasi dan ingin mengevaluasi profitabilitas serta strategi ekspansi.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Evaluasi margin laba aktual vs beban operasional</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Analisis produk unggulan vs produk lambat terjual</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Simulasi dampak kenaikan harga bahan atau biaya sewa</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Rekomendasi pemecahan kendala kapasitas & efisiensi</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/analysis/new/growth"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Evaluasi Usaha yang Sedang Berjalan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CARA KERJA SISTEM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Cara Kerja Platform
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            4 langkah terstruktur dari pengisian data hingga pengambilan keputusan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <span className="text-3xl font-extrabold text-brand-600">01</span>
            <h4 className="mt-3 font-bold text-slate-900">Formulir Adaptif</h4>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Isi data modal, harga, dan biaya. Jika belum tahu suatu data, Anda dapat memilih opsi "Belum Tahu".
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <span className="text-3xl font-extrabold text-brand-600">02</span>
            <h4 className="mt-3 font-bold text-slate-900">Kalkulasi Deterministik</h4>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Mesin kode menghitung BEP, margin kontribusi, dan runway kas tanpa mengandalkan tebakan acak.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <span className="text-3xl font-extrabold text-brand-600">03</span>
            <h4 className="mt-3 font-bold text-slate-900">Simulasi 3 Skenario</h4>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Uji ketahanan usaha menghadapi skenario Konservatif (-30% omset), Moderat, dan Optimistis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <span className="text-3xl font-extrabold text-brand-600">04</span>
            <h4 className="mt-3 font-bold text-slate-900">Laporan & Konsultasi AI</h4>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Dapatkan rekomendasi strategis kritis dan diskusikan hasil analisis melalui chatbot kontekstual.
            </p>
          </div>
        </div>
      </section>

      {/* TRANSPARANSI & KETERBATASAN AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold mb-4 border border-slate-700">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Etika & Transparansi Platform</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Komitmen Kejujuran: Tanpa Janji Keberhasilan Palsu
            </h2>

            <div className="mt-6 space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                Platform kami tidak pernah mengklaim "akurasi prediksi 99%" atau "menjamin usaha pasti sukses". Semua proyeksi finansial adalah <strong>simulasi bersyarat</strong> yang didasarkan pada asumsi yang Anda berikan.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <h4 className="font-semibold text-white text-sm">Data Nyata vs Data Belum Terverifikasi</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    Jika data demografi atau kompetitor belum terhubung, sistem akan menyatakan statusnya "Belum Tervalidasi" dan menganjurkan survei lapangan mandiri.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <h4 className="font-semibold text-white text-sm">Laba Operasional Bukan Arus Kas</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    Laba di atas kertas tidak sama dengan uang tunai riil di dompet karena adanya faktor piutang tempo, sisa inventaris, dan pajak.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="border border-slate-200 rounded-3xl p-8 sm:p-12 bg-white shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Siap Menguji Kelayakan Bisnis Anda?
          </h2>
          <p className="mt-3 text-slate-600 text-sm max-w-xl mx-auto">
            Gunakan data demo instan atau masukkan angka bisnis Anda untuk melihat titik impas dan simulasi ketahanan modal.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors"
            >
              Buka Dashboard Analisis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
