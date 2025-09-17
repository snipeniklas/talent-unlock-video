import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import de from './de.json';
import en from './en.json';

export type SupportedLanguage = 'de' | 'en';

type Dictionary = Record<string, unknown>;

interface I18nContextValue {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  get: <T = unknown>(key: string, fallback?: T) => T;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const dictionaries: Record<SupportedLanguage, Dictionary> = { de, en };

function getByPath(dict: Dictionary, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dict);
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('lang') : null;
    return (stored === 'de' || stored === 'en') ? (stored as SupportedLanguage) : 'de';
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('lang', lang);
    } catch {}
  }, [lang]);

  const setLang = (next: SupportedLanguage) => setLangState(next);

  const t = useMemo(() => {
    const dict = dictionaries[lang];
    return (key: string, fallback?: string) => {
      const value = getByPath(dict, key);
      if (typeof value === 'string') return value as string;
      return fallback ?? key;
    };
  }, [lang]);

  const get = useMemo(() => {
    const dict = dictionaries[lang];
    return <T = unknown>(key: string, fallback?: T) => {
      const value = getByPath(dict, key);
      return (value as T) ?? (fallback as T);
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, get }), [lang, t, get]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
};
