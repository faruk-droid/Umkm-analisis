import { BusinessAnalysisRecord } from "@/types";
import { SAMPLE_GROWTH_DATA, SAMPLE_PLANNER_DATA } from "../sample-data";
import { calculateFinancialMetrics } from "../finance/calculator";
import { generateScenarios } from "../finance/scenario-engine";
import { assessBusinessRisks } from "../finance/risk-engine";
import { generateExpertRuleBasedReport } from "../ai/service";

const LOCAL_STORAGE_KEY = "umkm_insight_analyses_v1";

/**
 * Storage Abstraction Layer
 * Mendukung penyimpanan lokal browser (localStorage) untuk pengujian instan,
 * dan dapat dialihkan ke Supabase saat variabel lingkungan disiapkan.
 */

// Memory fallback untuk SSR
let memoryStore: Record<string, BusinessAnalysisRecord> = {};

export function createDemoRecord(type: "planner" | "growth"): BusinessAnalysisRecord {
  const isGrowth = type === "growth";
  const formData = isGrowth ? SAMPLE_GROWTH_DATA : SAMPLE_PLANNER_DATA;

  const financialParams = isGrowth
    ? {
        availableCapital: SAMPLE_GROWTH_DATA.initialCapital,
        initialSetupCost: 0,
        monthlyFixedCost: SAMPLE_GROWTH_DATA.monthlyFixedCost,
        sellingPricePerUnit: SAMPLE_GROWTH_DATA.sellingPrice,
        variableCostPerUnit: SAMPLE_GROWTH_DATA.productionCostPerUnit,
        estimatedMonthlyUnits: SAMPLE_GROWTH_DATA.monthlyUnitsSold,
      }
    : {
        availableCapital: SAMPLE_PLANNER_DATA.availableCapital,
        initialSetupCost: SAMPLE_PLANNER_DATA.estimatedInitialCost,
        monthlyFixedCost: SAMPLE_PLANNER_DATA.monthlyFixedCostEstimate,
        sellingPricePerUnit: SAMPLE_PLANNER_DATA.sellingPriceEstimate,
        variableCostPerUnit: SAMPLE_PLANNER_DATA.variableCostPerUnitEstimate,
        estimatedMonthlyUnits: SAMPLE_PLANNER_DATA.expectedMonthlySalesVolume,
      };

  const financials = calculateFinancialMetrics(financialParams);
  const scenarios = generateScenarios(financialParams);
  const risks = assessBusinessRisks(formData, financials, isGrowth);
  const aiReport = generateExpertRuleBasedReport(formData, financials, scenarios, risks, isGrowth);

  return {
    id: isGrowth ? "demo-growth-01" : "demo-planner-01",
    serviceType: type,
    businessName: formData.businessName,
    category: formData.category,
    location: formData.location,
    createdAt: new Date().toISOString(),
    inputSnapshot: formData,
    financialMetrics: financials,
    scenarios,
    risks,
    aiReport,
    version: "1.0",
  };
}

export const StorageService = {
  async listAnalyses(): Promise<BusinessAnalysisRecord[]> {
    if (typeof window === "undefined") {
      return Object.values(memoryStore);
    }

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) {
        // Inisialisasi dengan 2 contoh demo agar user langsung bisa menjelajah
        const initial = [createDemoRecord("planner"), createDemoRecord("growth")];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error("Failed to read local analyses", err);
      return [];
    }
  },

  async getAnalysis(id: string): Promise<BusinessAnalysisRecord | null> {
    const list = await this.listAnalyses();
    const found = list.find((item) => item.id === id);
    if (found) return found;

    // Fallback jika id demo diminta
    if (id === "demo-planner-01") return createDemoRecord("planner");
    if (id === "demo-growth-01") return createDemoRecord("growth");

    return null;
  },

  async saveAnalysis(record: BusinessAnalysisRecord): Promise<void> {
    if (typeof window === "undefined") {
      memoryStore[record.id] = record;
      return;
    }

    try {
      const list = await this.listAnalyses();
      const existingIdx = list.findIndex((item) => item.id === record.id);
      if (existingIdx >= 0) {
        list[existingIdx] = record;
      } else {
        list.unshift(record);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error("Failed to save analysis to localStorage", err);
    }
  },

  async deleteAnalysis(id: string): Promise<void> {
    if (typeof window === "undefined") {
      delete memoryStore[id];
      return;
    }
    try {
      const list = await this.listAnalyses();
      const filtered = list.filter((item) => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error("Failed to delete analysis", err);
    }
  },
};
