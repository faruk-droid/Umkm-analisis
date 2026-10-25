"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BusinessAnalysisRecord, ChatMessage } from "@/types";
import { StorageService } from "@/lib/storage";
import { readJsonResponse } from "@/lib/api-response";
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
  Send,
  Sliders,
  Target,
  Sparkles,
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
        <div className="w-8 h-8 border-3 border-[#1abc9c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#7f8c8d] font-bold uppercase tracking-wider">Memuat laporan analisis bisnis...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-base font-bold text-[#2c3e50] uppercase tracking-wide">Laporan Tidak Ditemukan</h2>
        <p className="text-[#7f8c8d] text-xs mt-1">
          Arsip analisis dengan ID ini tidak tersedia di penyimpanan lokal.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#1abc9c] text-white text-xs font-bold uppercase tracking-wider"
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
      const data = await readJsonResponse<{ reply?: string; error?: string }>(res);
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendapatkan balasan.");
      }
      const botMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: "assistant",
        content: data.reply || "Maaf, respon tidak dapat diproses.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const botMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: "assistant",
        content: err instanceof Error ? err.message : "Gagal mendapatkan balasan dari server.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 no-print border-b-2 border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded bg-white border border-slate-300 hover:bg-slate-100 text-[#2c3e50] shadow-flat transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white ${
                  isGrowth ? "bg-[#3498db]" : "bg-[#1abc9c]"
                }`}
              >
                {isGrowth ? "Evaluasi Usaha Berjalan" : "Rencana Bisnis Baru"}
              </span>
              <span className="text-[11px] text-[#7f8c8d]">
                Dibuat: {new Date(record.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2c3e50] uppercase tracking-wide mt-1">
              {record.businessName}
            </h1>
            <p className="text-xs text-[#7f8c8d]">
              {record.category} • {record.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded bg-white border border-slate-300 hover:bg-slate-100 text-[#2c3e50] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-flat transition-colors"
          >
            <Printer className="w-4 h-4 text-[#7f8c8d]" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* 2018 Flat Tabs Bar */}
      <div className="no-print bg-white rounded border border-slate-200 shadow-flat flex gap-1 p-1 overflow-x-auto text-xs font-bold uppercase tracking-wider">
        {[
          { key: "ringkasan", label: "Ringkasan", icon: Sparkles },
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
              className={`py-2 px-3 rounded flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#2c3e50] text-white border-b-2 border-[#1abc9c]"
                  : "text-[#7f8c8d] hover:bg-slate-100 hover:text-[#2c3e50]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-black text-[#2c3e50] uppercase">Laporan Analisis Keputusan Bisnis</h1>
        <p className="text-xs text-[#576574]">Usaha: {record.businessName} ({record.category})</p>
        <p className="text-[11px] text-[#7f8c8d]">Tanggal: {new Date(record.createdAt).toLocaleDateString("id-ID")}</p>
      </div>

      {/* TAB 1: RINGKASAN & VALIDASI */}
      {(activeTab === "ringkasan" || typeof window === "undefined") && (
        <div className="space-y-4">
          {/* Executive Summary Card */}
          <div className="bg-white rounded border border-slate-200 p-6 shadow-flat border-t-4 border-[#1abc9c]">
            <h2 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-[#1abc9c]" />
              <span>Ringkasan Eksekutif & Opini Analis</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#2c3e50] leading-relaxed whitespace-pre-line bg-[#f4f6f9] p-3.5 rounded border border-slate-200">
              {record.aiReport.executiveSummary}
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-3.5 rounded bg-white border-l-4 border-[#2ecc71] border-t border-r border-b border-slate-200">
                <h3 className="font-bold text-xs text-[#27ae60] uppercase tracking-wide flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kekuatan & Potensi Utama</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-[#2c3e50]">
                  {record.aiReport.businessStrengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#27ae60] font-black">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-3.5 rounded bg-white border-l-4 border-[#e67e22] border-t border-r border-b border-slate-200">
                <h3 className="font-bold text-xs text-[#d35400] uppercase tracking-wide flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Kelemahan & Titik Kritis</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-[#2c3e50]">
                  {record.aiReport.businessWeaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#e67e22] font-black">!</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {record.aiReport.financialReportSummary && (
            <div className="bg-white rounded border border-slate-200 p-5 shadow-flat border-t-4 border-[#3498db]">
              <h3 className="text-xs sm:text-sm font-bold text-[#2c3e50] uppercase tracking-wide mb-1">
                Rekonsiliasi Lampiran Laporan Keuangan
              </h3>
              <p className="text-[11px] text-[#7f8c8d] mb-4">
                Angka PDF adalah total historis sesuai periode laporan. Angka aplikasi adalah estimasi bulanan
                dari input formulir; keduanya ditampilkan terpisah dan tidak saling menggantikan.
              </p>

              <p className="text-[11px] text-[#576574] mb-3">
                Periode terdeteksi: {record.aiReport.financialReportSummary.period || "tidak tercantum/terdeteksi"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded border border-slate-200 p-3">
                  <h4 className="text-[11px] font-bold uppercase text-[#2c3e50] mb-2">
                    Angka dari laporan
                  </h4>
                  {(
                    [
                      ["Total pendapatan", record.aiReport.financialReportSummary.revenue],
                      ["Total HPP", record.aiReport.financialReportSummary.costOfGoodsSold],
                      ["Laba kotor", record.aiReport.financialReportSummary.grossProfit],
                      ["Beban operasional", record.aiReport.financialReportSummary.operatingExpenses],
                      ["Laba bersih", record.aiReport.financialReportSummary.netProfit],
                      ["Margin laba bersih", record.aiReport.financialReportSummary.netProfitMarginPercent, "%"],
                      ["Arus kas operasi", record.aiReport.financialReportSummary.operatingCashFlow],
                      ["Arus kas investasi", record.aiReport.financialReportSummary.investingCashFlow],
                      ["Arus kas pembiayaan", record.aiReport.financialReportSummary.financingCashFlow],
                      ["Saldo kas akhir", record.aiReport.financialReportSummary.endingCash],
                      ["Total aset", record.aiReport.financialReportSummary.totalAssets],
                      ["Total liabilitas", record.aiReport.financialReportSummary.totalLiabilities],
                      ["Total ekuitas", record.aiReport.financialReportSummary.totalEquity],
                    ] as [string, number | null, string?][]
                  ).map(([label, value, suffix]) => (
                    <div key={label} className="flex justify-between gap-3 border-b border-slate-100 py-1.5 text-xs">
                      <span className="text-[#576574]">{label}</span>
                      <span className="text-right font-bold text-[#2c3e50]">
                        {value === null
                          ? "Tidak terdeteksi"
                          : suffix === "%"
                          ? `${value}%`
                          : `Rp ${value.toLocaleString("id-ID")}`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded border border-slate-200 p-3">
                  <h4 className="text-[11px] font-bold uppercase text-[#2c3e50] mb-2">
                    Skenario moderat aplikasi (per bulan)
                  </h4>
                  {[
                    ["Unit terjual", "expectedMonthlySalesVolume" in record.inputSnapshot
                      ? record.inputSnapshot.expectedMonthlySalesVolume
                      : record.inputSnapshot.monthlyUnitsSold],
                    ["Omzet", record.financialMetrics.totalMonthlyRevenue],
                    ["Total biaya", record.financialMetrics.totalMonthlyCost],
                    ["Laba operasional", record.financialMetrics.monthlyOperatingProfit],
                    ["Margin operasional", record.financialMetrics.profitMarginPercent, "%"],
                    ["BEP", record.financialMetrics.bepUnits, " unit"],
                  ].map(([label, value, suffix]) => (
                    <div key={String(label)} className="flex justify-between gap-3 border-b border-slate-100 py-1.5 text-xs">
                      <span className="text-[#576574]">{label}</span>
                      <span className="text-right font-bold text-[#2c3e50]">
                        {value === null
                          ? "Tidak tercapai"
                          : suffix === "%"
                          ? `${value}%`
                          : suffix === " unit"
                          ? `${value} unit`
                          : label === "Unit terjual"
                          ? `${value} unit`
                          : `Rp ${Number(value).toLocaleString("id-ID")}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded bg-[#f4f6f9] border border-slate-200 p-3">
                <h4 className="text-[11px] font-bold uppercase text-[#2c3e50] mb-2">
                  Pemeriksaan konsistensi aritmetika laporan
                </h4>
                <ul className="space-y-1 text-xs text-[#576574]">
                  {record.aiReport.financialReportSummary.consistencyChecks.map((check, index) => (
                    <li key={index}>{check}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Data Confidence Score */}
          <div className="bg-white rounded border border-slate-200 p-5 shadow-flat border-t-4 border-[#34495e]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#2c3e50] uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#34495e]" />
                  <span>Tingkat Keyakinan Analisis (Data Confidence Score)</span>
                </h3>
                <p className="text-[11px] text-[#7f8c8d]">
                  Skor kelengkapan input dan lampiran, bukan kepastian hasil bisnis. Jalur Growth tanpa laporan keuangan mendapat penalti 15 poin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-2xl font-black text-[#2c3e50]">
                    {record.aiReport.dataConfidenceScore.scorePercent}%
                  </span>
                  <span
                    className={`block text-[10px] font-bold uppercase tracking-wider ${
                      record.aiReport.dataConfidenceScore.level === "Tinggi"
                        ? "text-[#27ae60]"
                        : record.aiReport.dataConfidenceScore.level === "Sedang"
                        ? "text-[#d35400]"
                        : "text-[#c0392b]"
                    }`}
                  >
                    Kategori {record.aiReport.dataConfidenceScore.level}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#576574] leading-relaxed">
              {record.aiReport.dataConfidenceScore.explanation}
            </p>

            {record.aiReport.dataConfidenceScore.missingCriticalData.length > 0 && (
              <div className="mt-3 p-3 rounded bg-[#f4f6f9] border border-slate-200">
                <span className="text-[11px] font-bold text-[#2c3e50] uppercase block mb-1.5">
                  Data yang Perlu Dilengkapi atau Diverifikasi:
                </span>
                <ul className="space-y-1 text-xs text-[#576574]">
                  {record.aiReport.dataConfidenceScore.missingCriticalData.map((miss, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#e67e22] shrink-0" />
                      <span>{miss}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Plan Before Investment */}
          <div className="bg-white rounded border border-slate-200 p-5 shadow-flat border-t-4 border-[#2c3e50]">
            <h3 className="text-xs sm:text-sm font-bold text-[#2c3e50] uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <Target className="w-4 h-4 text-[#2c3e50]" />
              <span>Rekomendasi Tindakan Sebelum Komitmen Modal</span>
            </h3>
            <div className="space-y-2">
              {record.aiReport.actionPlanBeforeInvestment.map((act, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-[#f4f6f9] border border-slate-200 flex items-start gap-2.5 text-xs text-[#2c3e50]"
                >
                  <span className="w-4 h-4 rounded-none bg-[#2c3e50] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded border border-slate-200 shadow-flat border-t-4 border-[#3498db]">
              <span className="text-[10px] font-bold text-[#7f8c8d] uppercase tracking-wider">
                Omset Bulanan
              </span>
              <div className="text-lg sm:text-xl font-black text-[#2c3e50] mt-1">
                Rp {fin.totalMonthlyRevenue.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                {("expectedMonthlySalesVolume" in record.inputSnapshot
                  ? record.inputSnapshot.expectedMonthlySalesVolume
                  : (record.inputSnapshot as any).monthlyUnitsSold)}{" "}
                unit × Rp{" "}
                {("sellingPriceEstimate" in record.inputSnapshot
                  ? record.inputSnapshot.sellingPriceEstimate
                  : (record.inputSnapshot as any).sellingPrice).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 shadow-flat border-t-4 border-[#95a5a6]">
              <span className="text-[10px] font-bold text-[#7f8c8d] uppercase tracking-wider">
                Total Biaya Operasional
              </span>
              <div className="text-lg sm:text-xl font-black text-[#2c3e50] mt-1">
                Rp {fin.totalMonthlyCost.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                Tetap: Rp {fin.totalMonthlyFixedCost.toLocaleString("id-ID")} + Var: Rp {fin.totalMonthlyVariableCost.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 shadow-flat border-t-4 border-[#2ecc71]">
              <span className="text-[10px] font-bold text-[#7f8c8d] uppercase tracking-wider">
                Laba Operasional
              </span>
              <div
                className={`text-lg sm:text-xl font-black mt-1 ${
                  fin.monthlyOperatingProfit >= 0 ? "text-[#27ae60]" : "text-[#c0392b]"
                }`}
              >
                Rp {fin.monthlyOperatingProfit.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                Margin Laba: {fin.profitMarginPercent}%
              </span>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 shadow-flat border-t-4 border-[#1abc9c]">
              <span className="text-[10px] font-bold text-[#7f8c8d] uppercase tracking-wider">
                Break-Even Point (BEP)
              </span>
              <div className="text-lg sm:text-xl font-black text-[#2c3e50] mt-1">
                {fin.bepUnits ? `${fin.bepUnits} Unit` : "Defisit Unit"}
              </div>
              <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                {fin.bepRevenue ? `Omset Impas: Rp ${fin.bepRevenue.toLocaleString("id-ID")}` : "Margin negatif"}
              </span>
            </div>
          </div>

          {/* Unit Economics Breakdown Card */}
          <div className="bg-white rounded border border-slate-200 p-5 shadow-flat">
            <h3 className="text-xs sm:text-sm font-bold text-[#2c3e50] uppercase tracking-wide mb-3">
              Bedah Ekonomi Unit (Unit Economics) & Margin Kontribusi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-[#f4f6f9] border border-slate-200">
                <span className="text-[#7f8c8d] block text-[11px]">Margin Kontribusi per Unit</span>
                <span className="text-base font-black text-[#2c3e50] block mt-0.5">
                  Rp {fin.unitContributionMargin.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-[#95a5a6] mt-0.5 block">
                  Harga Jual − Biaya Variabel Langsung
                </span>
              </div>

              <div className="p-3 rounded bg-[#f4f6f9] border border-slate-200">
                <span className="text-[#7f8c8d] block text-[11px]">Rasio Margin Kontribusi</span>
                <span className="text-base font-black text-[#2c3e50] block mt-0.5">
                  {fin.contributionMarginRatio}%
                </span>
                <span className="text-[10px] text-[#95a5a6] mt-0.5 block">
                  Persentase setiap rupiah omset penutup biaya tetap
                </span>
              </div>

              <div className="p-3 rounded bg-[#f4f6f9] border border-slate-200">
                <span className="text-[#7f8c8d] block text-[11px]">Ketahanan Modal / Runway</span>
                <span
                  className={`text-base font-black block mt-0.5 ${
                    fin.capitalAdequacyStatus === "Mencukupi"
                      ? "text-[#27ae60]"
                      : "text-[#d35400]"
                  }`}
                >
                  {fin.capitalAdequacyStatus}
                </span>
                <span className="text-[10px] text-[#95a5a6] mt-0.5 block">
                  {fin.capitalRunwayMonths !== null ? `Runway: ~${fin.capitalRunwayMonths} bulan` : "Arus kas surplus"}
                </span>
              </div>
            </div>

            {/* Explanation & Limitations */}
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <h4 className="font-bold text-[11px] text-[#2c3e50] uppercase tracking-wide">
                Penjelasan Logika Perhitungan:
              </h4>
              <ul className="space-y-1 text-xs text-[#576574]">
                {fin.explanation.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#1abc9c] font-black">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>

              <h4 className="font-bold text-[11px] text-[#2c3e50] uppercase tracking-wide pt-2">
                Batasan Model Finansial Ini:
              </h4>
              <ul className="space-y-1 text-xs text-[#7f8c8d]">
                {fin.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#e67e22] font-black">•</span>
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
        <div className="space-y-4">
          <div className="bg-white rounded border border-slate-200 p-5 shadow-flat border-t-4 border-[#3498db]">
            <h3 className="text-xs sm:text-sm font-bold text-[#2c3e50] uppercase tracking-wide mb-1">
              Perbandingan 3 Skenario Pasar: Konservatif, Moderat, dan Optimistis
            </h3>
            <p className="text-xs text-[#7f8c8d] mb-4">
              Uji ketahanan bisnis jika penjualan di bawah target atau biaya bahan baku meningkat.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecf0f1" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#2c3e50" }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#7f8c8d" }}
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`Rp ${Number(val).toLocaleString("id-ID")}`, ""]}
                    contentStyle={{ borderRadius: "4px", border: "1px solid #bdc3c7", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="Pendapatan" fill="#3498db" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Total Biaya" fill="#95a5a6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Laba Operasional" fill="#2ecc71" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Flat Comparison Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200">
                <thead className="bg-[#2c3e50] text-white uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Skenario</th>
                    <th className="px-3 py-2">Volume</th>
                    <th className="px-3 py-2">Harga</th>
                    <th className="px-3 py-2">Omset</th>
                    <th className="px-3 py-2">Total Beban</th>
                    <th className="px-3 py-2">Laba Bersih</th>
                    <th className="px-3 py-2">BEP Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {record.scenarios.map((sc, idx) => (
                    <tr key={idx} className="hover:bg-[#f4f6f9]">
                      <td className="px-3 py-2 font-bold text-[#2c3e50]">{sc.scenarioName}</td>
                      <td className="px-3 py-2">{sc.salesVolume} unit</td>
                      <td className="px-3 py-2">Rp {sc.sellingPrice.toLocaleString("id-ID")}</td>
                      <td className="px-3 py-2">Rp {sc.revenue.toLocaleString("id-ID")}</td>
                      <td className="px-3 py-2">Rp {sc.totalCost.toLocaleString("id-ID")}</td>
                      <td
                        className={`px-3 py-2 font-bold ${
                          sc.operatingProfit >= 0 ? "text-[#27ae60]" : "text-[#c0392b]"
                        }`}
                      >
                        Rp {sc.operatingProfit.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2">{sc.bepUnits ? `${sc.bepUnits} unit` : "Defisit"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Sensitivity Playground */}
          <div className="bg-white rounded border border-slate-200 p-5 shadow-flat border-t-4 border-[#1abc9c]">
            <div className="flex items-center gap-1.5 mb-2">
              <Sliders className="w-4 h-4 text-[#1abc9c]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#2c3e50] uppercase tracking-wide">
                Playground Sensitivitas Interaktif (Uji Perubahan Mandiri)
              </h3>
            </div>
            <p className="text-xs text-[#7f8c8d] mb-4">
              Geser tuas di bawah untuk melihat dampak langsung terhadap laba dan titik impas secara real-time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#2c3e50] uppercase">
                  <span>Perubahan Volume:</span>
                  <span className={volumeDelta >= 0 ? "text-[#27ae60]" : "text-[#c0392b]"}>
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
                  className="w-full accent-[#1abc9c]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#2c3e50] uppercase">
                  <span>Perubahan Harga:</span>
                  <span className={priceDelta >= 0 ? "text-[#27ae60]" : "text-[#c0392b]"}>
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
                  className="w-full accent-[#1abc9c]"
                />
              </div>
            </div>

            {/* Dynamic Results Card */}
            <div className="mt-4 p-3 rounded bg-[#f4f6f9] border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#7f8c8d] block text-[11px]">Omset Simulasi:</span>
                <span className="text-xs font-bold text-[#2c3e50]">
                  Rp {dynamicSimulated.totalMonthlyRevenue.toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-[#7f8c8d] block text-[11px]">Beban Total:</span>
                <span className="text-xs font-bold text-[#2c3e50]">
                  Rp {dynamicSimulated.totalMonthlyCost.toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-[#7f8c8d] block text-[11px]">Laba Operasional:</span>
                <span
                  className={`text-xs font-bold ${
                    dynamicSimulated.monthlyOperatingProfit >= 0
                      ? "text-[#27ae60]"
                      : "text-[#c0392b]"
                  }`}
                >
                  Rp {dynamicSimulated.monthlyOperatingProfit.toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-[#7f8c8d] block text-[11px]">BEP Unit Baru:</span>
                <span className="text-xs font-bold text-[#2c3e50]">
                  {dynamicSimulated.bepUnits ? `${dynamicSimulated.bepUnits} unit` : "Defisit"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EVALUASI RISIKO & MITIGASI */}
      {activeTab === "risiko" && (
        <div className="space-y-4">
          <div className="bg-white rounded border border-slate-200 p-5 shadow-flat">
            <h3 className="text-xs sm:text-sm font-bold text-[#2c3e50] uppercase tracking-wide mb-1">
              Matriks Identifikasi Risiko & Langkah Mitigasi
            </h3>
            <p className="text-xs text-[#7f8c8d] mb-4">
              Setiap risiko dinilai berdasarkan heuristik deterministik atas struktur biaya dan kelengkapan data Anda.
            </p>

            <div className="space-y-3">
              {record.risks.map((risk) => {
                const badgeColor =
                  risk.severity === "Kritis"
                    ? "bg-[#e74c3c] text-white"
                    : risk.severity === "Tinggi"
                    ? "bg-[#e67e22] text-white"
                    : "bg-[#3498db] text-white";

                const borderLeftColor =
                  risk.severity === "Kritis"
                    ? "border-l-4 border-[#e74c3c]"
                    : risk.severity === "Tinggi"
                    ? "border-l-4 border-[#e67e22]"
                    : "border-l-4 border-[#3498db]";

                return (
                  <div
                    key={risk.id}
                    className={`p-4 rounded border border-slate-200 bg-white shadow-flat space-y-2 ${borderLeftColor}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
                          Tingkat: {risk.severity}
                        </span>
                        <span className="text-xs text-[#7f8c8d] font-semibold">
                          Kategori: {risk.category}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-[#2c3e50]">{risk.title}</h4>
                    <p className="text-xs text-[#576574] leading-relaxed">
                      {risk.description}
                    </p>

                    <div className="p-2.5 rounded bg-[#f4f6f9] text-xs text-[#2c3e50] space-y-0.5">
                      <div>
                        <strong>Dasar Penilaian:</strong> {risk.assessmentBasis}
                      </div>
                      <div>
                        <strong>Potensi Dampak:</strong> {risk.potentialImpact}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-[#2c3e50] uppercase block mb-1">
                        Langkah Mitigasi Konkret:
                      </span>
                      <ul className="space-y-1 text-xs text-[#576574]">
                        {risk.mitigationSteps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-[#1abc9c] font-black">•</span>
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
        <div className="bg-white rounded border border-slate-200 shadow-flat flex flex-col h-[550px] overflow-hidden border-t-4 border-[#1abc9c]">
          <div className="p-3.5 border-b border-slate-200 bg-[#2c3e50] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#1abc9c] text-white flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  Konsultasi Analis Bisnis: {record.businessName}
                </h4>
                <p className="text-[10px] text-[#bdc3c7]">
                  Terisolasi pada data analisis ini. Tidak mengarang data luar.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f4f6f9]">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3 rounded text-xs whitespace-pre-line leading-relaxed shadow-flat ${
                    msg.sender === "user"
                      ? "bg-[#1abc9c] text-white"
                      : "bg-white text-[#2c3e50] border border-slate-200"
                  }`}
                >
                  <p>{msg.content}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.sender === "user" ? "text-[#a3e4d7]" : "text-[#95a5a6]"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-2.5 rounded border border-slate-200 text-xs text-[#7f8c8d] flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-[#1abc9c] border-t-transparent rounded-full animate-spin" />
                  <span>Analis sedang memformulasikan kalkulasi...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2 bg-white border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
            {[
              "Apa yang terjadi jika penjualan turun 20%?",
              "Mengapa modal saya dianggap belum mencukupi?",
              "Bagaimana cara mengurangi biaya operasional?",
              "Apakah saya sebaiknya memulai dari rumah?",
            ].map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="px-2.5 py-1 rounded bg-[#f4f6f9] hover:bg-slate-200 text-[#2c3e50] border border-slate-300 font-semibold whitespace-nowrap transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-2.5 border-t border-slate-200 bg-white flex gap-2 items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Tanyakan hal spesifik tentang modal, BEP, atau risiko usaha Anda..."
              className="flex-1 px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={chatLoading || !inputMessage.trim()}
              className="px-3 py-1.5 rounded bg-[#1abc9c] hover:bg-[#16a085] disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
