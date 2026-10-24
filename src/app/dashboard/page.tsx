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
  DollarSign,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Flat Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b-2 border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#2c3e50] uppercase tracking-wide">
            Dashboard Keputusan Bisnis
          </h1>
          <p className="text-xs text-[#7f8c8d] mt-0.5">
            Kelola dan evaluasi portofolio kelayakan usaha Anda secara terpusat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/analysis/new/planner"
            className="px-4 py-2 rounded bg-[#1abc9c] hover:bg-[#16a085] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-[#117a65] shadow-flat transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            <span>+ Rencana Baru</span>
          </Link>
          <Link
            href="/analysis/new/growth"
            className="px-4 py-2 rounded bg-[#3498db] hover:bg-[#2980b9] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-[#20638f] shadow-flat transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>+ Evaluasi Usaha</span>
          </Link>
        </div>
      </div>

      {/* Flat Demo Mode Callout */}
      <div className="p-3.5 rounded bg-white border-l-4 border-[#f39c12] border-t border-r border-b border-slate-200 shadow-flat flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#2c3e50]">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#f39c12] shrink-0 mt-0.5" />
          <span>
            <strong>Mode Demo Lokal Aktif:</strong> Data analisis tersimpan dengan aman pada penyimpanan peramban (localStorage) Anda. Tidak ada data yang dikirim ke server luar.
          </span>
        </div>
        <button
          onClick={handleResetDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#f4f6f9] hover:bg-slate-200 text-[#2c3e50] border border-slate-300 text-xs font-bold uppercase tracking-wider shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Ulang Data Demo</span>
        </button>
      </div>

      {/* 2018 Flat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Turquoise Accent */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-flat border-t-4 border-[#1abc9c]">
          <span className="text-[11px] font-bold text-[#7f8c8d] uppercase tracking-wider">
            Total Analisis Dibuat
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#2c3e50]">{analyses.length}</span>
            <FileText className="w-5 h-5 text-[#1abc9c]" />
          </div>
          <span className="mt-2 text-xs text-[#7f8c8d] block font-medium">
            {analyses.filter((a) => a.serviceType === "planner").length} Perencanaan •{" "}
            {analyses.filter((a) => a.serviceType === "growth").length} Optimasi
          </span>
        </div>

        {/* Card 2: Peter River Accent */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-flat border-t-4 border-[#3498db]">
          <span className="text-[11px] font-bold text-[#7f8c8d] uppercase tracking-wider">
            Analisis Terakhir
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-[#2c3e50] truncate max-w-[200px]">
              {latestAnalysis ? latestAnalysis.businessName : "Belum Ada"}
            </span>
            <Calendar className="w-5 h-5 text-[#3498db]" />
          </div>
          <span className="mt-2 text-xs text-[#7f8c8d] block font-medium">
            {latestAnalysis
              ? new Date(latestAnalysis.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </span>
        </div>

        {/* Card 3: Orange Accent */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-flat border-t-4 border-[#e67e22]">
          <span className="text-[11px] font-bold text-[#7f8c8d] uppercase tracking-wider">
            Status Keuangan Terbaru
          </span>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                latestAnalysis?.financialMetrics.isProfitable
                  ? "bg-[#2ecc71] text-white"
                  : "bg-[#e74c3c] text-white"
              }`}
            >
              {latestAnalysis?.financialMetrics.isProfitable
                ? "Laba Proyektif"
                : "Defisit Operasional"}
            </span>
            <DollarSign className="w-5 h-5 text-[#e67e22]" />
          </div>
          <span className="mt-2 text-xs text-[#7f8c8d] block font-medium">
            BEP: {latestAnalysis?.financialMetrics.bepUnits ? `${latestAnalysis.financialMetrics.bepUnits} unit/bln` : "Perlu Penyesuaian"}
          </span>
        </div>
      </div>

      {/* Flat Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-center bg-white p-3 rounded border border-slate-200 shadow-flat">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#95a5a6] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama bisnis, kota..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c] focus:ring-1 focus:ring-[#1abc9c]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              filterType === "all"
                ? "bg-[#2c3e50] text-white"
                : "bg-slate-100 text-[#7f8c8d] hover:bg-slate-200"
            }`}
          >
            Semua ({analyses.length})
          </button>
          <button
            onClick={() => setFilterType("planner")}
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              filterType === "planner"
                ? "bg-[#1abc9c] text-white"
                : "bg-slate-100 text-[#7f8c8d] hover:bg-slate-200"
            }`}
          >
            Perencanaan
          </button>
          <button
            onClick={() => setFilterType("growth")}
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              filterType === "growth"
                ? "bg-[#3498db] text-white"
                : "bg-slate-100 text-[#7f8c8d] hover:bg-slate-200"
            }`}
          >
            Usaha Berjalan
          </button>
        </div>
      </div>

      {/* List of Analysis Cards (Flat Style) */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#2c3e50] uppercase tracking-wide">
          Daftar Arsip Analisis ({filteredAnalyses.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#7f8c8d] bg-white rounded border border-slate-200">
            Memuat data analisis...
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#2c3e50] uppercase">
              Belum ada arsip analisis
            </h3>
            <p className="mt-1 text-xs text-[#7f8c8d]">
              Klik tombol &quot;Muat Ulang Data Demo&quot; di atas untuk mengisi contoh analisis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnalyses.map((item) => {
              const isGrowth = item.serviceType === "growth";
              const fin = item.financialMetrics;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded border border-slate-200 p-5 shadow-flat flex flex-col justify-between ${
                    isGrowth ? "border-t-4 border-t-[#3498db]" : "border-t-4 border-t-[#1abc9c]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isGrowth
                            ? "bg-[#3498db] text-white"
                            : "bg-[#1abc9c] text-white"
                        }`}
                      >
                        {isGrowth ? "Usaha Berjalan" : "Rencana Baru"}
                      </span>
                      <span className="text-[11px] text-[#95a5a6] font-medium">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#2c3e50] leading-snug line-clamp-1">
                      {item.businessName}
                    </h3>
                    <p className="text-xs text-[#7f8c8d] mt-0.5">
                      {item.category} • {item.location}
                    </p>

                    {/* Snapshot Financial Block */}
                    <div className="mt-3 p-2.5 rounded bg-[#f4f6f9] border border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between text-[#576574]">
                        <span>Laba Operasional:</span>
                        <span
                          className={`font-bold ${
                            fin.monthlyOperatingProfit >= 0 ? "text-[#27ae60]" : "text-[#c0392b]"
                          }`}
                        >
                          Rp {fin.monthlyOperatingProfit.toLocaleString("id-ID")}/bln
                        </span>
                      </div>
                      <div className="flex justify-between text-[#576574]">
                        <span>BEP Penjualan:</span>
                        <span className="font-bold text-[#2c3e50]">
                          {fin.bepUnits ? `${fin.bepUnits} unit/bln` : "Defisit Unit"}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#576574]">
                        <span>Ketahanan Modal:</span>
                        <span className="font-bold text-[#2c3e50]">
                          {fin.capitalAdequacyStatus}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2.5 text-xs text-[#576574] line-clamp-2 leading-relaxed">
                      {item.aiReport.executiveSummary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleDelete(item.id, item.businessName)}
                      className="p-1.5 text-[#95a5a6] hover:text-[#e74c3c] hover:bg-slate-100 rounded transition-colors"
                      title="Hapus analisis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/analysis/${item.id}`}
                      className="px-3 py-1.5 rounded bg-[#2c3e50] hover:bg-[#34495e] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <span>Buka Laporan</span>
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
