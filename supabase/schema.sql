-- =====================================================================
-- UMKM Insight AI - PostgreSQL & Supabase Database Schema
-- Multi-tenant Data Model with Row Level Security (RLS)
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUSINESS PROFILES
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    business_type TEXT NOT NULL CHECK (business_type IN ('planner', 'growth')),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BUSINESS ANALYSES (Snapshot Header)
CREATE TABLE IF NOT EXISTS public.business_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('planner', 'growth')),
    title TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FINANCIAL INPUTS & SNAPSHOTS (Immutable per analysis)
CREATE TABLE IF NOT EXISTS public.financial_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.business_analyses(id) ON DELETE CASCADE,
    raw_inputs JSONB NOT NULL,
    metrics JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SCENARIO SIMULATIONS
CREATE TABLE IF NOT EXISTS public.scenario_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.business_analyses(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL, -- 'Konservatif', 'Moderat', 'Optimistis'
    sales_volume NUMERIC NOT NULL,
    selling_price NUMERIC NOT NULL,
    variable_cost NUMERIC NOT NULL,
    fixed_cost NUMERIC NOT NULL,
    revenue NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    operating_profit NUMERIC NOT NULL,
    profit_margin_percent NUMERIC NOT NULL,
    bep_units NUMERIC,
    assumptions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RISK ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.business_analyses(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assessment_basis TEXT NOT NULL,
    potential_impact TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Rendah', 'Sedang', 'Tinggi', 'Kritis')),
    mitigation_steps JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AI RECOMMENDATIONS & NARRATIVES
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.business_analyses(id) ON DELETE CASCADE,
    executive_summary TEXT NOT NULL,
    strengths JSONB NOT NULL,
    weaknesses JSONB NOT NULL,
    financial_narrative TEXT NOT NULL,
    market_insights JSONB NOT NULL,
    alternative_models JSONB NOT NULL,
    action_plan JSONB NOT NULL,
    confidence_score JSONB NOT NULL,
    disclaimer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BUSINESS PERFORMANCE RECORDS (For Growth tracking over time)
CREATE TABLE IF NOT EXISTS public.business_performance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_profile_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    monthly_revenue NUMERIC NOT NULL,
    monthly_expenses NUMERIC NOT NULL,
    units_sold NUMERIC NOT NULL,
    net_profit NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Prinsip Least Privilege: Pengguna hanya dapat mengakses datanya sendiri
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_performance_records ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Business Profiles Policies
CREATE POLICY "Users can manage own business profiles" ON public.business_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Business Analyses Policies
CREATE POLICY "Users can manage own analyses" ON public.business_analyses
    FOR ALL USING (auth.uid() = user_id);

-- Child tables policies via analysis ownership
CREATE POLICY "Users can manage snapshots of own analyses" ON public.financial_snapshots
    FOR ALL USING (EXISTS (SELECT 1 FROM public.business_analyses WHERE id = financial_snapshots.analysis_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage scenarios of own analyses" ON public.scenario_simulations
    FOR ALL USING (EXISTS (SELECT 1 FROM public.business_analyses WHERE id = scenario_simulations.analysis_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage risks of own analyses" ON public.risk_assessments
    FOR ALL USING (EXISTS (SELECT 1 FROM public.business_analyses WHERE id = risk_assessments.analysis_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage AI reports of own analyses" ON public.ai_recommendations
    FOR ALL USING (EXISTS (SELECT 1 FROM public.business_analyses WHERE id = ai_recommendations.analysis_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage performance records of own business" ON public.business_performance_records
    FOR ALL USING (EXISTS (SELECT 1 FROM public.business_profiles WHERE id = business_performance_records.business_profile_id AND user_id = auth.uid()));
