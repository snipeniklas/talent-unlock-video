-- Create candidate enums
CREATE TYPE seniority AS ENUM ('junior','mid','senior','lead');
CREATE TYPE availability_status AS ENUM ('immediately','notice_period','booked','paused');
CREATE TYPE proficiency AS ENUM ('basic','conversational','fluent','native');

-- 1) Kandidat (Kernprofil) — Skills als JSONB-Array
CREATE TABLE public.candidates (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid,                          -- optional
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  primary_role         text,                           -- z.B. "Customer Support", "Full-Stack Dev"
  seniority            seniority,
  years_experience     numeric(4,1),

  headline             text,                           -- Kurzpitch
  bio                  text,                           -- längere Beschreibung

  availability         availability_status DEFAULT 'immediately',
  hours_per_week_pref  int,
  start_earliest       date,
  notice_period_days   int,

  currency             text DEFAULT 'EUR',
  rate_hourly_target   numeric(10,2),
  rate_monthly_target  numeric(10,2),

  -- Skills inline (Beispielobjekte: { "name":"React","level":4,"years_used":3.5,"last_used":"2024-12-01" })
  skills               jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Freiheitsfeld für MVP
  attributes           jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 2) Identität (ohne email/phone/timezone)
CREATE TABLE public.candidate_identity (
  candidate_id   uuid PRIMARY KEY REFERENCES public.candidates(id) ON DELETE CASCADE,
  first_name     text,
  last_name      text,
  country        text,
  city           text
);

-- 3) Sprachen
CREATE TABLE public.candidate_languages (
  candidate_id   uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
  lang_code      text,                  -- ISO 639-1: "de","en","es"
  proficiency    proficiency,
  PRIMARY KEY (candidate_id, lang_code)
);

-- 4) Erfahrung (Jobs/Projekte)
CREATE TABLE public.candidate_experience (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id   uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
  title          text,                  -- "Kundensupport Agent", "Backend Dev"
  org_name       text,                  -- Kunde/Arbeitgeber (oder anonym)
  start_date     date,
  end_date       date,                  -- NULL = laufend
  summary        text,                  -- kurze Stichpunkte
  tech_stack     jsonb                  -- z.B. ["Zendesk","Shopify"] oder ["Go","Postgres"]
);

-- 5) Links/Portfolio/Case Studies
CREATE TABLE public.candidate_links (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id   uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
  label          text,                  -- "GitHub", "Portfolio", "Case Study"
  url            text
);

-- Indizes (schlank)
CREATE INDEX candidates_tenant_idx       ON public.candidates (tenant_id);
CREATE INDEX candidates_availability_idx ON public.candidates (availability);
CREATE INDEX candidates_role_idx         ON public.candidates (primary_role);
CREATE INDEX candidates_skills_gin       ON public.candidates USING gin (skills jsonb_path_ops);
CREATE INDEX candidates_attrs_gin        ON public.candidates USING gin (attributes jsonb_path_ops);
CREATE INDEX candexp_cand_start_idx      ON public.candidate_experience (candidate_id, start_date DESC);

-- Enable RLS on all tables
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can manage candidates
CREATE POLICY "Admins can manage candidates" 
ON public.candidates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage candidate identity" 
ON public.candidate_identity 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage candidate languages" 
ON public.candidate_languages 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage candidate experience" 
ON public.candidate_experience 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage candidate links" 
ON public.candidate_links 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();