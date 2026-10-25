import { z } from "zod";
import {
  AIAnalysisReport,
  ConfidenceLevel,
  FinancialMetrics,
  GrowthFormData,
  PlannerFormData,
  RiskItem,
  ScenarioResult,
} from "@/types";
import { BUSINESS_ANALYST_SYSTEM_PROMPT } from "./prompts";
import { getAIProviderConfig, GEMINI_MODEL } from "./provider";

export const AIReportZodSchema = z.object({
  executiveSummary: z.string(),
  businessStrengths: z.array(z.string()),
  businessWeaknesses: z.array(z.string()),
  financialAnalysisNarrative: z.string(),
  marketInsights: z.object({
    status: z.enum([
      "Analisis Pasar Terbatas (Input Mandiri)",
      "Data Demo Terindikasi",
      "Data Eksternal Terhubung",
    ]),
    targetCustomerProfile: z.string(),
    demandValidationStatus: z.enum(["Belum Tervalidasi", "Uji Pasar Terbatas", "Tervalidasi Operasional"]),
    competitiveOverview: z.string(),
    unverifiedDataNotice: z.string(),
    recommendedValidationSteps: z.array(z.string()),
  }),
  alternativeModels: z.array(
    z.object({
      modelName: z.string(),
      pros: z.string(),
      cons: z.string(),
      capitalRequirementEstimate: z.string(),
    })
  ),
  actionPlanBeforeInvestment: z.array(z.string()),
  dataConfidenceScore: z.object({
    level: z.enum(["Rendah", "Sedang", "Tinggi"]),
    scorePercent: z.number().min(0).max(100),
    explanation: z.string(),
    missingCriticalData: z.array(z.string()),
  }),
  disclaimer: z.string(),
});

/**
 * Menghitung skor kualitas dan kelengkapan data secara transparan
 */
export type FinancialReportStatus = "provided" | "missing" | "not_required";

export function calculateDataConfidence(
  formData: PlannerFormData | GrowthFormData,
  financialReportStatus: FinancialReportStatus = "not_required"
): {
  level: ConfidenceLevel;
  scorePercent: number;
  explanation: string;
  missingCriticalData: string[];
} {
  const missingCriticalData: string[] = [];
  let penalty = 0;

  const unknownFields = formData.unknownFields || [];
  if (unknownFields.length > 0) {
    penalty += unknownFields.length * 12;
    missingCriticalData.push(...unknownFields.map((f) => `Data '${f}' belum diverifikasi pengguna`));
  }

  if ("businessModel" in formData) {
    // Planner
    if (formData.businessModel === "belum_tahu") {
      penalty += 15;
      missingCriticalData.push("Model bisnis operasional belum ditentukan");
    }
    if (formData.expectedMonthlySalesVolume <= 0) {
      penalty += 20;
      missingCriticalData.push("Belum memiliki estimasi volume penjualan realistis");
    }
    if (formData.previousExperience === "tidak_ada") {
      penalty += 10;
      missingCriticalData.push("Belum ada rekam jejak operasional usaha sebelumnya");
    }
  } else {
    // Growth
    if (formData.monthlyUnitsSold <= 0) {
      penalty += 20;
      missingCriticalData.push("Data unit terjual bulanan belum terdata");
    }
    if (!formData.lowSellingProduct) {
      missingCriticalData.push("Data produk dengan perputaran rendah belum dievaluasi");
    }
    if (financialReportStatus === "missing") {
      penalty += 15;
      missingCriticalData.push(
        "Laporan keuangan historis belum dilampirkan; analisis hanya menggunakan input formulir."
      );
    }
  }

  const rawScore = Math.max(20, Math.min(95, 100 - penalty));
  let level: ConfidenceLevel = "Sedang";
  if (rawScore >= 75) level = "Tinggi";
  else if (rawScore < 50) level = "Rendah";

  const baseExplanation =
    level === "Tinggi"
      ? "Kualitas data input memadai untuk kalkulasi unit ekonomi dasar, namun tetap membutuhkan validasi respons pasar riil."
      : level === "Sedang"
      ? "Data cukup untuk estimasi simulasi awal, tetapi beberapa variabel biaya dan volume masih berupa asumsi mentah."
      : "Banyak variabel kunci masih belum teridentifikasi. Hasil analisis harus diposisikan sebagai pemetaan awal, BUKAN dasar final investasi.";
  const explanation =
    financialReportStatus === "missing" && !("businessModel" in formData)
      ? `${baseExplanation} Laporan keuangan historis belum dilampirkan, sehingga angka input belum dapat direkonsiliasi dengan catatan aktual.`
      : baseExplanation;

  return {
    level,
    scorePercent: rawScore,
    explanation,
    missingCriticalData,
  };
}

/**
 * Expert Rule-Based Advisor Fallback (Bila API Key belum diset atau offline)
 * Memastikan aplikasi tetap 100% fungsional, rasional, dan memberikan insight mendalam.
 */
export function generateExpertRuleBasedReport(
  formData: PlannerFormData | GrowthFormData,
  financials: FinancialMetrics,
  scenarios: ScenarioResult[],
  risks: RiskItem[],
  isGrowth: boolean,
  financialReportStatus: FinancialReportStatus = "not_required"
): AIAnalysisReport {
  const confidence = calculateDataConfidence(formData, financialReportStatus);
  const name = formData.businessName || "Rencana Usaha";

  const isProfitable = financials.monthlyOperatingProfit > 0;
  const bepInfo =
    financials.bepUnits !== null
      ? `Usaha membutuhkan penjualan minimal ${financials.bepUnits} unit/bulan (omset Rp ${(financials.bepRevenue || 0).toLocaleString(
          "id-ID"
        )}) untuk mencapai titik impas operasional.`
      : "Titik impas (BEP) saat ini tidak dapat dicapai karena harga jual per unit belum menutup biaya variabel produksi.";

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (financials.unitContributionMargin > 0) {
    strengths.push(
      `Margin kontribusi unit positif sebesar Rp ${financials.unitContributionMargin.toLocaleString(
        "id-ID"
      )} (${financials.contributionMarginRatio}% dari harga).`
    );
  } else {
    weaknesses.push(
      "Margin kontribusi per unit berada di bawah nol atau impas. Bisnis merugi setiap kali memproduksi produk."
    );
  }

  if (financials.capitalAdequacyStatus === "Mencukupi") {
    strengths.push("Ketersediaan modal awal berada dalam kisaran aman untuk kebutuhan persiapan dan operasional awal.");
  } else {
    weaknesses.push(
      `Daya tahan modal (runway) berada dalam status ${financials.capitalAdequacyStatus}. Terlalu rentan terhadap keterlambatan penerimaan pendapatan.`
    );
  }

  if (isGrowth) {
    const growth = formData as GrowthFormData;
    if (growth.topSellingProduct) {
      strengths.push(`Terdapat produk unggulan tervalidasi pasar: ${growth.topSellingProduct}.`);
    }
    if (growth.currentBottlenecks) {
      weaknesses.push(`Kendala operasional yang dilaporkan: "${growth.currentBottlenecks}".`);
    }
  } else {
    const planner = formData as PlannerFormData;
    if (planner.previousExperience !== "tidak_ada") {
      strengths.push(`Pendiri memiliki pengalaman usaha (${planner.previousExperience.replace(/_/g, " ")}).`);
    } else {
      weaknesses.push("Pendiri belum memiliki pengalaman wirausaha langsung di kategori ini sebelumnya.");
    }
  }

  return {
    executiveSummary: `Analisis untuk "${name}" menunjukkan potensi ${
      isProfitable ? "margin operasional positif" : "defisit operasional"
    } pada volume dasar saat ini. ${bepInfo} Disarankan untuk menguji penerimaan harga pasar dan meninjau kembali rincian biaya tetap sebelum melakukan komitmen modal skala penuh.`,
    businessStrengths: strengths,
    businessWeaknesses: weaknesses,
    financialAnalysisNarrative: `Berdasarkan proyeksi keuangan, pendapatan bulanan diperkirakan Rp ${financials.totalMonthlyRevenue.toLocaleString(
      "id-ID"
    )} dengan total beban bulanan Rp ${financials.totalMonthlyCost.toLocaleString("id-ID")}. ${
      financials.monthlyOperatingProfit >= 0
        ? `Laba operasional sederhana diproyeksikan sebesar Rp ${financials.monthlyOperatingProfit.toLocaleString(
            "id-ID"
          )} (${financials.profitMarginPercent}% margin).`
        : `Defisit operasional bulanan diproyeksikan sebesar Rp ${Math.abs(financials.monthlyOperatingProfit).toLocaleString(
            "id-ID"
          )}.`
    }`,
    marketInsights: {
      status: "Analisis Pasar Terbatas (Input Mandiri)",
      targetCustomerProfile:
        ("targetMarket" in formData && formData.targetMarket)
          ? formData.targetMarket
          : "Target segmen pelanggan di area operasional",
      demandValidationStatus: isGrowth ? "Tervalidasi Operasional" : "Belum Tervalidasi",
      competitiveOverview:
        "Data persaingan eksternal belum dihubungkan melalui API peta/statistik publik. Analisis mengacu pada estimasi diferensiasi dan struktur harga yang diisi pengguna.",
      unverifiedDataNotice:
        "PERHATIAN: Platform belum menghubungkan data agregat kompetitor lokal atau tren belanja BPS pada sesi ini. Jangan mengasumsikan pasar pasti menyerap seluruh kuantitas tanpa uji coba lapangan.",
      recommendedValidationSteps: [
        "Lakukan wawancara langsung ke minimal 15 calon konsumen potensial di lokasi target.",
        "Cek harga dan porsi menu/produk dari minimal 3 kompetitor terdekat dalam radius 2 km.",
        "Lakukan pra-penjualan atau tes pesanan terbatas melalui saluran media sosial atau komunitas lokal.",
      ],
    },
    alternativeModels: [
      {
        modelName: "Model Pre-Order (PO) & Uji Coba Terbatas",
        pros: "Kebutuhan modal awal minim, memangkas risiko sisa stok basi/mati, aliran kas masuk di depan.",
        cons: "Waktu pengiriman lebih lama, kapasitas produksi harian terbatas.",
        capitalRequirementEstimate: "Rendah (Hanya modal bahan per batch)",
      },
      {
        modelName: "Model Penjualan Online / Cloud-Kitchen dari Rumah",
        pros: "Menghilangkan biaya sewa ruko tahunan yang mahal, biaya overhead tetap terjaga sangat rendah.",
        cons: "Sangat bergantung pada promosi digital dan ongkos kirim pelanggan.",
        capitalRequirementEstimate: "Sedang (Peralatan dapur/produksi standar)",
      },
      {
        modelName: "Model Toko Fisik Mandiri",
        pros: "Keterlihatan langsung (traffic organik) dan interaksi tatap muka yang kuat.",
        cons: "Beban sewa tinggi dan mengikat, risiko sepi pengunjung di awal jika salah lokasi.",
        capitalRequirementEstimate: "Tinggi (Sewa tempat, renovasi, inventaris awal)",
      },
    ],
    actionPlanBeforeInvestment: [
      "Verifikasi harga beli bahan baku langsung ke 2-3 supplier grosir utama.",
      "Uji coba resep/sampel produk ke kelompok non-keluarga untuk mendapatkan umpan balik yang jujur.",
      "Siapkan dana cadangan darurat khusus operasional minimal 3 bulan sebelum ekspansi.",
      "Jangan melakukan sewa tempat jangka panjang sebelum memiliki data konversi harian yang stabil.",
    ],
    dataConfidenceScore: confidence,
    disclaimer:
      "Laporan ini adalah instrumen pendukung keputusan berdasarkan pemodelan matematis deterministik dan penalaran logis atas input pengguna. Ini BUKAN jaminan kepastian hasil bisnis. Risiko kewirausahaan tetap menjadi tanggung jawab pengambil keputusan.",
  };
}

/**
 * Generate AI Report via API (Gemini/OpenAI) with structured fallback
 */
export async function generateAIAnalysis(
  formData: PlannerFormData | GrowthFormData,
  financials: FinancialMetrics,
  scenarios: ScenarioResult[],
  risks: RiskItem[],
  isGrowth: boolean,
  financialReportText?: string,
  financialReportStatus: FinancialReportStatus = "not_required"
): Promise<AIAnalysisReport> {
  const providerConfig = getAIProviderConfig();
  const geminiKey = providerConfig?.provider === "gemini" ? providerConfig.apiKey : undefined;
  const openAIKey = providerConfig?.provider === "openai" ? providerConfig.apiKey : undefined;
  const hasFinancialReport = Boolean(financialReportText?.trim());
  const generateFallbackReport = () => {
    const report = generateExpertRuleBasedReport(
      formData,
      financials,
      scenarios,
      risks,
      isGrowth,
      financialReportStatus
    );
    if (hasFinancialReport) {
      report.executiveSummary +=
        "\n\nLampiran keuangan ikut diproses. Lihat bagian rekonsiliasi laporan untuk angka yang terdeteksi dan pemeriksaan konsistensinya.";
      report.dataConfidenceScore.explanation +=
        " Angka pada lampiran diekstrak berdasarkan label yang dikenali; periode dan dasar pencatatannya perlu dicocokkan dengan input bulanan.";
      report.dataConfidenceScore.missingCriticalData.push(
        "Cocokkan periode laporan dan angka historis dengan asumsi bulanan pada formulir"
      );
      report.disclaimer +=
        " Angka lampiran ditampilkan sebagai data laporan dan tidak menggantikan kalkulasi berdasarkan formulir.";
    }
    return report;
  };

  // Jika tidak ada API key, gunakan Expert Rule-Based Advisor yang deterministik
  if (!geminiKey && !openAIKey) {
    return generateFallbackReport();
  }

  try {
    const promptContext = {
      formData,
      financials,
      scenarios,
      risks,
      isGrowth,
      financialReportText,
    };

    if (geminiKey) {
      // Call Google Gemini API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${BUSINESS_ANALYST_SYSTEM_PROMPT}\n\nKonteks Data Bisnis:\n${JSON.stringify(
                    promptContext
                  )}\n\nKeluarkan JSON murni sesuai skema AIAnalysisReport tanpa awalan teks apapun:`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (!res.ok) {
        console.warn("Gemini API returned error, falling back to deterministic analysis.");
        return generateFallbackReport();
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        const validated = AIReportZodSchema.safeParse(parsed);
        if (validated.success) {
          return {
            ...validated.data,
            dataConfidenceScore: calculateDataConfidence(formData, financialReportStatus),
          };
        }
      }
    } else if (openAIKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          temperature: 0.2,
          messages: [
            { role: "system", content: BUSINESS_ANALYST_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Konteks Data Bisnis:\n${JSON.stringify(
                promptContext
              )}\n\nKeluarkan JSON murni sesuai skema AIAnalysisReport tanpa awalan teks apapun.`,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error("Provider AI gagal memproses laporan keuangan.");
      }

      const data = await res.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        const validated = AIReportZodSchema.safeParse(parsed);
        if (validated.success) {
          return {
            ...validated.data,
            dataConfidenceScore: calculateDataConfidence(formData, financialReportStatus),
          };
        }
      }
    }
  } catch (err) {
    console.error("AI generation failed, using deterministic fallback:", err);
    return generateFallbackReport();
  }

  return generateFallbackReport();
}
