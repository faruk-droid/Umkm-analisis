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

  const toggleUnknownField = (field: string) => {
    setFormData((prev) => {
      const exists = prev.unknownFields.includes(field);
      return {
        ...prev,
        unknownFields: exists
          ? prev.unknownFields.filter((f) => f !== field)
          : [...prev.unknownFields, field],
      };
    });
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Jalur Pelaku UMKM (Business Growth & Optimization)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Evaluasi Kinerja & Optimalisasi Usaha Berjalan
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Masukkan data keuangan operasional aktual untuk menemukan kebocoran margin dan potensi pertumbuhan.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseDemo}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold flex items-center gap-2 self-start transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Isi Data Demo (Keripik Singkong)</span>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mt-8 grid grid-cols-4 gap-2 border-b border-slate-200 pb-4">
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
              className={`text-left pb-2 text-xs font-semibold border-b-2 transition-colors ${
                step === s.num
                  ? "border-emerald-600 text-emerald-700"
                  : step > s.num
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* STEP 1: Profil & Durasi */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tahap 1: Profil Usaha & Durasi Operasional
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Nama Usaha Saat Ini <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Contoh: Dapur Bu Siti, Keripik Renyah Makmur, Konveksi Berkah"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Kategori Usaha
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Lokasi Usaha
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Surabaya, Jawa Timur"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Lama Usaha Sudah Berjalan (Bulan)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.operatingDurationMonths}
                  onChange={(e) => setFormData({ ...formData, operatingDurationMonths: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Estimasi Modal Awal yang Pernah Dikeluarkan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={formData.initialCapital}
                  onChange={(e) => setFormData({ ...formData, initialCapital: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Keuangan Aktual */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tahap 2: Angka Keuangan & Biaya Aktual Rata-Rata
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Total Biaya Tetap Operasional per Bulan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={formData.monthlyFixedCost}
                  onChange={(e) => setFormData({ ...formData, monthlyFixedCost: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Gaji pegawai tetap, sewa ruko/lapak, listrik, dan iuran bulanan.
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Rata-rata Penjualan per Bulan (Unit Terjual)
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={formData.monthlyUnitsSold}
                  onChange={(e) => setFormData({ ...formData, monthlyUnitsSold: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Harga Jual Produk Utama Rata-rata (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Biaya Pokok Produksi per Unit (COGS) (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.productionCostPerUnit}
                  onChange={(e) => setFormData({ ...formData, productionCostPerUnit: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Biaya bahan langsung + kemasan per 1 unit.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Produk, Kendala & Target Pertumbuhan */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tahap 3: Analisis Produk & Hambatan Operasional
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Produk Paling Laku / Paling Menguntungkan
              </label>
              <input
                type="text"
                value={formData.topSellingProduct}
                onChange={(e) => setFormData({ ...formData, topSellingProduct: e.target.value })}
                placeholder="Contoh: Keripik Balado Pedas 200g, Kopi Susu Creamy Literan"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Produk yang Penjualannya Rendah / Lambat Bergerak (Slow-moving)
              </label>
              <input
                type="text"
                value={formData.lowSellingProduct}
                onChange={(e) => setFormData({ ...formData, lowSellingProduct: e.target.value })}
                placeholder="Contoh: Varian rasa original bawang, merchandise kaos"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Kendala Terbesar Saat Ini
              </label>
              <textarea
                rows={2}
                value={formData.currentBottlenecks}
                onChange={(e) => setFormData({ ...formData, currentBottlenecks: e.target.value })}
                placeholder="Contoh: Kapasitas alat produksi terbatas, harga minyak goreng naik, kesulitan mencari tenaga kerja..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Target Pengembangan Usaha ke Depan
              </label>
              <textarea
                rows={2}
                value={formData.growthTarget}
                onChange={(e) => setFormData({ ...formData, growthTarget: e.target.value })}
                placeholder="Contoh: Ingin membeli mesin otomatis baru untuk menaikkan kapasitas 2x lipat dan masuk ke supermarket..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Review & Analisis */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tahap 4: Konfirmasi Data Kinerja Usaha
            </h2>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Nama Usaha:</span>
                <span className="font-bold text-slate-900">{formData.businessName || "(Belum diisi)"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Durasi Berjalan:</span>
                <span className="font-medium text-slate-800">{formData.operatingDurationMonths} bulan</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Estimasi Omset Bulanan:</span>
                <span className="font-semibold text-emerald-700">
                  Rp {(formData.sellingPrice * formData.monthlyUnitsSold).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Biaya Tetap Bulanan:</span>
                <span className="font-semibold text-slate-800">Rp {formData.monthlyFixedCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Margin Kontribusi Produk:</span>
                <span className="font-semibold text-emerald-700">
                  Rp {(formData.sellingPrice - formData.productionCostPerUnit).toLocaleString("id-ID")} / unit
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Evaluasi Kinerja & AI...</span>
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
