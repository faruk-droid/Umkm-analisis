import Link from "next/link";
import { APP_CONFIG } from "@/lib/config";
import { Info, ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2">
            <span className="font-bold text-xl text-white tracking-tight block">
              {APP_CONFIG.name}
            </span>
            <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
              Platform evaluasi kelayakan bisnis, unit ekonomi, dan simulasi risiko untuk calon wirausaha dan pemilik UMKM Indonesia.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start gap-2.5 text-xs text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Prinsip Transparansi:</strong> Platform ini tidak menjamin keberhasilan usaha. Seluruh proyeksi finansial merupakan estimasi matematis bersyarat berdasarkan input pengguna dan perlu divalidasi langsung di lapangan.
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Layanan Utama
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/analysis/new/planner" className="hover:text-white transition-colors">
                  Perencanaan Bisnis Baru
                </Link>
              </li>
              <li>
                <Link href="/analysis/new/growth" className="hover:text-white transition-colors">
                  Optimasi Usaha Berjalan
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard Analisis
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">
                  Konfigurasi & Pengaturan
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & limits */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Metodologi
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-400" />
                <span>Kalkulasi Deterministik</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-400" />
                <span>Break-Even Point (BEP) Riil</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-400" />
                <span>3 Skenario Stres-Tes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-400" />
                <span>Isolasi Data Lokal & Privat</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. Dikembangkan untuk pemberdayaan UMKM Indonesia yang berkelanjutan.</p>
          <p>Versi {APP_CONFIG.version}</p>
        </div>
      </div>
    </footer>
  );
}
