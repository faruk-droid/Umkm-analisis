"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessAnalysisRecord, PlannerFormData } from "@/types";
import { SAMPLE_PLANNER_DATA } from "@/lib/sample-data";
import { StorageService } from "@/lib/storage";
import { readJsonResponse } from "@/lib/api-response";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
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

      const record = await readJsonResponse<BusinessAnalysisRecord & { error?: string }>(res);
      if (!res.ok) {
        throw new Error(record.error || "Gagal memproses analisis rencana usaha.");
      }
      await StorageService.saveAnalysis(record);
      router.push(`/analysis/${record.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kendala saat menghasilkan analisis.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Flat Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1abc9c] text-white text-xs font-bold uppercase tracking-wider mb-2">
              <Building className="w-3.5 h-3.5" />
              <span>Jalur Calon Pengusaha (Business Planning)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2c3e50] uppercase tracking-wide">
              Formulir Evaluasi Rencana Usaha Baru
            </h1>
            <p className="mt-0.5 text-xs text-[#7f8c8d]">
              Masukkan estimasi awal Anda. Sistem akan menguji kelayakan dan titik impas secara deterministik.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseDemo}
            className="px-3.5 py-2 rounded bg-[#f39c12] hover:bg-[#e67e22] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-[#d35400] shadow-flat self-start transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Isi Data Demo (Kopi Seduh)</span>
          </button>
        </div>

        {/* 2018 Flat Step Progress Bar */}
        <div className="mt-6 grid grid-cols-4 gap-1.5">
          {[
            { num: 1, title: "1. Profil & Model" },
            { num: 2, title: "2. Modal & Biaya" },
            { num: 3, title: "3. Pasar & Target" },
            { num: 4, title: "4. Review & Hitung" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`p-2 text-center text-xs font-bold uppercase tracking-wider transition-colors border-b-4 ${
                step === s.num
                  ? "bg-[#2c3e50] text-white border-[#1abc9c]"
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

      {/* FLAT FORM CARD */}
      <form onSubmit={handleSubmit} className="bg-white rounded border border-slate-200 p-6 sm:p-8 shadow-flat border-t-4 border-[#1abc9c]">
        {/* STEP 1: Profil & Model Bisnis */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wide border-b-2 border-slate-100 pb-2">
              Tahap 1: Profil Usaha & Model Operasional
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Nama Rencana Bisnis <span className="text-[#e74c3c]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Contoh: Kopi Seduh Rumahan, Hijab Cantik, Bengkel Motor Cepat"
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c] focus:ring-1 focus:ring-[#1abc9c]"
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
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c] bg-white"
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
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Rencana Lokasi Usaha
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Bandung Timur (Dekat Kampus)"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-2">
                Model Usaha yang Diinginkan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: "dari_rumah", title: "Dari Rumah / Dapur Pribadi", desc: "Biaya sewa Rp 0, risiko modal terendah." },
                  { id: "pre_order", title: "Sistem Prapesan (Pre-Order)", desc: "Produksi setelah uang muka pelanggan masuk." },
                  { id: "online", title: "Penjualan Daring (Marketplace)", desc: "Fokus kanal online dan kurir ekspedisi." },
                  { id: "uji_pasar_terbatas", title: "Uji Pasar Terbatas (Booth/Bazar)", desc: "Tes minat 1-4 minggu sebelum kontrak sewa." },
                  { id: "toko_fisik", title: "Buka Toko / Ruko Mandiri", desc: "Sewa tahunan & renovasi di muka (Capex tinggi)." },
                  { id: "belum_tahu", title: "Saya Belum Menentukan", desc: "Minta rekomendasi sistem berdasarkan modal." },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-3 rounded border cursor-pointer text-left transition-all flex flex-col justify-between ${
                      formData.businessModel === item.id
                        ? "border-[#1abc9c] bg-[#e8f8f5] ring-1 ring-[#1abc9c]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#2c3e50]">{item.title}</span>
                      <input
                        type="radio"
                        name="businessModel"
                        value={item.id}
                        checked={formData.businessModel === item.id}
                        onChange={() => setFormData({ ...formData, businessModel: item.id as any })}
                        className="text-[#1abc9c] focus:ring-[#1abc9c]"
                      />
                    </div>
                    <span className="text-[11px] text-[#7f8c8d] mt-1">{item.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Struktur Modal & Biaya Finansial */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wide border-b-2 border-slate-100 pb-2">
              Tahap 2: Struktur Modal & Estimasi Biaya
            </h2>

            <div className="p-3 rounded bg-[#f4f6f9] border-l-4 border-[#3498db] text-xs text-[#2c3e50] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#3498db]" />
              <span>
                <strong>Prinsip Deterministik:</strong> Kami memisahkan belanja awal (Capex) dengan biaya tetap operasional bulanan (Opex) dan biaya variabel per unit agar kalkulasi titik impas (BEP) akurat.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Modal Tunai Tersedia Saat Ini (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={formData.availableCapital}
                  onChange={(e) => setFormData({ ...formData, availableCapital: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
                />
                <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                  Dana likuid untuk usaha.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#2c3e50] uppercase">
                    Estimasi Belanja Awal / Alat (Rp)
                  </label>
                  <label className="text-[11px] text-[#7f8c8d] flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnknown("initialCost")}
                      onChange={() => toggleUnknownField("initialCost")}
                      className="rounded text-[#1abc9c]"
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
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c] disabled:bg-slate-100"
                />
                <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                  Peralatan, mesin, renovasi (biaya 1x).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Rencana Harga Jual per Unit (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.sellingPriceEstimate}
                  onChange={(e) => setFormData({ ...formData, sellingPriceEstimate: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Estimasi Biaya Variabel per Unit (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.variableCostPerUnitEstimate}
                  onChange={(e) => setFormData({ ...formData, variableCostPerUnitEstimate: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
                />
                <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                  Bahan baku + kemasan per 1 unit.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#2c3e50] uppercase">
                    Biaya Tetap Bulanan (Rp)
                  </label>
                  <label className="text-[11px] text-[#7f8c8d] flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnknown("fixedCost")}
                      onChange={() => toggleUnknownField("fixedCost")}
                      className="rounded text-[#1abc9c]"
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
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c] disabled:bg-slate-100"
                />
                <span className="text-[11px] text-[#7f8c8d] mt-0.5 block">
                  Listrik, sewa, internet, gaji pokok.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                  Target Penjualan Bulanan (Unit)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.expectedMonthlySalesVolume}
                  onChange={(e) => setFormData({ ...formData, expectedMonthlySalesVolume: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Pasar, Produk, & Pengalaman */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wide border-b-2 border-slate-100 pb-2">
              Tahap 3: Target Pasar, Produk, & Pengalaman
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Deskripsi Produk / Layanan
              </label>
              <textarea
                rows={2}
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                placeholder="Jelaskan produk, keunggulan kualitas, atau kemasan yang ditawarkan..."
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Target Konsumen Utama
              </label>
              <input
                type="text"
                value={formData.targetMarket}
                onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                placeholder="Contoh: Mahasiswa dan pekerja kantor muda usia 20-35 tahun"
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Pengalaman Bisnis Sebelumnya
              </label>
              <select
                value={formData.previousExperience}
                onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c] bg-white"
              >
                <option value="tidak_ada">Belum ada pengalaman wirausaha (Pertama kali)</option>
                <option value="kurang_dari_1_tahun">Pernah mencoba usaha kurang dari 1 tahun</option>
                <option value="1_sampai_3_tahun">Memiliki pengalaman usaha 1 hingga 3 tahun</option>
                <option value="lebih_dari_3_tahun">Berpengalaman lebih dari 3 tahun</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Rencana saluran promosi atau strategi khusus..."
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#1abc9c]"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Review & Analisis */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-[#2c3e50] uppercase tracking-wide border-b-2 border-slate-100 pb-2">
              Tahap 4: Konfirmasi Data & Siap Analisis
            </h2>

            <div className="bg-[#f4f6f9] rounded p-4 border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[#7f8c8d]">Nama Bisnis:</span>
                <span className="font-bold text-[#2c3e50]">{formData.businessName || "(Belum diisi)"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[#7f8c8d]">Kategori & Lokasi:</span>
                <span className="font-bold text-[#2c3e50]">{formData.category} • {formData.location || "Belum ditentukan"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[#7f8c8d]">Modal Tersedia:</span>
                <span className="font-bold text-[#27ae60]">Rp {formData.availableCapital.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[#7f8c8d]">Belanja Awal (Capex):</span>
                <span className="font-bold text-[#2c3e50]">Rp {formData.estimatedInitialCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[#7f8c8d]">Estimasi Margin Kontribusi:</span>
                <span className="font-bold text-[#1abc9c]">
                  Rp {(formData.sellingPriceEstimate - formData.variableCostPerUnitEstimate).toLocaleString("id-ID")} / unit
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7f8c8d]">Target Volume Bulanan:</span>
                <span className="font-bold text-[#2c3e50]">{formData.expectedMonthlySalesVolume} unit</span>
              </div>
            </div>

            {formData.unknownFields.length > 0 && (
              <div className="p-3 rounded bg-[#fef9e7] border-l-4 border-[#f39c12] text-xs text-[#7d6608]">
                <strong>Catatan Kelengkapan:</strong> Anda menandai {formData.unknownFields.length} kolom dengan &quot;Belum Tahu&quot;. Analisis akan menyertakan batas ketidakpastian.
              </div>
            )}
          </div>
        )}

        {/* Flat Navigation Buttons */}
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
              className="px-5 py-2 rounded bg-[#1abc9c] hover:bg-[#16a085] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-[#117a65] shadow-flat transition-colors"
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
                  <span>Memproses Perhitungan & AI...</span>
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
