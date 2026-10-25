export type ServiceType = "planner" | "growth";

export type ConfidenceLevel = "Rendah" | "Sedang" | "Tinggi";

export type RiskSeverity = "Rendah" | "Sedang" | "Tinggi" | "Kritis";

export interface PlannerFormData {
  businessName: string;
  category: string;
  location: string;
  businessModel: "toko_fisik" | "dari_rumah" | "pre_order" | "online" | "uji_pasar_terbatas" | "belum_tahu";
  availableCapital: number;
  targetMarket: string;
  productDescription: string;
  sellingPriceEstimate: number;
  variableCostPerUnitEstimate: number;
  estimatedInitialCost: number;
  monthlyFixedCostEstimate: number;
  expectedMonthlySalesVolume: number;
  previousExperience: "tidak_ada" | "kurang_dari_1_tahun" | "1_sampai_3_tahun" | "lebih_dari_3_tahun";
  notes?: string;
  unknownFields: string[]; // daftar field yang ditandai 'belum tahu'
}

export interface GrowthFormData {
  businessName: string;
  category: string;
  location: string;
  operatingDurationMonths: number;
  initialCapital: number;
  monthlyRevenue: number;
  monthlyFixedCost: number;
  sellingPrice: number;
  productionCostPerUnit: number;
  monthlyUnitsSold: number;
  topSellingProduct: string;
  lowSellingProduct: string;
  currentBottlenecks: string;
  growthTarget: string;
  notes?: string;
  unknownFields: string[];
}

export interface FinancialMetrics {
  totalInitialCost: number;
  totalMonthlyRevenue: number;
  totalMonthlyFixedCost: number;
  totalMonthlyVariableCost: number;
  totalMonthlyCost: number;
  monthlyOperatingProfit: number;
  profitMarginPercent: number;
  unitContributionMargin: number;
  contributionMarginRatio: number;
  bepUnits: number | null; // null jika kontribusi <= 0
  bepRevenue: number | null;
  isProfitable: boolean;
  capitalRunwayMonths: number | null; // berapa bulan modal bertahan jika belum impas
  capitalAdequacyStatus: "Mencukupi" | "Rentan" | "Kurang" | "Belum Cukup Data";
  explanation: string[];
  limitations: string[];
}

export interface ScenarioResult {
  scenarioName: "Konservatif" | "Moderat" | "Optimistis";
  salesVolume: number;
  sellingPrice: number;
  variableCostPerUnit: number;
  monthlyFixedCost: number;
  revenue: number;
  totalCost: number;
  operatingProfit: number;
  profitMarginPercent: number;
  bepUnits: number | null;
  assumptions: string[];
}

export interface RiskItem {
  id: string;
  category: "Modal & Arus Kas" | "Operasional & Biaya" | "Permintaan Pasar" | "Persaingan" | "Ketergantungan" | "Kualitas Data";
  title: string;
  description: string;
  assessmentBasis: string;
  potentialImpact: string;
  severity: RiskSeverity;
  mitigationSteps: string[];
  requiredAdditionalData?: string;
}

export interface MarketAssessment {
  status: "Analisis Pasar Terbatas (Input Mandiri)" | "Data Demo Terindikasi" | "Data Eksternal Terhubung";
  targetCustomerProfile: string;
  demandValidationStatus: "Belum Tervalidasi" | "Uji Pasar Terbatas" | "Tervalidasi Operasional";
  competitiveOverview: string;
  unverifiedDataNotice: string;
  recommendedValidationSteps: string[];
}

export interface FinancialReportSummary {
  period: string | null;
  revenue: number | null;
  costOfGoodsSold: number | null;
  grossProfit: number | null;
  operatingExpenses: number | null;
  netProfit: number | null;
  operatingCashFlow: number | null;
  investingCashFlow: number | null;
  financingCashFlow: number | null;
  endingCash: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalEquity: number | null;
  netProfitMarginPercent: number | null;
  consistencyChecks: string[];
}

export interface AIAnalysisReport {
  executiveSummary: string;
  businessStrengths: string[];
  businessWeaknesses: string[];
  financialAnalysisNarrative: string;
  marketInsights: MarketAssessment;
  alternativeModels: {
    modelName: string;
    pros: string;
    cons: string;
    capitalRequirementEstimate: string;
  }[];
  actionPlanBeforeInvestment: string[];
  dataConfidenceScore: {
    level: ConfidenceLevel;
    scorePercent: number;
    explanation: string;
    missingCriticalData: string[];
  };
  disclaimer: string;
  financialReportSummary?: FinancialReportSummary;
}

export interface BusinessAnalysisRecord {
  id: string;
  serviceType: ServiceType;
  businessName: string;
  category: string;
  location: string;
  createdAt: string;
  inputSnapshot: PlannerFormData | GrowthFormData;
  financialMetrics: FinancialMetrics;
  scenarios: ScenarioResult[];
  risks: RiskItem[];
  aiReport: AIAnalysisReport;
  version: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
}
