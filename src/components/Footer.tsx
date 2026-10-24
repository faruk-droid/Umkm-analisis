import Link from "next/link";
import { APP_CONFIG } from "@/lib/config";
import { Info, ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#2c3e50] text-[#ecf0f1] mt-16 border-t-4 border-[#34495e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2">
            <span className="font-bold text-lg text-white uppercase tracking-wider block">
              {APP_CONFIG.name}
            </span>
            <p className="mt-2 text-xs text-[#bdc3c7] max-w-md leading-relaxed">
              Platform evaluasi kelayakan bisnis, unit ekonomi, dan simulasi risiko untuk calon wirausaha dan pemilik UMKM Indonesia.
            </p>
            <div className="mt-4 p-3 rounded bg-[#34495e] border-l-4 border-[#e67e22] text-xs text-[#ecf0f1] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#f39c12] shrink-0 mt-0.5" />
              <span>
                <strong>Prinsip Transparansi:</strong> Platform ini tidak menjamin keberhasilan usaha. Seluruh proyeksi finansial merupakan estimasi matematis bersyarat berdasarkan input pengguna.
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b-2 border-[#1abc9c] pb-1 inline-block">
              Layanan Utama
            </h4>
            <ul className="space-y-1.5 text-xs text-[#bdc3c7]">
              <li>
                <Link href="/analysis/new/planner" className="hover:text-white hover:underline transition-colors">
                  Perencanaan Bisnis Baru
                </Link>
              </li>
              <li>
                <Link href="/analysis/new/growth" className="hover:text-white hover:underline transition-colors">
                  Optimasi Usaha Berjalan
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white hover:underline transition-colors">
                  Dashboard Analisis
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white hover:underline transition-colors">
                  Konfigurasi & Pengaturan
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & limits */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b-2 border-[#3498db] pb-1 inline-block">
              Metodologi
            </h4>
            <ul className="space-y-1.5 text-xs text-[#bdc3c7]">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#1abc9c] rounded-none"></span>
                <span>Kalkulasi Deterministik</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#3498db] rounded-none"></span>
                <span>Break-Even Point (BEP) Riil</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#e67e22] rounded-none"></span>
                <span>3 Skenario Stres-Tes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#9b59b6] rounded-none"></span>
                <span>Isolasi Data Lokal & Privat</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#34495e] text-[11px] text-[#95a5a6] flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. Dikembangkan untuk pemberdayaan UMKM Indonesia.</p>
          <p>Versi {APP_CONFIG.version} • Flat UI 2018 Edition</p>
        </div>
      </div>
    </footer>
  );
}
