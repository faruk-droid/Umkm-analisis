import { NextRequest, NextResponse } from "next/server";
import { BUSINESS_CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { BusinessAnalysisRecord } from "@/types";
import { simulateSensitivity } from "@/lib/finance/calculator";
import { getAIProviderConfig, GEMINI_MODEL } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const { message, analysisRecord, history } = (await req.json()) as {
      message: string;
      analysisRecord: BusinessAnalysisRecord;
      history?: { sender: "user" | "assistant"; content: string }[];
    };

    if (!message || !analysisRecord) {
      return NextResponse.json(
        { error: "Pesan dan data konteks analisis diperlukan." },
        { status: 400 }
      );
    }

    const providerConfig = getAIProviderConfig();
    const qLower = message.toLowerCase();

    // 1. Respon Heuristik Cepat & Tepat jika menyangkut simulasi atau offline fallback
    if (!providerConfig) {
      let reply = "";

      if (qLower.includes("turun") && (qLower.includes("penjualan") || qLower.includes("omset") || qLower.includes("volume"))) {
        // Simulasi penurunan volume penjualan sebesar 20%
        const isGrowth = analysisRecord.serviceType === "growth";
        const baseParams = isGrowth
          ? {
              availableCapital: (analysisRecord.inputSnapshot as any).initialCapital || 0,
              initialSetupCost: 0,
              monthlyFixedCost: (analysisRecord.inputSnapshot as any).monthlyFixedCost || 0,
              sellingPricePerUnit: (analysisRecord.inputSnapshot as any).sellingPrice || 0,
              variableCostPerUnit: (analysisRecord.inputSnapshot as any).productionCostPerUnit || 0,
              estimatedMonthlyUnits: (analysisRecord.inputSnapshot as any).monthlyUnitsSold || 0,
            }
          : {
              availableCapital: (analysisRecord.inputSnapshot as any).availableCapital || 0,
              initialSetupCost: (analysisRecord.inputSnapshot as any).estimatedInitialCost || 0,
              monthlyFixedCost: (analysisRecord.inputSnapshot as any).monthlyFixedCostEstimate || 0,
              sellingPricePerUnit: (analysisRecord.inputSnapshot as any).sellingPriceEstimate || 0,
              variableCostPerUnit: (analysisRecord.inputSnapshot as any).variableCostPerUnitEstimate || 0,
              estimatedMonthlyUnits: (analysisRecord.inputSnapshot as any).expectedMonthlySalesVolume || 0,
            };

        const simulated = simulateSensitivity(baseParams, { volume: -20 });

        reply = `Berdasarkan kalkulasi deterministik, jika volume penjualan turun sebesar 20%:\n\n` +
          `• Volume Penjualan Baru: ${simulated.totalMonthlyRevenue / (baseParams.sellingPricePerUnit || 1)} unit\n` +
          `• Estimasi Omset Baru: Rp ${simulated.totalMonthlyRevenue.toLocaleString("id-ID")}\n` +
          `• Total Beban Operasional: Rp ${simulated.totalMonthlyCost.toLocaleString("id-ID")}\n` +
          `• Estimasi Laba Bersih: Rp ${simulated.monthlyOperatingProfit.toLocaleString("id-ID")} (Margin ${simulated.profitMarginPercent}%)\n\n` +
          `${simulated.monthlyOperatingProfit < 0 ? "⚠️ PERINGATAN: Pada volume ini, usaha akan jatuh ke posisi defisit operasional. Pastikan Anda memiliki cadangan dana likuid." : "✅ Usaha masih mempertahankan laba operasional positif, namun dengan margin keuntungan yang lebih ketat."}`;
      } else if (qLower.includes("modal") && (qLower.includes("belum mencukupi") || qLower.includes("kurang") || qLower.includes("mengapa"))) {
        const fin = analysisRecord.financialMetrics;
        reply = `Penilaian modal berstatus '${fin.capitalAdequacyStatus}' karena:\n\n` +
          `1. Biaya awal persiapan usaha tercatat sebesar Rp ${fin.totalInitialCost.toLocaleString("id-ID")}.\n` +
          `2. Beban operasional bulanan tetap mencapai Rp ${fin.totalMonthlyFixedCost.toLocaleString("id-ID")}.\n` +
          `3. ${fin.capitalRunwayMonths !== null ? `Daya tahan kas darurat (runway) saat ini diperkirakan hanya sanggup bertahan ~${fin.capitalRunwayMonths} bulan jika pendapatan belum tercapai.` : "Modal kerja belum menyisakan cadangan likuiditas minimal 3-6 bulan operasional."}\n\n` +
          `Saran: Kurangi belanja aset awal yang tidak penting dan gunakan model bertahap (seperti prapesan/sewa jangka pendek).`;
      } else if (qLower.includes("kurangi biaya") || qLower.includes("biaya operasional") || qLower.includes("efisiensi")) {
        reply = `Untuk mengefisienkan struktur biaya usaha "${analysisRecord.businessName}":\n\n` +
          `1. Biaya Tetap (Rp ${analysisRecord.financialMetrics.totalMonthlyFixedCost.toLocaleString("id-ID")}/bln): Tinjau biaya sewa tempat, langganan utilitas, atau alihkan operasional ke model rumahan/cloud sebelum menyewa tempat permanen.\n` +
          `2. Biaya Variabel per unit: Lakukan negosiasi harga pembelian bahan mentah dalam jumlah sedikit lebih besar atau bandingkan minimal 3 supplier grosir.\n` +
          `3. Fokuskan modal kerja hanya pada inventaris produk yang memiliki tingkat perputaran (turnover) tinggi.`;
      } else if (qLower.includes("rumah") || qLower.includes("toko")) {
        reply = `Memulai dari rumah sangat dianjurkan pada tahap validasi awal. Keuntungannya adalah Anda memangkas biaya tetap sewa tempat hingga 100%, sehingga titik impas (BEP) menjadi jauh lebih rendah dan risiko kehilangan modal berkurang drastis sebelum produk Anda terbukti diminati pelanggan.`;
      } else {
        reply = `Terkait pertanyaan Anda mengenai "${analysisRecord.businessName}":\n\n` +
          `Saat ini model bisnis memiliki margin kontribusi per unit Rp ${analysisRecord.financialMetrics.unitContributionMargin.toLocaleString("id-ID")}, dengan titik impas di ${analysisRecord.financialMetrics.bepUnits || "belum terjangkau"} unit per bulan.\n\n` +
          `Untuk keputusan strategis di luar cakupan data ini, pastikan Anda telah memverifikasi data harga bahan baku langsung ke supplier dan melakukan survei minat langsung ke calon konsumen.`;
      }

      return NextResponse.json({ reply });
    }

    // 2. Jika ada API key, gunakan provider server-side dengan konteks terisolasi
    const contextPrompt = `${BUSINESS_CHAT_SYSTEM_PROMPT}

Konteks Snapshot Analisis Bisnis Saat Ini:
- Nama Bisnis: ${analysisRecord.businessName}
- Kategori: ${analysisRecord.category}
- Tipe Layanan: ${analysisRecord.serviceType}
- Lokasi: ${analysisRecord.location}
- Ringkasan Finansial: ${JSON.stringify(analysisRecord.financialMetrics)}
- Risiko Utama: ${JSON.stringify(analysisRecord.risks.map((r) => ({ title: r.title, basis: r.assessmentBasis })))}
- Rekomendasi AI: ${analysisRecord.aiReport.executiveSummary}

Pertanyaan Pengguna:
${message}
`;

    let reply: string | undefined;
    if (providerConfig.provider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": providerConfig.apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: contextPrompt }] }],
        }),
      });

      if (!res.ok) throw new Error("Gemini chat API error");
      const data = await res.json();
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${providerConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: BUSINESS_CHAT_SYSTEM_PROMPT },
            { role: "user", content: contextPrompt },
          ],
        }),
      });

      if (!res.ok) throw new Error("OpenAI chat API error");
      const data = await res.json();
      reply = data.choices?.[0]?.message?.content;
    }

    if (!reply) throw new Error("Provider AI tidak mengembalikan jawaban.");
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({
      reply: "Terjadi kendala pada koneksi AI eksternal. Silakan periksa pengaturan jaringan atau gunakan analisis data deterministik pada tab laporan.",
    });
  }
}
