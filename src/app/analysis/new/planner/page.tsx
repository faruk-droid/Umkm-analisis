"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlannerFormData } from "@/types";
import { SAMPLE_PLANNER_DATA } from "@/lib/sample-data";
import { StorageService } from "@/lib/storage";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Calculator,
  Building,
  Info,
} from "lucide-react";

export default function NewPlannerAnalysisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<PlannerFormData>({
    businessName: "",
    category: "Makanan & Minuman (F&B)",
    location: "",
    businessModel: "dari_rumah",
    availableCapital: 10_000_000,
    targetMarket: "",
    productDescription: "",
    sellingPriceEstimate: 20_000,
    variableCostPerUnitEstimate: 12_000,
    estimatedInitialCost: 3_000_000,
    monthlyFixedCostEstimate: 1_500_000,
    expectedMonthlySalesVolume: 300,
    previousExperience: "tidak_ada",
    notes: "",
    unknownFields: [],
  });

  const handleUseDemo = () => {
    setFormData(SAMPLE_PLANNER_DATA);
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

  const isUnknown = (field: string) => formData.unknownFields.includes(field);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      setErrorMsg("Harap masukkan nama rencana bisnis.");
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
          serviceType: "planner",
          formData,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memproses analisis rencana usaha.");
      }

      const record = await res.json();
      await StorageService.saveAnalysis(record);
      router.push(`/analysis/${record.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kendala saat menghasilkan analisis.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <Building className="w-3.5 h-3.5" />
              <span>Jalur Calon Pengusaha (Business Planning)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Formulir Evaluasi Rencana Usaha Baru
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Masukkan estimasi awal Anda. Sistem kami akan menguji kelayakan dan titik impas secara objektif.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseDemo}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold flex items-center gap-2 self-start transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Isi Data Demo (Kopi Seduh)</span>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mt-8 grid grid-cols-4 gap-2 border-b border-slate-200 pb-4">
          {[
            { num: 1, title: "1. Profil & Model" },
            { num: 2, title: "2. Struktur Modal & Biaya" },
            { num: 3, title: "3. Pasar & Target" },
            { num: 4, title: "4. Review & Analisis" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`text-left pb-2 text-xs font-semibold border-b-2 transition-colors ${
                step === s.num
                  ? "border-brand-600 text-brand-700"
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

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* STEP 1: Profil & Model Bisnis */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tahap 1: Profil Dasar & Model Bisnis
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Nama Rencana Bisnis <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Contoh: Kopi Seduh Rumahan, Hijab Cantik, Bengkel Motor Cepat"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Makanan & Minuman (F&B)">Makanan & Minuman (F&B)</option>
                  <option value="Fashion & Pakaian">Fashion & Pakaian</option>
                  <option value="Jasa & Servis">Jasa & Servis</option>
                  <option value="Retail & Toko Kelontong">Retail & Toko Kelontong</option>
                  <option value="Kriya & Kerajinan Tangan">Kriya & Kerajinan Tangan</option>
                  <option value="Pertanian & Peternakan">Pertanian & Peternakan</option>
                  <option value="Digital & Kreatif">Digital & Kreatif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Rencana Lokasi Usaha
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Bandung Timur (Area Kos Mahasiswa)"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Model Usaha yang Diinginkan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "dari_rumah", title: "Dari Rumah / Dapur Pribadi", desc: "Biaya sewa Rp 0, risiko modal terendah." },
                  { id: "pre_order", title: "Sistem Prapesan (Pre-Order)", desc: "Produksi setelah uang muka pelanggan diterima." },
                  { id: "online", title: "Penjualan Daring (Marketplace/Medsos)", desc: "Fokus kanal digital dan pengiriman kurir." },
                  { id: "uji_pasar_terbatas", title: "Uji Pasar Terbatas (Booth/Bazar)", desc: "Tes minat 1-4 minggu sebelum komitmen tetap." },
                  { id: "toko_fisik", title: "Buka Toko / Ruko Fisik Mandiri", desc: "Biaya sewa tahunan & renovasi di awal (Capex tinggi)." },
                  { id: "belum_tahu", title: "Saya Belum Menentukan", desc: "Minta AI merekomendasikan berdasarkan modal." },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-3.5 rounded-xl border cursor-pointer text-left transition-all flex flex-col justify-between ${
                      formData.businessModel === item.id
                        ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900">{item.title}</span>
                      <input
                        type="radio"
                        name="businessModel"
                        value={item.id}
                        checked={formData.businessModel === item.id}
                        onChange={() => setFormData({ ...formData, businessModel: item.id as any })}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                    </div>
                    <span className="text-xs text-slate-500 mt-1">{item.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Struktur Modal & Biaya Finansial */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tahap 2: Struktur Modal & Estimasi Biaya
            </h2>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <span>
                <strong>Prinsip Deterministik:</strong> Kami memisahkan biaya satu kali di awal (Capex) dengan biaya tetap bulanan (Opex) dan biaya per unit produk agar perhitungan titik impas (BEP) akurat.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Modal Tunai yang Tersedia Saat Ini (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={formData.availableCapital}
                  onChange={(e) => setFormData({ ...formData, availableCapital: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Dana likuid yang siap dialokasikan untuk usaha.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-800">
                    Estimasi Belanja Awal / Alat (Rp)
                  </label>
                  <label className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnknown("initialCost")}
                      onChange={() => toggleUnknownField("initialCost")}
                      className="rounded text-brand-600"
                    />
                    <span>Belum tahu</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  disabled={isUnknown("initialCost")}
                  value={isUnknown("initialCost") ? 0 : formData.estimatedInitialCost}
                  onChange={(e) => setFormData({ ...formData, estimatedInitialCost: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Peralatan, renovasi awal, mesin (biaya 1x di muka).
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Rencana Harga Jual per Unit (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.sellingPriceEstimate}
                  onChange={(e) => setFormData({ ...formData, sellingPriceEstimate: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Estimasi Biaya Variabel per Unit (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.variableCostPerUnitEstimate}
                  onChange={(e) => setFormData({ ...formData, variableCostPerUnitEstimate: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Bahan baku + kemasan + ongkos langsung per 1 produk.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-800">
                    Biaya Tetap Operasional Bulanan (Rp)
                  </label>
                  <label className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnknown("fixedCost")}
                      onChange={() => toggleUnknownField("fixedCost")}
                      className="rounded text-brand-600"
                    />
                    <span>Belum tahu</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  disabled={isUnknown("fixedCost")}
                  value={isUnknown("fixedCost") ? 1000000 : formData.monthlyFixedCostEstimate}
                  onChange={(e) => setFormData({ ...formData, monthlyFixedCostEstimate: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Listrik, sewa per bulan, kuota internet, gaji dasar.
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Target Volume Penjualan Bulanan (Unit)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.expectedMonthlySalesVolume}
                  onChange={(e) => setFormData({ ...formData, expectedMonthlySalesVolume: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Target penjualan realistis (contoh: 300 unit = ~10 unit/hari).
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Pasar, Produk, & Pengalaman */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tahap 3: Target Pasar, Produk, & Pengalaman
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Deskripsi Produk atau Layanan yang Ditawarkan
              </label>
              <textarea
                rows={2}
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                placeholder="Jelaskan apa yang Anda jual, keunggulan rasa/kualitas, atau ukuran kemasannya..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Target Konsumen Utama
              </label>
              <input
                type="text"
                value={formData.targetMarket}
                onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                placeholder="Contoh: Karyawan kantor usia 22-35 tahun yang butuh sarapan cepat & sehat"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Pengalaman Bisnis Sebelumnya
              </label>
              <select
                value={formData.previousExperience}
                onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value as any })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="tidak_ada">Belum ada pengalaman wirausaha (Pertama kali)</option>
                <option value="kurang_dari_1_tahun">Pernah mencoba usaha kurang dari 1 tahun</option>
                <option value="1_sampai_3_tahun">Memiliki pengalaman usaha 1 hingga 3 tahun</option>
                <option value="lebih_dari_3_tahun">Berpengalaman lebih dari 3 tahun</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Catatan Tambahan atau Rencana Khusus (Opsional)
              </label>
              <textarea
                rows={2}
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Contoh: Rencana titip jual di 3 warung dekat rumah, promosi via WhatsApp Story..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Review & Analisis */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tahap 4: Konfirmasi & Siap Menganalisis
            </h2>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Nama Bisnis:</span>
                <span className="font-bold text-slate-900">{formData.businessName || "(Belum diisi)"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Kategori & Lokasi:</span>
                <span className="font-medium text-slate-800">{formData.category} • {formData.location || "Belum ditentukan"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Modal Tersedia:</span>
                <span className="font-semibold text-emerald-700">Rp {formData.availableCapital.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Estimasi Biaya Awal (Capex):</span>
                <span className="font-semibold text-slate-800">Rp {formData.estimatedInitialCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Margin Kontribusi Estimasi:</span>
                <span className="font-semibold text-brand-700">
                  Rp {(formData.sellingPriceEstimate - formData.variableCostPerUnitEstimate).toLocaleString("id-ID")} / unit
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Volume Bulanan:</span>
                <span className="font-medium text-slate-800">{formData.expectedMonthlySalesVolume} unit</span>
              </div>
            </div>

            {formData.unknownFields.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>Catatan Kelengkapan:</strong> Anda menandai {formData.unknownFields.length} data dengan &quot;Belum Tahu&quot;. Analisis akan menyertakan batas ketidakpastian dan rekomendasi riset mandiri.
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Perhitungan Finansial & AI...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Jalankan Analisis Keputusan</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
