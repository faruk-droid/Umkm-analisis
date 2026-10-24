import Link from "next/link";
import { APP_CONFIG } from "@/lib/config";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Scale,
  DollarSign,
  PieChart,
  BarChart2,
  HelpCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* 2018 FLAT HERO SECTION */}
      <section className="bg-[#34495e] text-white py-14 border-b-4 border-[#2c3e50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white mb-2">
            opsi tepat,{" "}
            <span className="text-[#1abc9c] underline decoration-[#16a085] decoration-4 underline-offset-8">
              bukan sekedar firasat
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#ecf0f1] leading-relaxed max-w-2xl mx-auto font-normal">
            Bantu calon pengusaha dan pemilik UMKM menguji kelayakan rencana usaha,
            menghitung Break-Even Point (BEP) riil, dan memitigasi risiko finansial sebelum modal keluar.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/analysis/new/planner"
              className="px-6 py-3 rounded text-sm font-bold uppercase tracking-wider bg-[#1abc9c] hover:bg-[#16a085] text-white border-b-2 border-[#117a65] shadow-flat transition-all flex items-center justify-center gap-2"
            >
              <span>Mulai Rencana Bisnis Baru</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/analysis/new/growth"
              className="px-6 py-3 rounded text-sm font-bold uppercase tracking-wider bg-[#3498db] hover:bg-[#2980b9] text-white border-b-2 border-[#20638f] shadow-flat transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analisis Usaha Berjalan</span>
            </Link>
          </div>

          <div className="mt-6 inline-block bg-[#2c3e50] px-3 py-1 rounded text-xs text-[#bdc3c7]">
            *Mode Demo Siap Digunakan Langsung Tanpa Perlu Mendaftar Akun.
          </div>
        </div>
      </section>

      {/* FLAT PROBLEM CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-l-4 border-[#e74c3c] border-t border-r border-b border-slate-200 p-6 rounded shadow-flat">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="p-3 bg-[#e74c3c] text-white rounded shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2c3e50] uppercase tracking-wide">
                Masalah Utama yang Diselesaikan
              </h2>
              <p className="mt-1 text-sm text-[#576574] leading-relaxed">
                Banyak usaha rintisan tutup di tahun pertama akibat salah menghitung biaya tetap, mengabaikan titik impas (BEP), atau terburu-buru menyewa toko sebelum produk tervalidasi. 
                Platform ini bertindak sebagai analis bisnis yang kritis dan independen, membantu Anda melihat risiko secara objektif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DUA LAYANAN DENGAN FLAT TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-extrabold text-[#2c3e50] uppercase tracking-wide">
            Dua Jalur Analisis UMKM
          </h2>
          <div className="w-16 h-1 bg-[#1abc9c] mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Calon Pengusaha */}
          <div className="bg-white border-t-4 border-[#1abc9c] border-x border-b border-slate-200 rounded p-6 sm:p-8 shadow-flat flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 bg-[#1abc9c] text-white text-xs font-bold uppercase rounded">
                  Jalur A
                </span>
                <span className="text-xs text-[#7f8c8d] font-semibold">Sebelum Memulai</span>
              </div>

              <h3 className="text-xl font-bold text-[#2c3e50]">
                Calon Pengusaha — Business Planning
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#576574] leading-relaxed">
                Untuk calon pengusaha yang ingin menguji ide bisnis baru sebelum mengeluarkan modal tabungan.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-[#2c3e50]">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-[#1abc9c] text-white rounded-none flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Kalkulasi kecukupan modal awal & perkiraan runway kas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-[#1abc9c] text-white rounded-none flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Break-Even Point (BEP unit & target omset bulanan)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-[#1abc9c] text-white rounded-none flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Komparasi model: Toko fisik vs Dari rumah vs Pre-Order</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-[#1abc9c] text-white rounded-none flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Deteksi risiko Capex belanja alat yang berlebihan</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200">
              <Link
                href="/analysis/new/planner"
                className="w-full py-2.5 rounded bg-[#1abc9c] hover:bg-[#16a085] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 border-[#117a65] shadow-flat transition-colors"
              >
                <span>Mulai Rencana Bisnis Baru</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card B: Pelaku UMKM */}
          <div className="bg-white border-t-4 border-[#3498db] border-x border-b border-slate-200 rounded p-6 sm:p-8 shadow-flat flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 bg-[#3498db] text-white text-xs font-bold uppercase rounded">
                  Jalur B
                </span>
                <span className="text-xs text-[#7f8c8d] font-semibold">Sedang Berjalan</span>
              </div>

              <h3 className="text-xl font-bold text-[#2c3e50]">
                Pelaku UMKM — Business Growth
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#576574] leading-relaxed">
                Untuk usaha yang sudah beroperasi dan ingin mengevaluasi margin keuntungan serta strategi ekspansi.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-[#2c3e50]">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-[#3498db] text-white rounded-none flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Evaluasi margin laba aktual vs beban operasional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-[#3498db] text-white rounded-none flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Analisis produk unggulan vs produk lambat bergerak</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-[#3498db] text-white rounded-none flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Simulasi dampak kenaikan harga bahan baku</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-[#3498db] text-white rounded-none flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Rekomendasi pemecahan kendala kapasitas produksi</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200">
              <Link
                href="/analysis/new/growth"
                className="w-full py-2.5 rounded bg-[#3498db] hover:bg-[#2980b9] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 border-[#20638f] shadow-flat transition-colors"
              >
                <span>Evaluasi Usaha yang Sedang Berjalan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 FLAT STEPS CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-extrabold text-[#2c3e50] uppercase tracking-wide">
            Cara Kerja Platform
          </h2>
          <div className="w-16 h-1 bg-[#34495e] mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded border border-slate-200 shadow-flat border-t-4 border-[#1abc9c]">
            <div className="text-2xl font-black text-[#1abc9c]">01</div>
            <h4 className="mt-2 font-bold text-sm text-[#2c3e50] uppercase">Formulir Adaptif</h4>
            <p className="mt-1 text-xs text-[#7f8c8d] leading-relaxed">
              Isi data modal dan biaya. Jika belum tahu, pilih opsi &quot;Saya Belum Tahu&quot;.
            </p>
          </div>

          <div className="bg-white p-5 rounded border border-slate-200 shadow-flat border-t-4 border-[#3498db]">
            <div className="text-2xl font-black text-[#3498db]">02</div>
            <h4 className="mt-2 font-bold text-sm text-[#2c3e50] uppercase">Kalkulasi Pasti</h4>
            <p className="mt-1 text-xs text-[#7f8c8d] leading-relaxed">
              Kode deterministik menghitung BEP, margin, dan runway kas tanpa tebakan acak.
            </p>
          </div>

          <div className="bg-white p-5 rounded border border-slate-200 shadow-flat border-t-4 border-[#e67e22]">
            <div className="text-2xl font-black text-[#e67e22]">03</div>
            <h4 className="mt-2 font-bold text-sm text-[#2c3e50] uppercase">3 Skenario Pasar</h4>
            <p className="mt-1 text-xs text-[#7f8c8d] leading-relaxed">
              Uji ketahanan usaha menghadapi skenario Konservatif, Moderat, dan Optimistis.
            </p>
          </div>

          <div className="bg-white p-5 rounded border border-slate-200 shadow-flat border-t-4 border-[#9b59b6]">
            <div className="text-2xl font-black text-[#9b59b6]">04</div>
            <h4 className="mt-2 font-bold text-sm text-[#2c3e50] uppercase">Laporan & Chat AI</h4>
            <p className="mt-1 text-xs text-[#7f8c8d] leading-relaxed">
              Dapatkan rekomendasi kritis dan diskusikan hasil analisis melalui chatbot.
            </p>
          </div>
        </div>
      </section>

      {/* FLAT ETHICS & TRANSPARENCY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2c3e50] text-white rounded border-2 border-[#34495e] p-6 sm:p-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#e67e22] text-white text-xs font-bold uppercase rounded mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Etika & Transparansi Platform</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold">
            Komitmen Kejujuran: Tanpa Janji Keberhasilan Palsu
          </h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#ecf0f1] leading-relaxed">
            <div className="p-4 bg-[#34495e] rounded border border-[#4a6572]">
              <h4 className="font-bold text-white uppercase text-xs mb-1">Data Nyata vs Data Belum Terverifikasi</h4>
              <p className="text-xs text-[#bdc3c7]">
                Jika data demografi lokal belum terhubung, sistem akan menyatakan status &quot;Belum Tervalidasi&quot; dan menganjurkan survei lapangan mandiri.
              </p>
            </div>
            <div className="p-4 bg-[#34495e] rounded border border-[#4a6572]">
              <h4 className="font-bold text-white uppercase text-xs mb-1">Laba Operasional Bukan Arus Kas</h4>
              <p className="text-xs text-[#bdc3c7]">
                Laba di atas kertas tidak sama dengan uang tunai riil di rekening karena faktor piutang tempo, sisa inventaris, dan pajak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white border-2 border-slate-200 rounded p-8 shadow-flat">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2c3e50] uppercase tracking-wide">
            Siap Menguji Kelayakan Bisnis Anda?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#7f8c8d] max-w-lg mx-auto">
            Gunakan data demo instan atau masukkan angka bisnis Anda untuk melihat titik impas dan simulasi ketahanan modal.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded bg-[#1abc9c] hover:bg-[#16a085] text-white font-bold text-xs uppercase tracking-wider border-b-2 border-[#117a65] shadow-flat transition-colors"
            >
              Buka Dashboard Analisis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
