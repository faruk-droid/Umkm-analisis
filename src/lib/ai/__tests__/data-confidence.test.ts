import { describe, expect, it } from "vitest";
import { SAMPLE_GROWTH_DATA, SAMPLE_PLANNER_DATA } from "../../sample-data";
import { calculateDataConfidence } from "../service";

describe("Data confidence with optional financial report", () => {
  it("reduces the Growth confidence score and lists the missing report", () => {
    const confidence = calculateDataConfidence(SAMPLE_GROWTH_DATA, "missing");

    expect(confidence.scorePercent).toBe(85);
    expect(confidence.level).toBe("Tinggi");
    expect(confidence.missingCriticalData).toContain(
      "Laporan keuangan historis belum dilampirkan; analisis hanya menggunakan input formulir."
    );
    expect(confidence.explanation).toContain("belum dilampirkan");
  });

  it("does not apply the missing-report penalty when a report is present", () => {
    const withReport = calculateDataConfidence(SAMPLE_GROWTH_DATA, "provided");
    const defaultScore = calculateDataConfidence(SAMPLE_GROWTH_DATA);

    expect(withReport.scorePercent).toBe(defaultScore.scorePercent);
    expect(withReport.missingCriticalData).not.toContain(
      "Laporan keuangan historis belum dilampirkan; analisis hanya menggunakan input formulir."
    );
  });

  it("does not require historical reports for the Planner flow", () => {
    const confidence = calculateDataConfidence(SAMPLE_PLANNER_DATA, "missing");

    expect(confidence.missingCriticalData).not.toContain(
      "Laporan keuangan historis belum dilampirkan; analisis hanya menggunakan input formulir."
    );
  });
});
