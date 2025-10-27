-- Erweitere die crm_contact_research Tabelle um separate Felder für Kontakt- und Unternehmensresearch
ALTER TABLE public.crm_contact_research 
  RENAME COLUMN research_data TO contact_research_data;

ALTER TABLE public.crm_contact_research 
  ADD COLUMN company_research_data JSONB DEFAULT '{}'::jsonb;