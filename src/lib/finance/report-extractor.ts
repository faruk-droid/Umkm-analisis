import { parse } from "csv-parse/sync";
import ExcelJS from "exceljs";
import { PDFParse } from "pdf-parse";

const MAX_REPORT_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_EXTRACTED_CHARACTERS = 12_000;
const MAX_PDF_PAGES = 20;
const MAX_SPREADSHEET_ROWS = 200;

type UploadedReport = Pick<File, "name" | "size" | "arrayBuffer">;

function limitExtractedText(text: string) {
  const normalized = text.replace(/\u0000/g, "").trim();
  if (!normalized) {
    throw new Error("Tidak ada teks yang dapat dibaca. Pastikan PDF bukan hasil scan gambar.");
  }

  return normalized.length > MAX_EXTRACTED_CHARACTERS
    ? `${normalized.slice(0, MAX_EXTRACTED_CHARACTERS)}\n[Isi laporan dipotong agar analisis tetap fokus.]`
    : normalized;
}

async function extractPdfText(bytes: Uint8Array) {
  if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-") {
    throw new Error("File tidak memiliki format PDF yang valid.");
  }

  const parser = new PDFParse({ data: bytes });
  try {
    const info = await parser.getInfo();
    if (!info.total) {
      throw new Error("PDF tidak memiliki halaman yang dapat dibaca.");
    }

    const pagesToRead = Math.min(info.total, MAX_PDF_PAGES);
    const result = await parser.getText({
      partial: Array.from({ length: pagesToRead }, (_, index) => index + 1),
    });
    const pageLimitNotice = info.total > MAX_PDF_PAGES
      ? `\n[Hanya ${MAX_PDF_PAGES} halaman pertama dari ${info.total} halaman yang dianalisis.]`
      : "";

    return limitExtractedText(`${result.text}${pageLimitNotice}`);
  } finally {
    await parser.destroy();
  }
}

async function extractSpreadsheetText(bytes: Uint8Array) {
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    throw new Error("File XLSX tidak valid. Simpan ulang laporan sebagai .xlsx.");
  }

  const workbook = new ExcelJS.Workbook();
  const spreadsheetBuffer = Buffer.from(bytes) as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(spreadsheetBuffer);
  const lines: string[] = [];

  for (const worksheet of workbook.worksheets.slice(0, 5)) {
    lines.push(`[Sheet: ${worksheet.name}]`);
    const rowLimit = Math.min(worksheet.rowCount, MAX_SPREADSHEET_ROWS);

    for (let rowNumber = 1; rowNumber <= rowLimit; rowNumber += 1) {
      const values: string[] = [];
      worksheet.getRow(rowNumber).eachCell({ includeEmpty: false }, (cell) => {
        if (cell.text.trim()) values.push(cell.text.trim());
      });
      if (values.length) lines.push(values.join(" | "));
    }
  }

  return limitExtractedText(lines.join("\n"));
}

function extractCsvText(bytes: Uint8Array) {
  const rows = parse(bytes, {
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    to: MAX_SPREADSHEET_ROWS,
  }) as string[][];

  return limitExtractedText(rows.map((row) => row.join(" | ")).join("\n"));
}

export async function extractFinancialReport(file: UploadedReport) {
  if (file.size === 0) {
    throw new Error("File laporan kosong.");
  }
  if (file.size > MAX_REPORT_SIZE_BYTES) {
    throw new Error("Ukuran laporan maksimal 4 MB.");
  }

  const extension = file.name.toLowerCase().split(".").pop();
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (extension === "pdf") return extractPdfText(bytes);
  if (extension === "xlsx") return extractSpreadsheetText(bytes);
  if (extension === "csv") return extractCsvText(bytes);

  throw new Error("Format laporan tidak didukung. Gunakan PDF, XLSX, atau CSV.");
}