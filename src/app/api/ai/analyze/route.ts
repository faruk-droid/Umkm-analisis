import { NextRequest, NextResponse } from "next/server";
import { calculateFinancialMetrics } from "@/lib/finance/calculator";
import { generateScenarios } from "@/lib/finance/scenario-engine";
import { assessBusinessRisks } from "@/lib/finance/risk-engine";
import { generateAIAnalysis } from "@/lib/ai/service";
import { BusinessAnalysisRecord, GrowthFormData, PlannerFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceType, formData } = body as {
      serviceType: "planner" | "growth";
      formData: PlannerFormData | GrowthFormData;
    };

    if (!serviceType || !formData) {
      return NextResponse.json(
        { error: "Parameter serviceType dan formData diperlukan." },
        { status: 400 }
      );
    }

    const isGrowth = serviceType === "growth";

    // 1. Kalkulasi Finansial Deterministik
    const financialParams = isGrowth
      ? {
          availableCapital: (formData as GrowthFormData).initialCapital || 0,
          initialSetupCost: 0,
          monthlyFixedCost: (formData as GrowthFormData).monthlyFixedCost || 0,
          sellingPricePerUnit: (formData as GrowthFormData).sellingPrice || 0,
          variableCostPerUnit: (formData as GrowthFormData).productionCostPerUnit || 0,
          estimatedMonthlyUnits: (formData as GrowthFormData).monthlyUnitsSold || 0,
        }
      : {
          availableCapital: (formData as PlannerFormData).availableCapital || 0,
          initialSetupCost: (formData as PlannerFormData).estimatedInitialCost || 0,
          monthlyFixedCost: (formData as PlannerFormData).monthlyFixedCostEstimate || 0,
          sellingPricePerUnit: (formData as PlannerFormData).sellingPriceEstimate || 0,
          variableCostPerUnit: (formData as PlannerFormData).variableCostPerUnitEstimate || 0,
          estimatedMonthlyUnits: (formData as PlannerFormData).expectedMonthlySalesVolume || 0,
        };

    const financialMetrics = calculateFinancialMetrics(financialParams);

    // 2. Simulasi Skenario Konservatif, Moderat, Optimistis
    const scenarios = generateScenarios(financialParams);

    // 3. Analisis Risiko Terstruktur
    const risks = assessBusinessRisks(formData, financialMetrics, isGrowth);

    // 4. Analisis Strategis & Rekomendasi AI (atau Expert Rule-Based Advisor jika tanpa API key)
    const aiReport = await generateAIAnalysis(
      formData,
      financialMetrics,
      scenarios,
      risks,
      isGrowth
    );

    // 5. Susun Record Snapshot Lengkap
    const recordId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const analysisRecord: BusinessAnalysisRecord = {
      id: recordId,
      serviceType,
      businessName: formData.businessName || "Usaha Baru",
      category: formData.category || "Umum",
      location: formData.location || "Indonesia",
      createdAt: new Date().toISOString(),
      inputSnapshot: formData,
      financialMetrics,
      scenarios,
      risks,
      aiReport,
      version: "1.0",
    };

    return NextResponse.json(analysisRecord);
  } catch (error: any) {
    console.error("Analysis generation error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses analisis bisnis: " + error.message },
      { status: 500 }
    );
  }
}
