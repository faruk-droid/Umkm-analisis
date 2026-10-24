"use client";

import { useState, useEffect } from "react";
import { APP_CONFIG } from "@/lib/config";
import { Settings, Key, Database, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const [appName, setAppName] = useState(APP_CONFIG.name);
  const [apiKey, setApiKey] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("umkm_app_name");
    const savedKey = localStorage.getItem("umkm_user_gemini_key");
    if (savedName) setAppName(savedName);
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("umkm_app_name", appName);
    if (apiKey) {
      localStorage.setItem("umkm_user_gemini_key", apiKey);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm("Hapus seluruh data riwayat analisis lokal dan kembalikan ke data awal?")) {
      localStorage.removeItem("umkm_insight_analyses_v1");
      alert("Data lokal berhasil direset.");
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-brand-600" />
          <span>Pengaturan & Konfigurasi Platform</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Kustomisasi nama kerja proyek, kelola kunci API AI, dan periksa status database.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Konfigurasi berhasil disimpan di lingkungan lokal!</span>
        </div>
      )}

      {/* General Settings */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Nama Proyek Sementara</h2>
          <p className="text-xs text-slate-500 mb-3">
            Nama ini adalah nama kerja dan dapat diubah kapan saja sesuai branding usaha Anda.
          </p>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Key className="w-4 h-4 text-brand-600" />
            <span>Kunci API Google Gemini (Opsional)</span>
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Jika dikosongkan, platform otomatis menggunakan <strong>Expert Rule-Based Engine</strong> yang 100% deterministik, tajam, dan tidak memerlukan biaya API.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full sm:w-96 px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </form>

      {/* Database & Storage Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <span>Status Penyimpanan & Database</span>
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="flex justify-between items-center">
            <span>Penyimpanan Aktif:</span>
            <span className="font-bold text-slate-900">Peramban Lokal (localStorage)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Integrasi Supabase:</span>
            <span className="text-amber-700 font-semibold">Tersedia via `supabase/schema.sql` (Belum Terhubung)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Mode Keamanan:</span>
            <span className="text-slate-900">Demo Terisolasi (Data tidak keluar dari peramban Anda)</span>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Ingin membersihkan cache atau mengatur ulang data sampel?
          </span>
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data Lokal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
