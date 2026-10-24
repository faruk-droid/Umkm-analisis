"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BusinessAnalysisRecord } from "@/types";
import { StorageService } from "@/lib/storage";
import {
  FilePlus,
  TrendingUp,
  FileText,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<BusinessAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "planner" | "growth">("all");

  const loadData = async () => {
    setLoading(true);
    const data = await StorageService.listAnalyses();
    setAnalyses(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus arsip analisis "${name}"?`)) {
      await StorageService.deleteAnalysis(id);
      loadData();
    }
  };

  const handleResetDemo = async () => {
    if (confirm("Muat ulang contoh data demo? Riwayat lokal akan diperbarui.")) {
      localStorage.removeItem("umkm_insight_analyses_v1");
      loadData();
    }
  };

  const filteredAnalyses = analyses.filter((item) => {
    const matchesQuery =
      item.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || item.serviceType === filterType;
    return matchesQuery && matchesFilter;
  });

  const latestAnalysis = analyses[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Demo Notice */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Keputusan Bisnis
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola dan evaluasi portofolio kelayakan usaha Anda secara terpusat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/analysis/new/planner"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            <span>+ Rencana Baru</span>
          </Link>
          <Link
            href="/analysis/new/growth"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>+ Evaluasi Usaha</span>
          </Link>
        </div>
      </div>

      {/* Honest Demo Mode Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Mode Demo Lokal Aktif:</strong> Data analisis tersimpan dengan aman pada penyimpanan peramban (localStorage) Anda. Tidak ada data yang dikirim ke server pihak ketiga tanpa konfigurasi akun.
          </span>
        </div>
        <button
          onClick={handleResetDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100/50 text-xs font-semibold shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Ulang Data Demo</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Analisis Dibuat
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{analyses.length}</span>
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <span className="mt-2 text-xs text-slate-500 block">
            {analyses.filter((a) => a.serviceType === "planner").length} Perencanaan •{" "}
            {analyses.filter((a) => a.serviceType === "growth").length} Optimasi
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Analisis Terakhir
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900 truncate max-w-[200px]">
              {latestAnalysis ? latestAnalysis.businessName : "Belum Ada"}
            </span>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <span className="mt-2 text-xs text-slate-500 block">
            {latestAnalysis
              ? new Date(latestAnalysis.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Status Keuangan Terbaru
          </span>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                latestAnalysis?.financialMetrics.isProfitable
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {latestAnalysis?.financialMetrics.isProfitable
                ? "Laba Proyektif"
                : "Defisit Operasional"}
            </span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <span className="mt-2 text-xs text-slate-500 block">
            BEP: {latestAnalysis?.financialMetrics.bepUnits ? `${latestAnalysis.financialMetrics.bepUnits} unit/bln` : "Perlu Penyesuaian Biaya"}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama bisnis, kategori, kota..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === "all"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({analyses.length})
          </button>
          <button
            onClick={() => setFilterType("planner")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === "planner"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Perencanaan
          </button>
          <button
            onClick={() => setFilterType("growth")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === "growth"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Usaha Berjalan
          </button>
        </div>
      </div>

      {/* List of Analysis Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Daftar Arsip Analisis ({filteredAnalyses.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            Memuat data analisis...
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              Belum ada arsip analisis yang sesuai
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Silakan buat analisis baru atau klik tombol &quot;Muat Ulang Data Demo&quot; di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((item) => {
              const isGrowth = item.serviceType === "growth";
              const fin = item.financialMetrics;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isGrowth
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {isGrowth ? "Usaha Berjalan" : "Rencana Baru"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">
                      {item.businessName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.category} • {item.location}
                    </p>

                    {/* Snapshot Financial Badge */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Laba Operasional:</span>
                        <span
                          className={`font-semibold ${
                            fin.monthlyOperatingProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          Rp {fin.monthlyOperatingProfit.toLocaleString("id-ID")}/bln
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>BEP Penjualan:</span>
                        <span className="font-semibold text-slate-900">
                          {fin.bepUnits ? `${fin.bepUnits} unit/bln` : "Defisit Unit"}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Ketahanan Modal:</span>
                        <span className="font-semibold text-slate-900">
                          {fin.capitalAdequacyStatus}
                        </span>
                      </div>
                    </div>

                    {/* Summary excerpt */}
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.aiReport.executiveSummary}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleDelete(item.id, item.businessName)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus analisis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/analysis/${item.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>Buka Laporan Lengkap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
