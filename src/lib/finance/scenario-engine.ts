import { ScenarioResult } from "@/types";
import { CalculateFinancialParams, calculateFinancialMetrics } from "./calculator";

export interface CustomScenarioOverrides {
  conservative?: {
    volumeFactor?: number;
    priceFactor?: number;
    variableCostFactor?: number;
    fixedCostFactor?: number;
  };
  optimistic?: {
    volumeFactor?: number;
    priceFactor?: number;
    variableCostFactor?: number;
    fixedCostFactor?: number;
  };
}

/**
 * Membangun 3 Skenario Bisnis Transparan: Konservatif, Moderat, dan Optimistis.
 * Semua nilai didasarkan pada asumsi persentase yang jelas, bukan angka acak.
 */
export function generateScenarios(
  baseParams: CalculateFinancialParams,
  overrides?: CustomScenarioOverrides
): ScenarioResult[] {
  // Faktor Konservatif (skenario uji ketahanan bisnis menghadapi penurunan pasar)
  const consVol = overrides?.conservative?.volumeFactor ?? 0.7; // Penjualan turun 30%
  const consPrice = overrides?.conservative?.priceFactor ?? 1.0;
  const consVar = overrides?.conservative?.variableCostFactor ?? 1.1; // Biaya bahan naik 10%
  const consFix = overrides?.conservative?.fixedCostFactor ?? 1.05; // Beban operasional naik 5%

  // Moderat (Sesuai estimasi rencana awal pengguna)
  const modVol = 1.0;
  const modPrice = 1.0;
  const modVar = 1.0;
  const modFix = 1.0;

  // Faktor Optimistis (Penerimaan pasar sangat baik & efisiensi operasional)
  const optVol = overrides?.optimistic?.volumeFactor ?? 1.35; // Penjualan naik 35%
  const optPrice = overrides?.optimistic?.priceFactor ?? 1.05; // Daya tawar harga naik 5%
  const optVar = overrides?.optimistic?.variableCostFactor ?? 0.95; // Efisiensi skala 5%
  const optFix = overrides?.optimistic?.fixedCostFactor ?? 1.0;

  const buildScenario = (
    name: "Konservatif" | "Moderat" | "Optimistis",
    vF: number,
    pF: number,
    varF: number,
    fixF: number,
    assumptions: string[]
  ): ScenarioResult => {
    const vol = Math.max(0, Math.round(baseParams.estimatedMonthlyUnits * vF));
    const prc = Math.max(0, Math.round(baseParams.sellingPricePerUnit * pF));
    const vC = Math.max(0, Math.round(baseParams.variableCostPerUnit * varF));
    const fC = Math.max(0, Math.round(baseParams.monthlyFixedCost * fixF));

    const metrics = calculateFinancialMetrics({
      availableCapital: baseParams.availableCapital,
      initialSetupCost: baseParams.initialSetupCost,
      monthlyFixedCost: fC,
      sellingPricePerUnit: prc,
      variableCostPerUnit: vC,
      estimatedMonthlyUnits: vol,
    });

    return {
      scenarioName: name,
      salesVolume: vol,
      sellingPrice: prc,
      variableCostPerUnit: vC,
      monthlyFixedCost: fC,
      revenue: metrics.totalMonthlyRevenue,
      totalCost: metrics.totalMonthlyCost,
      operatingProfit: metrics.monthlyOperatingProfit,
      profitMarginPercent: metrics.profitMarginPercent,
      bepUnits: metrics.bepUnits,
      assumptions,
    };
  };

  const conservative = buildScenario(
    "Konservatif",
    consVol,
    consPrice,
    consVar,
    consFix,
    [
      `Volume penjualan tertekan -${Math.round((1 - consVol) * 100)}% dari target awal.`,
      `Biaya bahan baku/variabel membengkak +${Math.round((consVar - 1) * 100)}% akibat fluktuasi pasokan.`,
      `Biaya tetap bertambah +${Math.round((consFix - 1) * 100)}% untuk biaya tak terduga.`,
      "Menguji apakah usaha masih sanggup bertahan tanpa suntikan modal darurat.",
    ]
  );

  const moderate = buildScenario(
    "Moderat",
    modVol,
    modPrice,
    modVar,
    modFix,
    [
      "Volume penjualan dan harga sesuai target estimasi awal.",
      "Biaya variabel dan biaya tetap berjalan sesuai anggaran rencana awal.",
      "Asumsi stabilitas pasokan dan tingkat konversi pemasaran normal.",
    ]
  );

  const optimistic = buildScenario(
    "Optimistis",
    optVol,
    optPrice,
    optVar,
    optFix,
    [
      `Penjualan melampaui ekspektasi +${Math.round((optVol - 1) * 100)}% dari penerimaan pasar awal.`,
      `Efisiensi pembelian bahan/skala ekonomis menghemat -${Math.round((1 - optVar) * 100)}% biaya per unit.`,
      "Kapasitas operasional mampu menangani lonjakan permintaan tanpa pembengkakan biaya tetap.",
    ]
  );

  return [conservative, moderate, optimistic];
}
