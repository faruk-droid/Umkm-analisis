import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { analyzeFinancialReport } from "../report-analysis";

describe("Uploaded financial report analysis", () => {
  it("extracts the provided EGGCIUM report figures and checks reconciliation", () => {
    const report = analyzeFinancialReport(`
      Periode Pelaporan: Tanggal awal kegiatan s.d. 30 Oktober 2026
      Total Pendapatan
      Rp 6.528.000
      Total Harga Pokok Penjualan (HPP)
      Rp 5.992.000
      Total Laba Kotor
      Rp 536.000
      Total Beban Operasional
      Rp 50.000
      Laba Bersih
      Rp 486.000
      Kas Bersih dari Kegiatan Operasional
      -Rp 5.518.654
      Kas Bersih dari Kegiatan Investasi
      -Rp 679.769
      Kas Bersih dari Kegiatan Pembiayaan
      Rp 8.050.000
      Total Kas Bersih (Saldo Kas Akhir)
      Rp 1.851.577
      Total Aset Keseluruhan
      Rp 8.536.000
      Total Liabilitas
      Rp 0
      Total Ekuitas
      Rp 8.536.000
    `);

    expect(report).toMatchObject({
      revenue: 6_528_000,
      costOfGoodsSold: 5_992_000,
      grossProfit: 536_000,
      operatingExpenses: 50_000,
      netProfit: 486_000,
      operatingCashFlow: -5_518_654,
      investingCashFlow: -679_769,
      financingCashFlow: 8_050_000,
      endingCash: 1_851_577,
      totalAssets: 8_536_000,
      totalLiabilities: 0,
      totalEquity: 8_536_000,
      netProfitMarginPercent: 7.44,
    });
    expect(report.consistencyChecks).toEqual([
      "Angka yang berhasil diekstrak konsisten pada pemeriksaan aritmetika dasar.",
    ]);
  });

  it("reports arithmetic mismatches instead of silently changing report figures", () => {
    const report = analyzeFinancialReport(`
      Total Pendapatan | Rp 100.000
      Total HPP | Rp 40.000
      Total Laba Kotor | Rp 70.000
    `);

    expect(report.consistencyChecks[0]).toContain("Laba kotor");
    expect(report.consistencyChecks[0]).toContain("Rp 10.000");
  });

  it("extracts figures when PDF text places multiple labeled totals on one line", () => {
    const report = analyzeFinancialReport(
      "Total Pendapatan Rp 6.528.000 Total HPP Rp 5.992.000 Total Laba Kotor Rp 536.000 Total Beban Operasional Rp 50.000 Laba Bersih Rp 486.000"
    );

    expect(report).toMatchObject({
      revenue: 6_528_000,
      costOfGoodsSold: 5_992_000,
      grossProfit: 536_000,
      operatingExpenses: 50_000,
      netProfit: 486_000,
    });
  });

  it("matches labels and periods split across PDF text fragments", () => {
    const report = analyzeFinancialReport(`
      Periode
      Pelaporan:
      Tanggal awal kegiatan s.d. 30 Oktober 2026
      Total
      Pendapatan
      Rp
      6.528.000
      Total Harga Pokok
      Penjualan (HPP)
      Rp 5.992.000
      Total Laba Kotor
      Rp 536.000
      Total Beban Operasional
      Rp 50.000
      Laba Bersih
      Rp 486.000
    `);

    expect(report).toMatchObject({
      period: "Tanggal awal kegiatan s.d. 30 Oktober 2026",
      revenue: 6_528_000,
      costOfGoodsSold: 5_992_000,
      grossProfit: 536_000,
      operatingExpenses: 50_000,
      netProfit: 486_000,
      netProfitMarginPercent: 7.44,
    });
  });

  it("does not report an empty extraction as arithmetically consistent", () => {
    const report = analyzeFinancialReport("Halaman laporan tidak memiliki teks keuangan yang dikenali.");

    expect(report.revenue).toBeNull();
    expect(report.period).toBeNull();
    expect(report.consistencyChecks[0]).toContain("Tidak ada angka ringkasan");
  });

  it("extracts report figures and period from the downloadable Eggcium CSV", () => {
    const csv = readFileSync("public/eggcium-financial-report.csv");
    const rows = parse(csv, { bom: true, skip_empty_lines: true, relax_column_count: true }) as string[][];
    const reportText = rows.map((row) => row.join(" | ")).join("\n");
    const report = analyzeFinancialReport(reportText);

    expect(report).toMatchObject({
      period: "Tanggal awal kegiatan s.d. 30 Oktober 2026",
      revenue: 6_528_000,
      costOfGoodsSold: 5_992_000,
      grossProfit: 536_000,
      operatingExpenses: 50_000,
      netProfit: 486_000,
      operatingCashFlow: -5_518_654,
      investingCashFlow: -679_769,
      financingCashFlow: 8_050_000,
      endingCash: 1_851_577,
      totalAssets: 8_536_000,
      totalLiabilities: 0,
      totalEquity: 8_536_000,
    });
  });
});
