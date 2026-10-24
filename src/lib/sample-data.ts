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
  businessName: "Keripik Singkong Balado Makmur (DEMO)",
  category: "Produk Olahan Makanan Ringan",
  location: "Sidoarjo, Jawa Timur",
  operatingDurationMonths: 18,
  initialCapital: 15_000_000,
  monthlyRevenue: 28_000_000,
  monthlyFixedCost: 6_500_000, // Sewa tempat produksi, gaji 2 karyawan lepas, listrik
  sellingPrice: 14_000,
  productionCostPerUnit: 8_000, // Singkong mentah, bumbu balado, minyak, kemasan standing pouch
  monthlyUnitsSold: 2000,
  topSellingProduct: "Keripik Singkong Balado Level Pedas Sedang 200g",
  lowSellingProduct: "Keripik Singkong Original Bawang 200g",
  currentBottlenecks:
    "Proses penggorengan masih manual sehingga kapasitas harian mentok di 100 bungkus; pesanan reseller sering tertunda.",
  growthTarget:
    "Membeli mesin spinner peniris minyak dan continuous band sealer untuk meningkatkan kapasitas produksi 2x lipat.",
  notes: "Ingin memastikan penambahan cicilan alat tidak mengganggu cashflow harian.",
  unknownFields: [],
};
