-- Füge margin Feld zur candidates Tabelle hinzu
ALTER TABLE public.candidates
ADD COLUMN margin numeric(10,2) DEFAULT 0;

COMMENT ON COLUMN public.candidates.margin IS 'Marge (absolute Zahl pro Monat), die zum Einkaufspreis addiert wird um den Verkaufspreis zu erhalten. Nur für Hej Talent Admins sichtbar/editierbar.';