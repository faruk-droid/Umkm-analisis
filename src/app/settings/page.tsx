"use client";

import { useState, useEffect } from "react";
import { APP_CONFIG } from "@/lib/config";
import { Settings, Key, Database, RefreshCw, CheckCircle2, ExternalLink } from "lucide-react";

interface AIStatus {
  configured: boolean;
  provider: "gemini" | "openai" | null;
  model: string | null;
  note: string;
}

export default function SettingsPage() {
  const [appName, setAppName] = useState(APP_CONFIG.name);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [aiStatusError, setAiStatusError] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("umkm_app_name");
    if (savedName) setAppName(savedName);
    localStorage.removeItem("umkm_user_gemini_key");

    fetch("/api/ai/status", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Status AI tidak dapat diperiksa.");
        setAiStatus((await response.json()) as AIStatus);
      })
      .catch((error: unknown) => {
        setAiStatusError(error instanceof Error ? error.message : "Status AI tidak dapat diperiksa.");
      });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("umkm_app_name", appName);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b-2 border-slate-200 pb-3">
        <h1 className="text-xl sm:text-2xl font-black text-[#2c3e50] uppercase tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#1abc9c]" />
          <span>Pengaturan & Konfigurasi Platform</span>
        </h1>
        <p className="mt-0.5 text-xs text-[#7f8c8d]">
          Kustomisasi nama proyek dan periksa status integrasi AI serta penyimpanan.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded bg-white border-l-4 border-[#2ecc71] border-t border-r border-b border-slate-200 text-[#27ae60] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Nama proyek berhasil disimpan di peramban ini.</span>
        </div>
      )}

      {/* General Settings */}
      <form onSubmit={handleSave} className="bg-white rounded border border-slate-200 p-6 shadow-flat border-t-4 border-[#1abc9c] space-y-5">
        <div>
          <h2 className="text-xs font-bold text-[#2c3e50] uppercase tracking-wide mb-0.5">Nama Proyek Sementara</h2>
          <p className="text-[11px] text-[#7f8c8d] mb-2">
            Nama ini adalah nama kerja dan dapat diubah kapan saja sesuai branding usaha Anda.
          </p>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full sm:w-80 px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-[#2c3e50] uppercase tracking-wide flex items-center gap-1.5 mb-0.5">
            <Key className="w-4 h-4 text-[#1abc9c]" />
            <span>Integrasi AI Gemini</span>
          </h2>
          <div className="mb-3 rounded border border-slate-200 bg-[#f4f6f9] p-3 text-[11px] text-[#576574] space-y-2">
            <p>
              Pengunjung website tidak perlu login. Pemilik aplikasi cukup mengatur satu{" "}
              <code>GEMINI_API_KEY</code> sebagai environment variable server. Key tidak disimpan di
              browser dan tidak perlu dikirim melalui chat.
            </p>
            <p className="flex items-center gap-1.5">
              <span>Status:</span>
              <strong className={aiStatus?.configured ? "text-[#27ae60]" : "text-[#d35400]"}>
                {aiStatus
                  ? aiStatus.configured
                    ? `${aiStatus.provider === "gemini" ? "Gemini" : "OpenAI"} terkonfigurasi${aiStatus.model ? ` (${aiStatus.model})` : ""}`
                    : "Belum dikonfigurasi — analisis deterministik tetap aktif"
                  : aiStatusError || "Memeriksa konfigurasi server..."}
              </strong>
            </p>
            {aiStatus?.configured && <p>{aiStatus.note}</p>}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#2980b9] underline underline-offset-2"
            >
              Buat Gemini API key di Google AI Studio
              <ExternalLink className="h-3 w-3" />
            </a>
            <p>
              Lokal: simpan key di <code>.env.local</code>, lalu restart server. Vercel: tambahkan
              key pada Project Settings → Environment Variables, kemudian redeploy.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-[#1abc9c] hover:bg-[#16a085] text-white font-bold text-xs uppercase tracking-wider border-b-2 border-[#117a65] shadow-flat transition-colors"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </form>

      {/* Database & Storage Status */}
      <div className="bg-white rounded border border-slate-200 p-6 shadow-flat border-t-4 border-[#34495e] space-y-3">
        <h2 className="text-xs font-bold text-[#2c3e50] uppercase tracking-wide flex items-center gap-1.5">
          <Database className="w-4 h-4 text-[#34495e]" />
          <span>Status Penyimpanan & Database</span>
        </h2>

        <div className="p-3.5 rounded bg-[#f4f6f9] border border-slate-200 text-xs text-[#2c3e50] space-y-2">
          <div className="flex justify-between items-center">
            <span>Penyimpanan Aktif:</span>
            <span className="font-bold text-[#2c3e50]">Peramban Lokal (localStorage)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Integrasi Supabase:</span>
            <span className="text-[#d35400] font-bold">Tersedia via `supabase/schema.sql` (Belum Terhubung)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Mode Keamanan:</span>
            <span className="font-bold text-[#27ae60]">Demo Terisolasi (Data lokal di peramban Anda)</span>
          </div>
        </div>

        <div className="pt-3 flex justify-between items-center">
          <span className="text-xs text-[#7f8c8d]">
            Ingin membersihkan cache atau mengatur ulang data sampel?
          </span>
          <button
            onClick={handleResetData}
            className="px-3.5 py-1.5 rounded bg-[#e74c3c] hover:bg-[#c0392b] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-[#962d22] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data Lokal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
