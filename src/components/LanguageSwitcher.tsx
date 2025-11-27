import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/i18n/i18n";

const FlagDE = () => (
  <svg className="w-5 h-4 rounded-sm" viewBox="0 0 640 480">
    <rect width="640" height="160" fill="#000"/>
    <rect y="160" width="640" height="160" fill="#D00"/>
    <rect y="320" width="640" height="160" fill="#FFCE00"/>
  </svg>
);

const FlagUS = () => (
  <svg className="w-5 h-4 rounded-sm" viewBox="0 0 640 480">
    <defs>
      <clipPath id="us-flag"><path d="M0 0h640v480H0z"/></clipPath>
    </defs>
    <g clipPath="url(#us-flag)">
      <path fill="#b22234" d="M0 0h640v480H0z"/>
      <path stroke="#fff" strokeWidth="37" d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"/>
      <path fill="#3c3b6e" d="M0 0h364.8v258.5H0z"/>
      <g fill="#fff">
        <g id="us-star">
          <g id="us-star-4">
            <path id="us-star-1" d="m29.4 18.5 2.3 7.1h7.5l-6 4.4 2.3 7-6.1-4.4-6 4.4 2.2-7-6-4.3h7.5z"/>
            <use href="#us-star-1" y="74"/>
            <use href="#us-star-1" y="148"/>
            <use href="#us-star-1" y="222"/>
          </g>
          <use href="#us-star-4" x="60.8"/>
          <use href="#us-star-4" x="121.6"/>
          <use href="#us-star-4" x="182.4"/>
          <use href="#us-star-4" x="243.2"/>
          <use href="#us-star-4" x="304"/>
        </g>
        <use href="#us-star" y="37"/>
      </g>
    </g>
  </svg>
);

const FlagNL = () => (
  <svg className="w-5 h-4 rounded-sm" viewBox="0 0 640 480">
    <rect width="640" height="160" fill="#AE1C28"/>
    <rect y="160" width="640" height="160" fill="#FFF"/>
    <rect y="320" width="640" height="160" fill="#21468B"/>
  </svg>
);

export default function LanguageSwitcher() {
  // Add error handling for translation context
  let lang = 'de';
  let setLang = (newLang: string) => {};
  
  try {
    const translation = useTranslation();
    lang = translation.lang;
    setLang = translation.setLang;
  } catch (error) {
    // If translation context is not available yet, use defaults
    console.warn('Translation context not available, using defaults');
  }

  const languages = [
    { code: 'de', name: 'Deutsch', flag: <FlagDE /> },
    { code: 'en', name: 'English', flag: <FlagUS /> },
    { code: 'nl', name: 'Nederlands', flag: <FlagNL /> }
  ];

  return (
    <Select value={lang} onValueChange={setLang}>
      <SelectTrigger className="w-auto min-w-[120px] h-9">
        <SelectValue>
          <div className="flex items-center gap-2">
            {languages.find(l => l.code === lang)?.flag}
            <span className="hidden sm:inline">
              {languages.find(l => l.code === lang)?.name}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              {language.flag}
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}