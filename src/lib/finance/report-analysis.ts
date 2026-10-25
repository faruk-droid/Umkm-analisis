import { FinancialReportSummary } from "@/types";

const METRICS = {
  revenue: /\btotal\s+pendapatan\b/i,
  costOfGoodsSold: /\btotal\s+(?:harga\s+pokok\s+penjualan|hpp)\b/i,
  grossProfit: /\btotal\s+laba\s+kotor\b/i,
  operatingExpenses: /\btotal\s+beban\s+operasional\b|\btotal\s+biaya\s+operasional\b/i,
  netProfit: /\blaba\s+bersih\b/i,
  operatingCashFlow: /\bkas\s+bersih\s+dari\s+kegiatan\s+operasional\b/i,
  investingCashFlow: /\bkas\s+bersih\s+dari\s+kegiatan\s+investasi\b/i,
  financingCashFlow: /\bkas\s+bersih\s+dari\s+kegiatan\s+pembiayaan\b/i,
  endingCash: /\btotal\s+kas\s+bersih\s*\(\s*saldo\s+kas\s+akhir\s*\)|\bsaldo\s+kas\s+akhir\b/i,
  totalAssets: /\btotal\s+aset\s+keseluruhan\b/i,
  totalLiabilities: /\btotal\s+liabilitas\b(?!\s+dan\s+ekuitas)/i,
  totalEquity: /\btotal\s+ekuitas\b/i,
} satisfies Record<string, RegExp>;

const ALL_LABELS = Object.values(METRICS);

function normalizeReportText(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseAmount(value: string) {
  let normalized = value.replace(/rp\.?/gi, "").replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  if (!normalized || !/\d/.test(normalized)) return null;

  const lastDot = normalized.lastIndexOf(".");
  const lastComma = normalized.lastIndexOf(",");
  const lastSeparator = Math.max(lastDot, lastComma);
  if (lastSeparator >= 0) {
    const trailingDigits = normalized.length - lastSeparator - 1;
    const separatorCount = (normalized.match(/[.,]/g) || []).length;
    if (separatorCount > 1 || trailingDigits === 3) {
      normalized = normalized.replace(/[.,]/g, "");
    } else {
      normalized =
        normalized.slice(0, lastSeparator).replace(/[.,]/g, "") +
        "." +
        normalized.slice(lastSeparator + 1);
    }
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function amountsOnText(text: string) {
  const matches = Array.from(text.matchAll(/-?\s*(?:Rp\.?\s*)?\d[\d.,]*/gi));
  const amounts: number[] = [];
  for (const match of matches) {
    const amount = parseAmount(match[0]);
    if (amount !== null) amounts.push(amount);
  }
  return amounts;
}

function findAmountAfterLabel(text: string, label: RegExp) {
  const otherLabelMatches = ALL_LABELS.flatMap((otherLabel) => {
    const globalPattern = new RegExp(otherLabel.source, `${otherLabel.flags}g`);
    return Array.from(text.matchAll(globalPattern), (match) => ({
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    }));
  }).sort((left, right) => left.start - right.start);

  const globalPattern = new RegExp(label.source, `${label.flags}g`);
  for (const match of Array.from(text.matchAll(globalPattern))) {
    const valueStart = (match.index ?? 0) + match[0].length;
    const nextLabel = otherLabelMatches.find((other) => other.start >= valueStart);
    const valueEnd = nextLabel?.start ?? text.length;
    const amounts = amountsOnText(text.slice(valueStart, valueEnd));
    if (amounts.length) return amounts[amounts.length - 1];
  }
  return null;
}

function findLabeledAmount(lines: string[], label: RegExp) {
  for (const line of lines) {
    if (!line.includes("|")) continue;
    const amount = findAmountAfterLabel(line, label);
    if (amount !== null) return amount;
  }

  for (let start = 0; start < lines.length; start += 1) {
    for (let end = start; end < Math.min(lines.length, start + 4); end += 1) {
      if (lines.slice(start, end + 1).some((line) => line.includes("|"))) break;
      const text = lines.slice(start, end + 1).join(" ");
      const amount = findAmountAfterLabel(text, label);
      if (amount !== null) return amount;
    }
  }
  return null;
}

function checkDifference(
  checks: string[],
  description: string,
  expected: number | null,
  actual: number | null
) {
  if (expected === null || actual === null) return;
  if (Math.abs(expected - actual) > 1) {
    checks.push(`${description} berbeda Rp ${Math.abs(expected - actual).toLocaleString("id-ID")}.`);
  }
}

export function analyzeFinancialReport(text: string): FinancialReportSummary {
  const normalizedLines = text.split(/\r?\n/).map(normalizeReportText).filter(Boolean);
  const normalizedText = normalizeReportText(text);
  const values = Object.fromEntries(
    Object.entries(METRICS).map(([key, label]) => [key, findLabeledAmount(normalizedLines, label)])
  ) as Omit<FinancialReportSummary, "period" | "netProfitMarginPercent" | "consistencyChecks">;
  const checks: string[] = [];

  checkDifference(
    checks,
    "Laba kotor (pendapatan dikurangi HPP) dan angka laporan",
    values.revenue !== null && values.costOfGoodsSold !== null
      ? values.revenue - values.costOfGoodsSold
      : null,
    values.grossProfit
  );
  checkDifference(
    checks,
    "Laba bersih (laba kotor dikurangi beban operasional) dan angka laporan",
    values.grossProfit !== null && values.operatingExpenses !== null
      ? values.grossProfit - values.operatingExpenses
      : null,
    values.netProfit
  );
  checkDifference(
    checks,
    "Aset dan jumlah liabilitas ditambah ekuitas",
    values.totalLiabilities !== null && values.totalEquity !== null
      ? values.totalLiabilities + values.totalEquity
      : null,
    values.totalAssets
  );
  checkDifference(
    checks,
    "Saldo kas akhir dan arus kas operasi, investasi, serta pembiayaan",
    values.operatingCashFlow !== null &&
      values.investingCashFlow !== null &&
      values.financingCashFlow !== null
      ? values.operatingCashFlow + values.investingCashFlow + values.financingCashFlow
      : null,
    values.endingCash
  );

  const hasDetectedValues = Object.values(values).some((value) => value !== null);
  if (!hasDetectedValues) {
    checks.push(
      "Tidak ada angka ringkasan yang cocok dengan label laporan. PDF mungkin berupa hasil scan atau tata letak teksnya tidak terbaca; periksa PDF atau unggah CSV/XLSX."
    );
  } else if (checks.length === 0) {
    checks.push("Angka yang berhasil diekstrak konsisten pada pemeriksaan aritmetika dasar.");
  }

  const periodMatch = normalizedText.match(
    /(?:tanggal awal kegiatan\s+s\.d\.\s*\d{1,2}\s+[a-z]+\s+(?:19|20)\d{2}|\d{1,2}\s+[a-z]+\s+(?:19|20)\d{2}\s+s\.d\.\s*\d{1,2}\s+[a-z]+\s+(?:19|20)\d{2})/i
  );

  return {
    ...values,
    period: periodMatch?.[0]?.trim() || null,
    netProfitMarginPercent:
      values.netProfit !== null && values.revenue
        ? Number(((values.netProfit / values.revenue) * 100).toFixed(2))
        : null,
    consistencyChecks: checks,
  };
}
