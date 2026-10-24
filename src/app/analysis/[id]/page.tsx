"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BusinessAnalysisRecord, ChatMessage } from "@/types";
import { StorageService } from "@/lib/storage";
import { simulateSensitivity } from "@/lib/finance/calculator";
import {
  ArrowLeft,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  MessageSquare,
  DollarSign,
  BarChart3,
  Layers,
  Send,
  Sliders,
  Calendar,
  Building,
  Target,
  Sparkles,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [record, setRecord] = useState<BusinessAnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ringkasan" | "finansial" | "skenario" | "risiko" | "chat">("ringkasan");

  // Dynamic sensitivity simulation state
  const [volumeDelta, setVolumeDelta] = useState(0); // -50% to +50%
  const [priceDelta, setPriceDelta] = useState(0);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function loadRecord() {
      setLoading(true);
      const data = await StorageService.getAnalysis(id);
      if (data) {
        setRecord(data);
        // Default initial greeting for chat
        setChatMessages([
          {
            id: "msg_init",
            sender: "assistant",
            content: `Halo! Saya asisten analis untuk "${data.businessName}". Anda dapat menanyakan simulasi sensitivitas finansial, cara meningkatkan titik impas (BEP), atau data apa yang perlu Anda riset lebih lanjut sebelum investasi.`,
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
      setLoading(false);
    }
    loadRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm">Memuat laporan analisis bisnis...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Laporan Tidak Ditemukan</h2>
        <p className="text-slate-500 text-sm mt-2">
          Arsip analisis dengan ID ini tidak tersedia di penyimpanan lokal.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    );
  }

  const isGrowth = record.serviceType === "growth";
  const fin = record.financialMetrics;

  // Chart Data for Scenarios
  const scenarioChartData = record.scenarios.map((s) => ({
    name: s.scenarioName,
    Pendapatan: s.revenue,
    "Total Biaya": s.totalCost,
    "Laba Operasional": s.operatingProfit,
  }));

  // Dynamic sensitivity calculation
  const baseParams = isGrowth
    ? {
        availableCapital: (record.inputSnapshot as any).initialCapital || 0,
        initialSetupCost: 0,
        monthlyFixedCost: (record.inputSnapshot as any).monthlyFixedCost || 0,
        sellingPricePerUnit: (record.inputSnapshot as any).sellingPrice || 0,
        variableCostPerUnit: (record.inputSnapshot as any).productionCostPerUnit || 0,
        estimatedMonthlyUnits: (record.inputSnapshot as any).monthlyUnitsSold || 0,
      }
    : {
        availableCapital: (record.inputSnapshot as any).availableCapital || 0,
        initialSetupCost: (record.inputSnapshot as any).estimatedInitialCost || 0,
        monthlyFixedCost: (record.inputSnapshot as any).monthlyFixedCostEstimate || 0,
        sellingPricePerUnit: (record.inputSnapshot as any).sellingPriceEstimate || 0,
        variableCostPerUnit: (record.inputSnapshot as any).variableCostPerUnitEstimate || 0,
        estimatedMonthlyUnits: (record.inputSnapshot as any).expectedMonthlySalesVolume || 0,
      };

  const dynamicSimulated = simulateSensitivity(baseParams, {
    volume: volumeDelta,
    price: priceDelta,
  });

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!msgText) setInputMessage("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          analysisRecord: record,
        }),
      });
      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: "assistant",
        content: data.reply || "Maaf, respon tidak dapat diproses.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isGrowth
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}
              >
                {isGrowth ? "Evaluasi Usaha Berjalan" : "Rencana Bisnis Baru"}
              </span>
              <span className="text-xs text-slate-500">
                Dibuat: {new Date(record.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {record.businessName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {record.category} • {record.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="no-print border-b border-slate-200 flex gap-2 sm:gap-6 overflow-x-auto text-sm font-semibold">
        {[
          { key: "ringkasan", label: "Ringkasan & Validasi", icon: Sparkles },
          { key: "finansial", label: "Kalkulator & BEP", icon: DollarSign },
          { key: "skenario", label: "Simulasi Skenario", icon: BarChart3 },
          { key: "risiko", label: `Mitigasi Risiko (${record.risks.length})`, icon: AlertTriangle },
          { key: "chat", label: "Tanya Jawab AI", icon: MessageSquare },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`pb-3 px-1 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-brand-600 text-brand-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Laporan Analisis Keputusan Bisnis</h1>
        <p className="text-sm text-slate-600">Usaha: {record.businessName} ({record.category})</p>
        <p className="text-xs text-slate-400">Tanggal: {new Date(record.createdAt).toLocaleDateString("id-ID")}</p>
      </div>

      {/* TAB 1: RINGKASAN & VALIDASI */}
      {(activeTab === "ringkasan" || typeof window === "undefined") && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Ringkasan Eksekutif & Opini Analis</span>
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              {record.aiReport.executiveSummary}
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kekuatan & Potensi Utama</span>
                </h3>
                <ul className="space-y-2 text-xs text-emerald-950">
                  {record.aiReport.businessStrengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70">
                <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Kelemahan & Titik Kritis</span>
                </h3>
                <ul className="space-y-2 text-xs text-amber-950">
                  {record.aiReport.businessWeaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Data Confidence Score (Transparansi Objektif) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  <span>Tingkat Keyakinan Analisis (Data Confidence Score)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bukan angka akurasi buatan, melainkan rasio kelengkapan dan verifikasi parameter input.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {record.aiReport.dataConfidenceScore.scorePercent}%
                  </span>
                  <span
                    className={`block text-[11px] font-bold ${
                      record.aiReport.dataConfidenceScore.level === "Tinggi"
                        ? "text-emerald-700"
                        : record.aiReport.dataConfidenceScore.level === "Sedang"
                        ? "text-amber-700"
                        : "text-rose-700"
                    }`}
                  >
                    Kategori {record.aiReport.dataConfidenceScore.level}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {record.aiReport.dataConfidenceScore.explanation}
            </p>

            {record.aiReport.dataConfidenceScore.missingCriticalData.length > 0 && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Data yang Masih Perlu Diverifikasi di Lapangan:
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {record.aiReport.dataConfidenceScore.missingCriticalData.map((miss, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{miss}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Plan Before Investment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-brand-600" />
              <span>Rekomendasi Tindakan Sebelum Berinvestasi Modal</span>
            </h3>
            <div className="space-y-2.5">
              {record.aiReport.actionPlanBeforeInvestment.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs sm:text-sm text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KALKULATOR FINANSIAL & BEP */}
      {activeTab === "finansial" && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Estimasi Omset Bulanan
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Rp {fin.totalMonthlyRevenue.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {("expectedMonthlySalesVolume" in record.inputSnapshot
                  ? record.inputSnapshot.expectedMonthlySalesVolume
                  : (record.inputSnapshot as any).monthlyUnitsSold)}{" "}
                unit × Rp{" "}
                {("sellingPriceEstimate" in record.inputSnapshot
                  ? record.inputSnapshot.sellingPriceEstimate
                  : (record.inputSnapshot as any).sellingPrice).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Total Beban Operasional
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Rp {fin.totalMonthlyCost.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Tetap: Rp {fin.totalMonthlyFixedCost.toLocaleString("id-ID")} + Variabel: Rp{" "}
                {fin.totalMonthlyVariableCost.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Laba Operasional Bulanan
              </span>
              <div
                className={`text-xl sm:text-2xl font-bold mt-1 ${
                  fin.monthlyOperatingProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                Rp {fin.monthlyOperatingProfit.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Margin Laba: {fin.profitMarginPercent}%
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Break-Even Point (BEP)
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {fin.bepUnits ? `${fin.bepUnits} Unit` : "Defisit Unit"}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {fin.bepRevenue ? `Omset Impas: Rp ${fin.bepRevenue.toLocaleString("id-ID")}` : "Kontribusi negatif"}
              </span>
            </div>
          </div>

          {/* Unit Economics Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Bedah Ekonomi Unit (Unit Economics) & Margin Kontribusi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1">Margin Kontribusi per Unit</span>
                <span className="text-lg font-bold text-slate-900 block">
                  Rp {fin.unitContributionMargin.toLocaleString("id-ID")}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Harga Jual − Biaya Variabel Langsung
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1">Rasio Margin Kontribusi</span>
                <span className="text-lg font-bold text-slate-900 block">
                  {fin.contributionMarginRatio}%
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Persentase setiap rupiah omset penutup biaya tetap
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1">Status Kecukupan Modal / Runway</span>
                <span
                  className={`text-lg font-bold block ${
                    fin.capitalAdequacyStatus === "Mencukupi"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {fin.capitalAdequacyStatus}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {fin.capitalRunwayMonths !== null ? `Runway kas: ~${fin.capitalRunwayMonths} bulan` : "Arus operasional surplus"}
                </span>
              </div>
            </div>

            {/* Explanation & Limitations */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wide">
                Penjelasan Logika Perhitungan:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {fin.explanation.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-brand-600 font-bold">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>

              <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wide pt-2">
                Batasan Model Finansial Ini:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                {fin.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIMULASI SKENARIO & STRES-TES */}
      {activeTab === "skenario" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Perbandingan 3 Skenario Pasar: Konservatif, Moderat, dan Optimistis
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Uji ketahanan model bisnis Anda jika penjualan di bawah target atau biaya bahan baku meningkat.
            </p>

            {/* Recharts Bar Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioChartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`Rp ${Number(val).toLocaleString("id-ID")}`, ""]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #cbd5e1" }}
                  />
                  <Legend />
                  <Bar dataKey="Pendapatan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total Biaya" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Laba Operasional" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-800 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Skenario</th>
                    <th className="px-4 py-3">Volume Unit</th>
                    <th className="px-4 py-3">Harga Jual</th>
                    <th className="px-4 py-3">Omset Bulanan</th>
                    <th className="px-4 py-3">Total Beban</th>
                    <th className="px-4 py-3">Laba Bersih</th>
                    <th className="px-4 py-3 rounded-r-lg">BEP Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {record.scenarios.map((sc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-900">{sc.scenarioName}</td>
                      <td className="px-4 py-3">{sc.salesVolume} unit</td>
                      <td className="px-4 py-3">Rp {sc.sellingPrice.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">Rp {sc.revenue.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">Rp {sc.totalCost.toLocaleString("id-ID")}</td>
                      <td
                        className={`px-4 py-3 font-bold ${
                          sc.operatingProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        Rp {sc.operatingProfit.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3">{sc.bepUnits ? `${sc.bepUnits} unit` : "Defisit"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Sensitivity Playground */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">
                Playground Sensitivitas Interaktif (Uji Perubahan Mandiri)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Geser tuas di bawah ini untuk melihat dampak langsung terhadap laba dan titik impas secara real-time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>Perubahan Volume Penjualan:</span>
                  <span className={volumeDelta >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {volumeDelta > 0 ? `+${volumeDelta}%` : `${volumeDelta}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={volumeDelta}
                  onChange={(e) => setVolumeDelta(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>Perubahan Harga Jual:</span>
                  <span className={priceDelta >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {priceDelta > 0 ? `+${priceDelta}%` : `${priceDelta}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="5"
                  value={priceDelta}
                  onChange={(e) => setPriceDelta(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>

            {/* Dynamic Results Card */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Omset Simulasi:</span>
                <span className="text-sm font-bold text-slate-900">
                  Rp {dynamicSimulated.totalMonthlyRevenue.toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Beban Total:</span>
                <span className="text-sm font-bold text-slate-900">
                  Rp {dynamicSimulated.totalMonthlyCost.toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Laba Operasional:</span>
                <span
                  className={`text-sm font-bold ${
                    dynamicSimulated.monthlyOperatingProfit >= 0
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  Rp {dynamicSimulated.monthlyOperatingProfit.toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">BEP Unit Baru:</span>
                <span className="text-sm font-bold text-slate-900">
                  {dynamicSimulated.bepUnits ? `${dynamicSimulated.bepUnits} unit` : "Defisit"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EVALUASI RISIKO & MITIGASI */}
      {activeTab === "risiko" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Matriks Identifikasi Risiko & Langkah Mitigasi
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Setiap risiko dinilai berdasarkan heuristik deterministik atas struktur biaya dan kelengkapan data Anda.
            </p>

            <div className="space-y-4">
              {record.risks.map((risk) => {
                const badgeColor =
                  risk.severity === "Kritis"
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : risk.severity === "Tinggi"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-blue-50 text-blue-800 border-blue-200";

                return (
                  <div
                    key={risk.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}
                        >
                          Tingkat: {risk.severity}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Kategori: {risk.category}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-base text-slate-900">{risk.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {risk.description}
                    </p>

                    <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 space-y-1">
                      <div>
                        <strong>Dasar Penilaian:</strong> {risk.assessmentBasis}
                      </div>
                      <div>
                        <strong>Potensi Dampak:</strong> {risk.potentialImpact}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-800 block mb-1.5">
                        Langkah Mitigasi Konkret:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {risk.mitigationSteps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="text-brand-600 font-bold">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BUSINESS AI CHATBOT */}
      {activeTab === "chat" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Konsultasi Kontekstual AI: {record.businessName}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Terisolasi khusus untuk data analisis ini. Tidak mengarang data luar.
                </p>
              </div>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-brand-600 text-white rounded-tr-none shadow-sm"
                      : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                  }`}
                >
                  <p>{msg.content}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      msg.sender === "user" ? "text-brand-200" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <span>Analis sedang memformulasikan kalkulasi jawaban...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto text-[11px]">
            {[
              "Apa yang terjadi jika penjualan turun 20%?",
              "Mengapa modal saya dianggap belum mencukupi?",
              "Bagaimana cara mengurangi biaya operasional?",
              "Apakah saya sebaiknya memulai dari rumah?",
            ].map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-brand-500 text-slate-700 whitespace-nowrap transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Tanyakan hal spesifik tentang modal, BEP, atau risiko usaha Anda..."
              className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={chatLoading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
