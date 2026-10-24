import { RiskItem, FinancialMetrics, PlannerFormData, GrowthFormData } from "@/types";

export function assessBusinessRisks(
  formData: PlannerFormData | GrowthFormData,
  financials: FinancialMetrics,
  isGrowth: boolean = false
): RiskItem[] {
  const risks: RiskItem[] = [];

  // 1. Risiko Modal & Arus Kas
  if (financials.capitalAdequacyStatus === "Kurang") {
    risks.push({
      id: "risk-capital-insufficient",
      category: "Modal & Arus Kas",
      title: "Risiko Likuiditas: Modal Awal Tidak Mencukupi",
      description:
        "Modal tunai yang tersedia saat ini lebih kecil daripada kebutuhan setup awal atau proyeksi defisit operasional.",
      assessmentBasis:
        financials.capitalRunwayMonths !== null && financials.capitalRunwayMonths <= 1
          ? `Runway modal diperkirakan habis dalam kurun waktu kurang dari ${financials.capitalRunwayMonths} bulan berdasarkan proyeksi operasional saat ini.`
          : "Total modal yang dimasukkan tidak menutup biaya awal dan cadangan darurat dasar.",
      potentialImpact: "Terhentinya kegiatan operasional usaha secara mendadak sebelum mencapai titik impas (BEP).",
      severity: "Kritis",
      mitigationSteps: [
        "Pangkas biaya investasi awal non-esensial (misalnya sewa tempat tahunan diganti sewa bulanan atau sistem online/dari rumah).",
        "Gunakan model pre-order (PO) untuk membiayai bahan baku langsung dari uang muka pelanggan.",
        "Tunda peluncuran skala penuh hingga tersedia dana cadangan operasional minimal 3-6 bulan.",
      ],
      requiredAdditionalData: "Rincian detil pos pengeluaran modal awal untuk menemukan pos yang bisa dipangkas.",
    });
  } else if (financials.capitalAdequacyStatus === "Rentan") {
    risks.push({
      id: "risk-capital-tight",
      category: "Modal & Arus Kas",
      title: "Bantalan Modal Tipis (Runway Terbatas)",
      description:
        "Modal operasional cadangan hanya cukup untuk menopang bisnis dalam kurun waktu 3 hingga 5 bulan.",
      assessmentBasis: `Runway modal berada di angka ~${financials.capitalRunwayMonths} bulan dengan asumsi target omset awal meleset.`,
      potentialImpact: "Tekanan psikologis dan risiko insolvensi jika adopsi pasar berjalan lebih lambat dari perkiraan.",
      severity: "Tinggi",
      mitigationSteps: [
        "Tetapkan ambang batas evaluasi (checkpoint) bulanan yang ketat.",
        "Jangan terburu-buru merekrut tenaga kerja tetap atau mengikat kontrak sewa jangka panjang.",
      ],
    });
  }

  // 2. Risiko Kontribusi Unit & Struktur Biaya
  if (financials.unitContributionMargin <= 0) {
    risks.push({
      id: "risk-negative-margin",
      category: "Operasional & Biaya",
      title: "Struktur Biaya Defisit (Kontribusi Negatif)",
      description: "Harga jual per unit lebih rendah daripada biaya variabel langsung untuk memproduksi unit tersebut.",
      assessmentBasis: `Harga jual (Rp ${("sellingPriceEstimate" in formData ? formData.sellingPriceEstimate : formData.sellingPrice).toLocaleString(
        "id-ID"
      )}) lebih rendah atau sama dengan biaya variabel (Rp ${("variableCostPerUnitEstimate" in formData ? formData.variableCostPerUnitEstimate : formData.productionCostPerUnit).toLocaleString("id-ID")}).`,
      potentialImpact: "Semakin banyak produk terjual, semakin besar kerugian tunai yang diderita usaha.",
      severity: "Kritis",
      mitigationSteps: [
        "Evaluasi ulang harga jual pasar dan naikkan harga ke batas yang sehat.",
        "Lakukan renegosiasi harga bahan mentah dengan pemasok grosir.",
        "Ubah kemasan atau ukuran porsi produk (rekayasa nilai) untuk menekan COGS.",
      ],
      requiredAdditionalData: "Struktur Bill of Materials (BOM) detail dari setiap unit produk.",
    });
  } else if (financials.profitMarginPercent > 0 && financials.profitMarginPercent < 12) {
    risks.push({
      id: "risk-thin-margin",
      category: "Operasional & Biaya",
      title: "Margin Laba Bersih Sangat Tipis (< 12%)",
      description: "Tingkat laba operasional sangat rentan tergerus oleh kenaikan harga bahan baku atau diskon promosi.",
      assessmentBasis: `Margin laba operasional hanya mencapai ${financials.profitMarginPercent}%. Standar ketahanan UMKM umumnya membutuhkan minimal 15-25% untuk mengantisipasi biaya tak terduga.`,
      potentialImpact: "Sedikit fluktuasi harga bahan mentah dapat langsung mendorong operasional menjadi merugi.",
      severity: "Sedang",
      mitigationSteps: [
        "Hindari perang harga; fokuskan pada diferensiasi mutu, rasa, atau kemasan eksklusif.",
        "Sediakan produk bundling dengan margin lebih tinggi.",
      ],
    });
  }

  // 3. Risiko Permintaan Pasar Belum Terbukti (Khusus Perencanaan Usaha)
  if (!isGrowth) {
    const planner = formData as PlannerFormData;
    if (planner.businessModel === "toko_fisik") {
      risks.push({
        id: "risk-capex-physical-store",
        category: "Permintaan Pasar",
        title: "Komitmen Biaya Tetap Tinggi (Toko Fisik Tanpa Bukti Validasi)",
        description:
          "Membuka outlet fisik sebelum produk tervalidasi di pasar membawa beban sewa dan renovasi yang tidak dapat ditarik kembali (sunk cost).",
        assessmentBasis: "Model bisnis toko fisik dipilih langsung pada tahap perencanaan awal.",
        potentialImpact: "Kehilangan modal investasi tempat apabila lokasi terbukti sepi pengunjung atau salah target segmen.",
        severity: "Tinggi",
        mitigationSteps: [
          "Lakukan tes pasar mikro selama 2-4 minggu menggunakan booth pop-up, bazar akhir pekan, atau sistem delivery online sebelum menandatangani kontrak sewa tahunan.",
          "Survei langsung kepadatan lalu lintas pejalan kaki (foot traffic) di titik lokasi pada jam operasional target.",
        ],
        requiredAdditionalData: "Data traffic riil lokasi dan testimoni dari pembeli awal.",
      });
    }
  }

  // 4. Risiko Ketergantungan Produk (Khusus Bisnis Berjalan)
  if (isGrowth) {
    const growth = formData as GrowthFormData;
    if (growth.topSellingProduct && !growth.lowSellingProduct) {
      risks.push({
        id: "risk-product-concentration",
        category: "Ketergantungan",
        title: "Ketergantungan Konsentrasi Portofolio",
        description: "Arus kas usaha sangat bertumpu pada satu produk unggulan tanpa diversifikasi yang seimbang.",
        assessmentBasis: `Produk terlaris teridentifikasi: '${growth.topSellingProduct}', namun variasi produk pendukung belum terdistribusi dengan baik.`,
        potentialImpact: "Jika tren produk utama mereda atau muncul kompetitor langsung, pendapatan dapat anjlok tajam.",
        severity: "Sedang",
        mitigationSteps: [
          "Kembangkan varian baru atau produk pelengkap (cross-selling).",
          "Kumpulkan feedback pelanggan mengenai alasan mengapa produk varian lain kurang diminati.",
        ],
      });
    }
  }

  // 5. Risiko Kualitas & Kelengkapan Data
  const unknownCount = formData.unknownFields?.length || 0;
  if (unknownCount >= 3) {
    risks.push({
      id: "risk-data-uncertainty",
      category: "Kualitas Data",
      title: "Tingkat Ketidakpastian Analisis Tinggi",
      description: "Banyak parameter finansial dan pasar utama yang diisi dengan asumsi 'Belum Tahu'.",
      assessmentBasis: `Terdapat ${unknownCount} kolom pertanyaan penting yang belum dilengkapi pengguna.`,
      potentialImpact: "Hasil proyeksi BEP dan laba memiliki deviasi tinggi dari realitas lapangan.",
      severity: "Tinggi",
      mitigationSteps: [
        "Lakukan riset lapangan mandiri mengenai harga sewa rata-rata dan harga pokok bahan baku.",
        "Perbarui data formulir setelah mendapatkan estimasi harga dari 2-3 supplier pembanding.",
      ],
      requiredAdditionalData: "Data biaya tetap bulanan dan konfirmasi biaya variabel dari supplier.",
    });
  }

  return risks;
}
