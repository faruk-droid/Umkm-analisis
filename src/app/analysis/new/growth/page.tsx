"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GrowthFormData } from "@/types";
import { SAMPLE_GROWTH_DATA } from "@/lib/sample-data";
import { StorageService } from "@/lib/storage";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  BarChart2,
  Info,
} from "lucide-react";

export default function NewGrowthAnalysisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<GrowthFormData>({
    businessName: "",
    category: "Makanan & Minuman (F&B)",
    location: "",
    operatingDurationMonths: 12,
    initialCapital: 10_000_000,
    monthlyRevenue: 15_000_000,
    monthlyFixedCost: 4_000_000,
    sellingPrice: 15_000,
    productionCostPerUnit: 8_500,
    monthlyUnitsSold: 1000,
    topSellingProduct: "",
    lowSellingProduct: "",
    currentBottlenecks: "",
    growthTarget: "",
    notes: "",
    unknownFields: [],
  });

  const handleUseDemo = () => {
    setFormData(SAMPLE_GROWTH_DATA);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      setErrorMsg("Harap masukkan nama usaha Anda.");
      setStep(1);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "growth",
          formData,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengevaluasi data usaha.");
      }

      const record = await res.json();
      await StorageService.saveAnalysis(record);
      router.push(`/analysis/${record.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kendala saat mengevaluasi usaha.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Flat Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#3498db] text-white text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Jalur Pelaku UMKM (Business Growth & Optimization)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2c3e50] uppercase tracking-wide">
              Evaluasi Kinerja & Optimalisasi Usaha Berjalan
            </h1>
            <p className="mt-0.5 text-xs text-[#7f8c8d]">
              Masukkan data keuangan operasional aktual untuk menemukan kebocoran margin dan potensi pertumbuhan.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseDemo}
            className="px-3.5 py-2 rounded bg-[#f39c12] hover:bg-[#e67e22] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-[#d35400] shadow-flat self-start transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Isi Data Demo (Keripik Singkong)</span>
          </button>
        </div>

        {/* Flat Step Progress Bar */}
        <div className="mt-6 grid grid-cols-4 gap-1.5">
          {[
            { num: 1, title: "1. Profil & Durasi" },
            { num: 2, title: "2. Keuangan Aktual" },
            { num: 3, title: "3. Produk & Hambatan" },
            { num: 4, title: "4. Review & Evaluasi" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`p-2 text-center text-xs font-bold uppercase tracking-wider transition-colors border-b-4 ${
                step === s.num
                  ? "bg-[#2c3e50] text-white border-[#3498db]"
                  : step > s.num
                  ? "bg-[#ecf0f1] text-[#27ae60] border-[#27ae60]"
                  : "bg-[#ecf0f1] text-[#95a5a6] border-slate-300 hover:bg-slate-200"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-white border-l-4 border-[#e74c3c] border-t border-r border-b border-slate-200 text-[#c0392b] text-xs font-bold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded border border-slate-200 p-6 sm:p-8 shadow-flat border-t-4 border-[#3498db]">
        {/* STEP 1: Profil & Durasi */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wide border-b-2 border-slate-100 pb-2">
              Tahap 1: Profil Usaha & Durasi Operasional
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Nama Usaha Saat Ini <span className="text-[#e74c3c]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Contoh: Dapur Bu Siti, Keripik Renyah Makmur, Konveksi Berkah"
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Kategori Usaha
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db] bg-white"
                >
                  <option value="Makanan & Minuman (F&B)">Makanan & Minuman (F&B)</option>
                  <option value="Produk Olahan Makanan Ringan">Produk Olahan Makanan Ringan</option>
                  <option value="Fashion & Konveksi">Fashion & Konveksi</option>
                  <option value="Kerajinan & Kriya">Kerajinan & Kriya</option>
                  <option value="Toko Kelontong / Retail">Toko Kelontong / Retail</option>
                  <option value="Jasa Servis / Reparasi">Jasa Servis / Reparasi</option>
                  <option value="Pertanian / Perkebunan">Pertanian / Perkebunan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Lokasi Usaha
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Surabaya, Jawa Timur"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Lama Usaha Sudah Berjalan (Bulan)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.operatingDurationMonths}
                  onChange={(e) => setFormData({ ...formData, operatingDurationMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Modal Awal yang Pernah Dikeluarkan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={formData.initialCapital}
                  onChange={(e) => setFormData({ ...formData, initialCapital: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Keuangan Aktual */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wide border-b-2 border-slate-100 pb-2">
              Tahap 2: Angka Keuangan & Biaya Rata-Rata Bulanan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Total Biaya Tetap per Bulan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={formData.monthlyFixedCost}
                  onChange={(e) => setFormData({ ...formData, monthlyFixedCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
                />
                <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                  Gaji tetap, sewa tempat, listrik bulanan.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Rata-rata Penjualan Bulanan (Unit)
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={formData.monthlyUnitsSold}
                  onChange={(e) => setFormData({ ...formData, monthlyUnitsSold: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Harga Jual Produk Rata-rata (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Biaya Pokok Produksi per Unit (COGS) (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.productionCostPerUnit}
                  onChange={(e) => setFormData({ ...formData, productionCostPerUnit: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
                />
                <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                  Bahan baku + kemasan per 1 unit.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Produk & Kendala */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wide border-b-2 border-slate-100 pb-2">
              Tahap 3: Analisis Portofolio Produk & Hambatan
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Produk Paling Laku / Paling Menguntungkan
              </label>
              <input
                type="text"
                value={formData.topSellingProduct}
                onChange={(e) => setFormData({ ...formData, topSellingProduct: e.target.value })}
                placeholder="Contoh: Keripik Balado Pedas 200g"
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Produk yang Penjualannya Rendah / Lambat Bergerak
              </label>
              <input
                type="text"
                value={formData.lowSellingProduct}
                onChange={(e) => setFormData({ ...formData, lowSellingProduct: e.target.value })}
                placeholder="Contoh: Keripik Singkong Original Bawang"
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Kendala Terbesar Saat Ini
              </label>
              <textarea
                rows={2}
                value={formData.currentBottlenecks}
                onChange={(e) => setFormData({ ...formData, currentBottlenecks: e.target.value })}
                placeholder="Contoh: Kapasitas alat produksi terbatas, harga minyak naik..."
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Target Pengembangan Usaha ke Depan
              </label>
              <textarea
                rows={2}
                value={formData.growthTarget}
                onChange={(e) => setFormData({ ...formData, growthTarget: e.target.value })}
                placeholder="Contoh: Membeli mesin continuous band sealer untuk menaikkan kapasitas 2x lipat..."
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#3498db]"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Review & Evaluasi */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wide border-b-2 border-slate-100 pb-2">
              Tahap 4: Konfirmasi Data Kinerja Usaha
            </h2>

            <div className="bg-[#f4f6f9] rounded p-4 border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[#7f8c8d]">Nama Usaha:</span>
                <span className="font-bold text-[#2c3e50]">{formData.businessName || "(Belum diisi)"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[#7f8c8d]">Durasi Berjalan:</span>
                <span className="font-bold text-[#2c3e50]">{formData.operatingDurationMonths} bulan</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[#7f8c8d]">Estimasi Omset Bulanan:</span>
                <span className="font-bold text-[#27ae60]">
                  Rp {(formData.sellingPrice * formData.monthlyUnitsSold).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[#7f8c8d]">Biaya Tetap Bulanan:</span>
                <span className="font-bold text-[#2c3e50]">Rp {formData.monthlyFixedCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7f8c8d]">Margin Kontribusi Produk:</span>
                <span className="font-bold text-[#3498db]">
                  Rp {(formData.sellingPrice - formData.productionCostPerUnit).toLocaleString("id-ID")} / unit
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded bg-[#95a5a6] hover:bg-[#7f8c8d] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-[#7f8c8d] shadow-flat transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 rounded bg-[#3498db] hover:bg-[#2980b9] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-[#20638f] shadow-flat transition-colors"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded bg-[#2c3e50] hover:bg-[#34495e] disabled:bg-slate-400 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 border-[#1a252f] shadow-flat transition-all"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Evaluasi Kinerja...</span>
                </>
              ) : (
                <>
                  <BarChart2 className="w-4 h-4" />
                  <span>Jalankan Evaluasi Pertumbuhan</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
