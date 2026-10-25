import { PlannerFormData, GrowthFormData } from "@/types";

export const SAMPLE_PLANNER_DATA: PlannerFormData = {
  businessName: "Kopi Seduh Nusantara (DEMO)",
  category: "Makanan & Minuman (F&B)",
  location: "Bandung, Jawa Barat (Dekat Kampus)",
  businessModel: "dari_rumah",
  availableCapital: 25_000_000,
  targetMarket: "Mahasiswa dan pekerja remote (freelancer)",
  productDescription: "Kopi susu gula aren botolan 250ml dan 1 liter siap minum",
  sellingPriceEstimate: 18_000,
  variableCostPerUnitEstimate: 9_500, // Bahan biji kopi, susu, kemasan botol
  estimatedInitialCost: 8_500_000, // Mesin espresso rumahan, grinder, sealer botol
  monthlyFixedCostEstimate: 2_500_000, // Listrik, kuota internet, promosi ads dasar
  expectedMonthlySalesVolume: 600, // ~20 botol per hari
  previousExperience: "kurang_dari_1_tahun",
  notes: "Fokus penjualan online delivery dan titip di kantin coworking space.",
  unknownFields: [],
};

export const SAMPLE_GROWTH_DATA: GrowthFormData = {
  businessName: "eggcium",
  category: "Pertanian / Perkebunan",
  location: "Surabaya Nginden",
  operatingDurationMonths: 6,
  initialCapital: 8_000_000,
  monthlyRevenue: 200_000,
  monthlyFixedCost: 0,
  sellingPrice: 20_000,
  productionCostPerUnit: 15_000,
  monthlyUnitsSold: 10,
  topSellingProduct: "pupuk 1kg",
  lowSellingProduct: "pakan 500gr",
  currentBottlenecks: "Konsumen belum percaya pada pupuk organik baru.",
  growthTarget: "Digital marketing.",
  notes:
    "Data formulir Eggcium. Laporan historis terlampir mencatat pendapatan Rp6.528.000, HPP Rp5.992.000, laba bersih Rp486.000, arus kas operasi -Rp5.518.654, saldo kas akhir Rp1.851.577, dan total aset Rp8.536.000. Angka laporan historis tidak menggantikan asumsi bulanan. Unggah CSV contoh laporan secara terpisah untuk rekonsiliasi otomatis.",
  unknownFields: [],
};
