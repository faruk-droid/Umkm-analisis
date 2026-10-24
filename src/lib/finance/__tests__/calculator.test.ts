import { describe, it, expect } from "vitest";
import { calculateFinancialMetrics, simulateSensitivity } from "../calculator";
import { generateScenarios } from "../scenario-engine";
import { assessBusinessRisks } from "../risk-engine";
import { PlannerFormData } from "@/types";

describe("Deterministic Financial Calculator", () => {
  it("harus menghitung pendapatan, biaya, laba, dan BEP secara akurat", () => {
    const result = calculateFinancialMetrics({
      availableCapital: 20_000_000,
      initialSetupCost: 5_000_000,
      monthlyFixedCost: 3_000_000,
      sellingPricePerUnit: 25_000,
      variableCostPerUnit: 15_000,
      estimatedMonthlyUnits: 500,
    });

    // Pendapatan = 25.000 * 500 = 12.500.000
    expect(result.totalMonthlyRevenue).toBe(12_500_000);

    // Biaya Variabel = 15.000 * 500 = 7.500.000
    expect(result.totalMonthlyVariableCost).toBe(7_500_000);

    // Total Biaya = 3.000.000 + 7.500.000 = 10.500.000
    expect(result.totalMonthlyCost).toBe(10_500_000);

    // Laba Operasional = 12.500.000 - 10.500.000 = 2.000.000
    expect(result.monthlyOperatingProfit).toBe(2_000_000);

    // Margin Laba = (2.000.000 / 12.500.000) * 100 = 16%
    expect(result.profitMarginPercent).toBe(16);

    // Kontribusi per unit = 25.000 - 15.000 = 10.000
    expect(result.unitContributionMargin).toBe(10_000);

    // BEP Unit = 3.000.000 / 10.000 = 300 unit
    expect(result.bepUnits).toBe(300);

    // BEP Revenue = 300 * 25.000 = 7.500.000
    expect(result.bepRevenue).toBe(7_500_000);

    expect(result.isProfitable).toBe(true);
    expect(result.capitalAdequacyStatus).toBe("Mencukupi");
  });

  it("harus aman dari pembagian dengan nol ketika pendapatan nol atau unit nol", () => {
    const result = calculateFinancialMetrics({
      availableCapital: 5_000_000,
      initialSetupCost: 0,
      monthlyFixedCost: 1_000_000,
      sellingPricePerUnit: 0,
      variableCostPerUnit: 0,
      estimatedMonthlyUnits: 0,
    });

    expect(result.totalMonthlyRevenue).toBe(0);
    expect(result.profitMarginPercent).toBe(-100);
    expect(result.unitContributionMargin).toBe(0);
    expect(result.bepUnits).toBeNull(); // Kontribusi 0 tidak boleh menghasilkan BEP terbagi nol
    expect(result.bepRevenue).toBeNull();
  });

  it("harus mendeteksi kontribusi negatif dan menandai BEP tidak dapat dicapai", () => {
    const result = calculateFinancialMetrics({
      availableCapital: 10_000_000,
      initialSetupCost: 2_000_000,
      monthlyFixedCost: 2_000_000,
      sellingPricePerUnit: 10_000,
      variableCostPerUnit: 12_000, // Biaya lebih besar dari harga jual!
      estimatedMonthlyUnits: 100,
    });

    expect(result.unitContributionMargin).toBe(-2000);
    expect(result.bepUnits).toBeNull(); // BEP tidak dapat dicapai
    expect(result.monthlyOperatingProfit).toBeLessThan(0);
  });

  it("harus menghitung runway modal ketika bisnis mengalami defisit operasional", () => {
    const result = calculateFinancialMetrics({
      availableCapital: 10_000_000,
      initialSetupCost: 4_000_000, // sisa modal = 6.000.000
      monthlyFixedCost: 3_000_000,
      sellingPricePerUnit: 10_000,
      variableCostPerUnit: 5_000,
      estimatedMonthlyUnits: 200, // Pendapatan 2.000.000, Biaya variabel 1.000.000. Total Biaya 4.000.000. Rugi: -2.000.000/bln
    });

    expect(result.monthlyOperatingProfit).toBe(-2_000_000);
    // Runway: 6.000.000 / 2.000.000 = 3 bulan
    expect(result.capitalRunwayMonths).toBe(3);
    expect(result.capitalAdequacyStatus).toBe("Rentan");
  });

  it("harus menghasilkan 3 skenario yang logis dan konsisten", () => {
    const scenarios = generateScenarios({
      availableCapital: 15_000_000,
      initialSetupCost: 3_000_000,
      monthlyFixedCost: 2_500_000,
      sellingPricePerUnit: 20_000,
      variableCostPerUnit: 10_000,
      estimatedMonthlyUnits: 400,
    });

    expect(scenarios).toHaveLength(3);
    const [conservative, moderate, optimistic] = scenarios;

    expect(conservative.scenarioName).toBe("Konservatif");
    expect(moderate.scenarioName).toBe("Moderat");
    expect(optimistic.scenarioName).toBe("Optimistis");

    // Laba optimistis harus lebih tinggi dari moderat, dan moderat lebih tinggi dari konservatif
    expect(optimistic.operatingProfit).toBeGreaterThan(moderate.operatingProfit);
    expect(moderate.operatingProfit).toBeGreaterThan(conservative.operatingProfit);
  });

  it("harus mendeteksi risiko modal kritis dan margin negatif", () => {
    const mockFormData: PlannerFormData = {
      businessName: "Kopi Tes",
      category: "F&B",
      location: "Jakarta",
      businessModel: "toko_fisik",
      availableCapital: 2_000_000,
      targetMarket: "Mahasiswa",
      productDescription: "Kopi Susu",
      sellingPriceEstimate: 8_000,
      variableCostPerUnitEstimate: 10_000, // Defisit!
      estimatedInitialCost: 5_000_000, // Melebihi modal!
      monthlyFixedCostEstimate: 2_000_000,
      expectedMonthlySalesVolume: 100,
      previousExperience: "tidak_ada",
      unknownFields: ["supplier", "izin", "traffic"],
    };

    const metrics = calculateFinancialMetrics({
      availableCapital: mockFormData.availableCapital,
      initialSetupCost: mockFormData.estimatedInitialCost,
      monthlyFixedCost: mockFormData.monthlyFixedCostEstimate,
      sellingPricePerUnit: mockFormData.sellingPriceEstimate,
      variableCostPerUnit: mockFormData.variableCostPerUnitEstimate,
      estimatedMonthlyUnits: mockFormData.expectedMonthlySalesVolume,
    });

    const risks = assessBusinessRisks(mockFormData, metrics, false);

    expect(risks.some((r) => r.id === "risk-capital-insufficient")).toBe(true);
    expect(risks.some((r) => r.id === "risk-negative-margin")).toBe(true);
    expect(risks.some((r) => r.id === "risk-capex-physical-store")).toBe(true);
  });
});
