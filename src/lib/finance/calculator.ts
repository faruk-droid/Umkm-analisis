import { FinancialMetrics } from "@/types";

export interface CalculateFinancialParams {
  availableCapital: number;
  initialSetupCost: number;
  monthlyFixedCost: number;
  sellingPricePerUnit: number;
  variableCostPerUnit: number;
  estimatedMonthlyUnits: number;
}

/**
 * Kalkulator Finansial Deterministik UMKM
 * Menghitung parameter unit ekonomi bisnis dengan penanganan error, validasi input,
 * dan perlindungan dari pembagian dengan nol (division by zero).
 */
export function calculateFinancialMetrics(params: CalculateFinancialParams): FinancialMetrics {
  const capital = Math.max(0, Number(params.availableCapital) || 0);
  const initialCost = Math.max(0, Number(params.initialSetupCost) || 0);
  const fixedCost = Math.max(0, Number(params.monthlyFixedCost) || 0);
  const price = Math.max(0, Number(params.sellingPricePerUnit) || 0);
  const variableCost = Math.max(0, Number(params.variableCostPerUnit) || 0);
  const units = Math.max(0, Number(params.estimatedMonthlyUnits) || 0);

  // 1. Pendapatan
  const monthlyRevenue = price * units;

  // 2. Biaya Variabel & Total Biaya Bulanan
  const monthlyVariableCost = variableCost * units;
  const totalMonthlyCost = fixedCost + monthlyVariableCost;

  // 3. Laba / Rugi Operasional Sederhana
  const monthlyOperatingProfit = monthlyRevenue - totalMonthlyCost;

  // 4. Margin Laba (%)
  let profitMarginPercent = 0;
  if (monthlyRevenue > 0) {
    profitMarginPercent = (monthlyOperatingProfit / monthlyRevenue) * 100;
  } else if (totalMonthlyCost > 0) {
    profitMarginPercent = -100;
  }

  // 5. Margin Kontribusi per Unit
  const unitContributionMargin = price - variableCost;

  // 6. Rasio Margin Kontribusi (%)
  const contributionMarginRatio = price > 0 ? (unitContributionMargin / price) * 100 : 0;

  // 7. Perhitungan Break-Even Point (BEP)
  let bepUnits: number | null = null;
  let bepRevenue: number | null = null;

  if (unitContributionMargin > 0) {
    bepUnits = Math.ceil(fixedCost / unitContributionMargin);
    bepRevenue = bepUnits * price;
  } else {
    // Kontribusi per unit <= 0 artinya setiap barang yang dijual justru merugi atau impas sebelum biaya tetap
    bepUnits = null;
    bepRevenue = null;
  }

  // 8. Evaluasi Kecukupan Modal & Runway
  const netCapitalAfterInitial = capital - initialCost;
  let capitalRunwayMonths: number | null = null;
  let capitalAdequacyStatus: FinancialMetrics["capitalAdequacyStatus"] = "Belum Cukup Data";

  if (capital === 0 && initialCost === 0 && fixedCost === 0) {
    capitalAdequacyStatus = "Belum Cukup Data";
  } else if (netCapitalAfterInitial < 0) {
    capitalAdequacyStatus = "Kurang";
    capitalRunwayMonths = 0;
  } else {
    // Jika bisnis menghasilkan laba operasional positif
    if (monthlyOperatingProfit >= 0) {
      capitalAdequacyStatus = "Mencukupi";
      capitalRunwayMonths = null; // Tidak mengalami arus defisit bulanan
    } else {
      // Bisnis mengalami defisit bulanan (burn rate)
      const monthlyBurnRate = Math.abs(monthlyOperatingProfit);
      if (monthlyBurnRate > 0) {
        capitalRunwayMonths = Number((netCapitalAfterInitial / monthlyBurnRate).toFixed(1));
        if (capitalRunwayMonths >= 6) {
          capitalAdequacyStatus = "Mencukupi";
        } else if (capitalRunwayMonths >= 3) {
          capitalAdequacyStatus = "Rentan";
        } else {
          capitalAdequacyStatus = "Kurang";
        }
      }
    }
  }

  // Penjelasan Terbuka & Keterbatasan
  const explanation: string[] = [];
  const limitations: string[] = [];

  explanation.push(
    `Pendapatan bulanan diestimasi sebesar Rp ${monthlyRevenue.toLocaleString("id-ID")} didasarkan pada target penjualan ${units} unit dengan harga Rp ${price.toLocaleString("id-ID")}/unit.`
  );

  if (unitContributionMargin <= 0) {
    explanation.push(
      `PERINGATAN KRITIS: Margin kontribusi per unit bernilai Rp ${unitContributionMargin.toLocaleString("id-ID")} (kurang dari atau sama dengan nol). Usaha merugi pada setiap penjualan produk sebelum memperhitungkan biaya tetap.`
    );
  } else {
    explanation.push(
      `Margin kontribusi adalah Rp ${unitContributionMargin.toLocaleString("id-ID")}/unit (${contributionMarginRatio.toFixed(1)}% dari harga jual). Diperlukan penjualan minimal ${bepUnits} unit/bulan (omset Rp ${(bepRevenue || 0).toLocaleString("id-ID")}) untuk menutup biaya tetap.`
    );
  }

  if (monthlyOperatingProfit > 0) {
    explanation.push(
      `Laba operasional bulanan diestimasi Rp ${monthlyOperatingProfit.toLocaleString("id-ID")} (Margin Laba ${profitMarginPercent.toFixed(1)}%).`
    );
  } else if (monthlyOperatingProfit < 0) {
    explanation.push(
      `Proyeksi operasional saat ini mengalami defisit sebesar Rp ${Math.abs(monthlyOperatingProfit).toLocaleString("id-ID")}/bulan.`
    );
  } else {
    explanation.push("Operasional berada tepat pada titik impas (laba Rp 0).");
  }

  // Keterbatasan Analisis (Transparansi Finansial)
  limitations.push("Perhitungan di atas adalah laba operasional sederhana, bukan arus kas riil.");
  limitations.push("Belum memperhitungkan piutang tak tertagih, pembayaran tempo supplier, pajak penghasilan usaha, dan amortisasi peralatan.");
  limitations.push("Asumsi menganggap seluruh unit yang diproduksi habis terjual tanpa sisa stok rusak/kedaluwarsa (waste/spoilage).");

  return {
    totalInitialCost: initialCost,
    totalMonthlyRevenue: monthlyRevenue,
    totalMonthlyFixedCost: fixedCost,
    totalMonthlyVariableCost: monthlyVariableCost,
    totalMonthlyCost,
    monthlyOperatingProfit,
    profitMarginPercent: Number(profitMarginPercent.toFixed(2)),
    unitContributionMargin,
    contributionMarginRatio: Number(contributionMarginRatio.toFixed(2)),
    bepUnits,
    bepRevenue,
    isProfitable: monthlyOperatingProfit > 0,
    capitalRunwayMonths,
    capitalAdequacyStatus,
    explanation,
    limitations,
  };
}

/**
 * Simulasi Sensitivitas (Perubahan Harga, Biaya, atau Volume)
 */
export function simulateSensitivity(
  base: CalculateFinancialParams,
  deltaPercent: { price?: number; variableCost?: number; fixedCost?: number; volume?: number }
): FinancialMetrics {
  const factor = (pct: number = 0) => 1 + pct / 100;

  return calculateFinancialMetrics({
    availableCapital: base.availableCapital,
    initialSetupCost: base.initialSetupCost,
    sellingPricePerUnit: Math.round(base.sellingPricePerUnit * factor(deltaPercent.price)),
    variableCostPerUnit: Math.round(base.variableCostPerUnit * factor(deltaPercent.variableCost)),
    monthlyFixedCost: Math.round(base.monthlyFixedCost * factor(deltaPercent.fixedCost)),
    estimatedMonthlyUnits: Math.round(base.estimatedMonthlyUnits * factor(deltaPercent.volume)),
  });
}
